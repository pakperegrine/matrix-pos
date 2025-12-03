import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashShift } from '../../entities/cash-shift.entity';
import { CashMovement } from '../../entities/cash-movement.entity';
import { DrawerEvent } from '../../entities/drawer-event.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CashManagementService {
  constructor(
    @InjectRepository(CashShift)
    private cashShiftRepo: Repository<CashShift>,
    @InjectRepository(CashMovement)
    private cashMovementRepo: Repository<CashMovement>,
    @InjectRepository(DrawerEvent)
    private drawerEventRepo: Repository<DrawerEvent>,
  ) {}

  // ===== SHIFT MANAGEMENT =====

  async getActiveShift(businessId: string, cashierId: string): Promise<CashShift | null> {
    return await this.cashShiftRepo.findOne({
      where: { businessId, cashierId, status: 'open' },
      order: { openingTime: 'DESC' }
    });
  }

  async openShift(data: {
    businessId: string;
    cashierId: string;
    terminalId?: string;
    openingFloat: number;
    supervisorId?: string;
    notes?: string;
  }): Promise<CashShift> {
    // Check if cashier already has an open shift
    const existingShift = await this.getActiveShift(data.businessId, data.cashierId);
    if (existingShift) {
      throw new BadRequestException('Cashier already has an open shift');
    }

    // Generate shift number (get max shift number + 1)
    const lastShift = await this.cashShiftRepo.findOne({
      where: { businessId: data.businessId },
      order: { shiftNumber: 'DESC' }
    });
    const shiftNumber = (lastShift?.shiftNumber || 0) + 1;

    const shift = this.cashShiftRepo.create({
      id: uuidv4(),
      businessId: data.businessId,
      cashierId: data.cashierId,
      terminalId: data.terminalId,
      shiftNumber: shiftNumber,
      openingFloat: data.openingFloat,
      openingTime: new Date(),
      openingApprovedBy: data.supervisorId,
      openingApprovedAt: data.supervisorId ? new Date() : null,
      expectedCash: data.openingFloat,
      status: 'open',
      notes: data.notes
    });

    const savedShift = await this.cashShiftRepo.save(shift);

    // Log drawer open event
    await this.logDrawerEvent({
      shiftId: savedShift.id,
      businessId: data.businessId,
      terminalId: data.terminalId,
      eventType: 'shift_open',
      openedBy: data.cashierId,
      reason: 'Shift opened'
    });

    return savedShift;
  }

  async closeShift(data: {
    shiftId: string;
    businessId: string;
    actualCash: number;
    supervisorId: string;
    notes?: string;
  }): Promise<CashShift> {
    const shift = await this.cashShiftRepo.findOne({
      where: { id: data.shiftId, businessId: data.businessId }
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    if (shift.status !== 'open') {
      throw new BadRequestException('Shift is not open');
    }

    // Calculate variance
    const variance = data.actualCash - shift.expectedCash;

    shift.status = 'closed';
    shift.actualCash = data.actualCash;
    shift.variance = variance;
    shift.closingTime = new Date();
    shift.closingApprovedBy = data.supervisorId;
    shift.closingApprovedAt = new Date();
    if (data.notes) {
      shift.notes = (shift.notes ? shift.notes + '\n' : '') + data.notes;
    }

    const closedShift = await this.cashShiftRepo.save(shift);

    // Log drawer event
    await this.logDrawerEvent({
      shiftId: shift.id,
      businessId: data.businessId,
      terminalId: shift.terminalId,
      eventType: 'shift_close',
      openedBy: shift.cashierId,
      reason: 'Shift closed'
    });

    return closedShift;
  }

  async getShiftDetails(shiftId: string, businessId: string): Promise<any> {
    const shift = await this.cashShiftRepo.findOne({
      where: { id: shiftId, businessId }
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    const movements = await this.cashMovementRepo.find({
      where: { shiftId },
      order: { createdAt: 'ASC' }
    });

    const drawerEvents = await this.drawerEventRepo.find({
      where: { shiftId },
      order: { createdAt: 'ASC' }
    });

    return {
      shift,
      movements,
      drawerEvents,
      summary: {
        totalCashIn: movements
          .filter(m => m.movementType === 'cash_in')
          .reduce((sum, m) => sum + Number(m.amount), 0),
        totalCashOut: movements
          .filter(m => m.movementType === 'cash_out')
          .reduce((sum, m) => sum + Number(m.amount), 0),
        totalCashDrops: movements
          .filter(m => m.movementType === 'cash_drop')
          .reduce((sum, m) => sum + Number(m.amount), 0),
        totalCashSales: movements
          .filter(m => m.movementType === 'sale')
          .reduce((sum, m) => sum + Number(m.amount), 0)
      }
    };
  }

  // ===== CASH MOVEMENTS =====

  async recordCashMovement(data: {
    shiftId: string;
    businessId: string;
    movementType: 'cash_in' | 'cash_out' | 'cash_drop';
    amount: number;
    reason: string;
    notes?: string;
    performedBy: string;
    approvedBy: string;
    referenceType?: string;
    referenceId?: string;
  }): Promise<CashMovement> {
    const shift = await this.cashShiftRepo.findOne({
      where: { id: data.shiftId, businessId: data.businessId }
    });

    if (!shift || shift.status !== 'open') {
      throw new BadRequestException('No active shift found');
    }

    const movement = this.cashMovementRepo.create({
      id: uuidv4(),
      shiftId: data.shiftId,
      businessId: data.businessId,
      movementType: data.movementType,
      amount: data.amount,
      reason: data.reason,
      notes: data.notes,
      performedBy: data.performedBy,
      approvedBy: data.approvedBy,
      approvedAt: new Date(),
      referenceType: data.referenceType,
      referenceId: data.referenceId
    });

    const savedMovement = await this.cashMovementRepo.save(movement);

    // Update shift expected cash
    if (data.movementType === 'cash_in') {
      shift.expectedCash = Number(shift.expectedCash) + Number(data.amount);
    } else if (data.movementType === 'cash_out' || data.movementType === 'cash_drop') {
      shift.expectedCash = Number(shift.expectedCash) - Number(data.amount);
    }
    await this.cashShiftRepo.save(shift);

    // Log drawer event
    await this.logDrawerEvent({
      shiftId: data.shiftId,
      businessId: data.businessId,
      terminalId: shift.terminalId,
      eventType: 'cash_movement',
      openedBy: data.performedBy,
      referenceType: data.movementType,
      referenceId: savedMovement.id,
      reason: data.reason
    });

    return savedMovement;
  }

  async recordSale(data: {
    shiftId: string;
    businessId: string;
    amount: number;
    invoiceId: string;
    performedBy: string;
  }): Promise<CashMovement> {
    const shift = await this.cashShiftRepo.findOne({
      where: { id: data.shiftId, businessId: data.businessId }
    });

    if (!shift || shift.status !== 'open') {
      throw new BadRequestException('No active shift found');
    }

    const movement = this.cashMovementRepo.create({
      id: uuidv4(),
      shiftId: data.shiftId,
      businessId: data.businessId,
      movementType: 'sale',
      amount: data.amount,
      reason: 'Cash sale',
      performedBy: data.performedBy,
      referenceType: 'invoice',
      referenceId: data.invoiceId
    });

    const savedMovement = await this.cashMovementRepo.save(movement);

    // Update shift totals
    shift.expectedCash = Number(shift.expectedCash) + Number(data.amount);
    shift.totalCashSales = Number(shift.totalCashSales) + Number(data.amount);
    shift.totalSales = Number(shift.totalSales) + Number(data.amount);
    await this.cashShiftRepo.save(shift);

    // Log drawer event
    await this.logDrawerEvent({
      shiftId: data.shiftId,
      businessId: data.businessId,
      terminalId: shift.terminalId,
      eventType: 'sale',
      openedBy: data.performedBy,
      referenceType: 'invoice',
      referenceId: data.invoiceId,
      reason: 'Sale completed'
    });

    return savedMovement;
  }

  // ===== DRAWER EVENTS =====

  async logDrawerEvent(data: {
    shiftId?: string;
    businessId: string;
    terminalId?: string;
    eventType: 'manual_open' | 'sale' | 'refund' | 'cash_movement' | 'shift_open' | 'shift_close';
    openedBy: string;
    referenceType?: string;
    referenceId?: string;
    reason?: string;
  }): Promise<DrawerEvent> {
    const event = this.drawerEventRepo.create({
      id: uuidv4(),
      ...data
    });

    return await this.drawerEventRepo.save(event);
  }

  async openDrawerManually(data: {
    shiftId?: string;
    businessId: string;
    terminalId?: string;
    openedBy: string;
    reason: string;
  }): Promise<DrawerEvent> {
    return await this.logDrawerEvent({
      ...data,
      eventType: 'manual_open'
    });
  }

  // ===== REPORTS =====

  async getXReport(shiftId: string, businessId: string): Promise<any> {
    const details = await this.getShiftDetails(shiftId, businessId);
    
    return {
      reportType: 'X Report (Mid-Shift)',
      shiftNumber: details.shift.shiftNumber,
      cashier: details.shift.cashierId,
      openingTime: details.shift.openingTime,
      reportTime: new Date(),
      
      openingFloat: details.shift.openingFloat,
      totalCashSales: details.shift.totalCashSales,
      totalCardSales: details.shift.totalCardSales,
      totalSales: details.shift.totalSales,
      
      cashIn: details.summary.totalCashIn,
      cashOut: details.summary.totalCashOut,
      cashDrops: details.summary.totalCashDrops,
      
      expectedCash: details.shift.expectedCash,
      
      movements: details.movements,
      drawerOpens: details.drawerEvents.length
    };
  }

  async getZReport(shiftId: string, businessId: string): Promise<any> {
    const details = await this.getShiftDetails(shiftId, businessId);
    
    if (details.shift.status === 'open') {
      throw new BadRequestException('Cannot generate Z Report for open shift');
    }

    return {
      reportType: 'Z Report (End of Shift)',
      shiftNumber: details.shift.shiftNumber,
      cashier: details.shift.cashierId,
      openingTime: details.shift.openingTime,
      closingTime: details.shift.closingTime,
      
      openingFloat: details.shift.openingFloat,
      totalCashSales: details.shift.totalCashSales,
      totalCardSales: details.shift.totalCardSales,
      totalSales: details.shift.totalSales,
      totalDiscounts: details.shift.totalDiscounts,
      totalRefunds: details.shift.totalRefunds,
      
      cashIn: details.summary.totalCashIn,
      cashOut: details.summary.totalCashOut,
      cashDrops: details.summary.totalCashDrops,
      
      expectedCash: details.shift.expectedCash,
      actualCash: details.shift.actualCash,
      variance: details.shift.variance,
      
      movements: details.movements,
      drawerOpens: details.drawerEvents.length,
      
      closedBy: details.shift.closingApprovedBy,
      notes: details.shift.notes
    };
  }

  async getShiftHistory(businessId: string, limit = 50, offset = 0): Promise<any> {
    const [shifts, total] = await this.cashShiftRepo.findAndCount({
      where: { businessId },
      order: { openingTime: 'DESC' },
      take: limit,
      skip: offset
    });

    return {
      shifts,
      total,
      limit,
      offset
    };
  }
}
