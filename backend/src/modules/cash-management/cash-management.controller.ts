import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CashManagementService } from './cash-management.service';

@Controller('cash-management')
export class CashManagementController {
  constructor(private readonly cashManagementService: CashManagementService) {}

  // ===== SHIFT ENDPOINTS =====

  @Get('shift/active')
  async getActiveShift(@Request() req) {
    const businessId = req.user?.businessId || req.headers['x-business-id'];
    const cashierId = req.user?.userId || req.headers['x-user-id'];
    return await this.cashManagementService.getActiveShift(businessId, cashierId);
  }

  @Post('shift/open')
  async openShift(@Request() req, @Body() body: {
    terminalId?: string;
    openingFloat: number;
    supervisorId?: string;
    supervisorPin?: string;
    notes?: string;
  }) {
    const businessId = req.user?.businessId || req.headers['x-business-id'];
    const cashierId = req.user?.userId || req.headers['x-user-id'];

    // TODO: Validate supervisor PIN if provided

    return await this.cashManagementService.openShift({
      businessId,
      cashierId,
      ...body
    });
  }

  @Post('shift/:shiftId/close')
  async closeShift(
    @Request() req,
    @Param('shiftId') shiftId: string,
    @Body() body: {
      actualCash: number;
      supervisorId: string;
      supervisorPin: string;
      notes?: string;
    }
  ) {
    const businessId = req.user?.businessId || req.headers['x-business-id'];

    // TODO: Validate supervisor PIN

    return await this.cashManagementService.closeShift({
      shiftId,
      businessId,
      actualCash: body.actualCash,
      supervisorId: body.supervisorId,
      notes: body.notes
    });
  }

  @Get('shift/:shiftId')
  async getShiftDetails(@Request() req, @Param('shiftId') shiftId: string) {
    const businessId = req.user?.businessId || req.headers['x-business-id'];
    return await this.cashManagementService.getShiftDetails(shiftId, businessId);
  }

  @Get('shifts/history')
  async getShiftHistory(
    @Request() req,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0
  ) {
    const businessId = req.user?.businessId || req.headers['x-business-id'];
    return await this.cashManagementService.getShiftHistory(businessId, +limit, +offset);
  }

  // ===== CASH MOVEMENT ENDPOINTS =====

  @Post('movement/cash-in')
  async cashIn(@Request() req, @Body() body: {
    shiftId: string;
    amount: number;
    reason: string;
    notes?: string;
    supervisorId: string;
    supervisorPin: string;
  }) {
    const businessId = req.user?.businessId || req.headers['x-business-id'];
    const performedBy = req.user?.userId || req.headers['x-user-id'];

    // TODO: Validate supervisor PIN

    return await this.cashManagementService.recordCashMovement({
      shiftId: body.shiftId,
      businessId,
      movementType: 'cash_in',
      amount: body.amount,
      reason: body.reason,
      notes: body.notes,
      performedBy,
      approvedBy: body.supervisorId
    });
  }

  @Post('movement/cash-out')
  async cashOut(@Request() req, @Body() body: {
    shiftId: string;
    amount: number;
    reason: string;
    notes?: string;
    supervisorId: string;
    supervisorPin: string;
  }) {
    const businessId = req.user?.businessId || req.headers['x-business-id'];
    const performedBy = req.user?.userId || req.headers['x-user-id'];

    // TODO: Validate supervisor PIN

    return await this.cashManagementService.recordCashMovement({
      shiftId: body.shiftId,
      businessId,
      movementType: 'cash_out',
      amount: body.amount,
      reason: body.reason,
      notes: body.notes,
      performedBy,
      approvedBy: body.supervisorId
    });
  }

  @Post('movement/cash-drop')
  async cashDrop(@Request() req, @Body() body: {
    shiftId: string;
    amount: number;
    notes?: string;
    supervisorId: string;
    supervisorPin: string;
  }) {
    const businessId = req.user?.businessId || req.headers['x-business-id'];
    const performedBy = req.user?.userId || req.headers['x-user-id'];

    // TODO: Validate supervisor PIN

    return await this.cashManagementService.recordCashMovement({
      shiftId: body.shiftId,
      businessId,
      movementType: 'cash_drop',
      amount: body.amount,
      reason: 'Cash drop to safe',
      notes: body.notes,
      performedBy,
      approvedBy: body.supervisorId
    });
  }

  @Post('movement/sale')
  async recordSale(@Request() req, @Body() body: {
    shiftId: string;
    amount: number;
    invoiceId: string;
  }) {
    const businessId = req.user?.businessId || req.headers['x-business-id'];
    const performedBy = req.user?.userId || req.headers['x-user-id'];

    return await this.cashManagementService.recordSale({
      shiftId: body.shiftId,
      businessId,
      amount: body.amount,
      invoiceId: body.invoiceId,
      performedBy
    });
  }

  // ===== DRAWER ENDPOINTS =====

  @Post('drawer/open')
  async openDrawer(@Request() req, @Body() body: {
    shiftId?: string;
    terminalId?: string;
    reason: string;
  }) {
    const businessId = req.user?.businessId || req.headers['x-business-id'];
    const openedBy = req.user?.userId || req.headers['x-user-id'];

    return await this.cashManagementService.openDrawerManually({
      shiftId: body.shiftId,
      businessId,
      terminalId: body.terminalId,
      openedBy,
      reason: body.reason
    });
  }

  // ===== REPORT ENDPOINTS =====

  @Get('reports/x-report/:shiftId')
  async getXReport(@Request() req, @Param('shiftId') shiftId: string) {
    const businessId = req.user?.businessId || req.headers['x-business-id'];
    return await this.cashManagementService.getXReport(shiftId, businessId);
  }

  @Get('reports/z-report/:shiftId')
  async getZReport(@Request() req, @Param('shiftId') shiftId: string) {
    const businessId = req.user?.businessId || req.headers['x-business-id'];
    return await this.cashManagementService.getZReport(shiftId, businessId);
  }
}
