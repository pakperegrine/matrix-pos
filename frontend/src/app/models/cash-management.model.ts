export interface CashShift {
  id: string;
  businessId: string;
  cashierId: string;
  terminalId?: string;
  shiftNumber: number;
  openingFloat: number;
  openingTime: Date;
  openingApprovedBy?: string;
  openingApprovedAt?: Date;
  expectedCash: number;
  actualCash: number;
  variance: number;
  closingTime?: Date;
  closingApprovedBy?: string;
  closingApprovedAt?: Date;
  status: 'open' | 'closed' | 'reconciling';
  notes?: string;
  totalCashSales: number;
  totalCardSales: number;
  totalSales: number;
  totalDiscounts: number;
  totalRefunds: number;
  totalVoids: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CashMovement {
  id: string;
  shiftId: string;
  businessId: string;
  movementType: 'cash_in' | 'cash_out' | 'cash_drop' | 'sale' | 'refund';
  amount: number;
  reason?: string;
  notes?: string;
  performedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  referenceType?: string;
  referenceId?: string;
  createdAt: Date;
}

export interface DrawerEvent {
  id: string;
  shiftId?: string;
  businessId: string;
  terminalId?: string;
  eventType: 'manual_open' | 'sale' | 'refund' | 'cash_movement' | 'shift_open' | 'shift_close';
  reason?: string;
  openedBy: string;
  referenceType?: string;
  referenceId?: string;
  createdAt: Date;
}

export interface ShiftDetails {
  shift: CashShift;
  movements: CashMovement[];
  drawerEvents: DrawerEvent[];
  summary: {
    totalCashIn: number;
    totalCashOut: number;
    totalCashDrops: number;
    totalCashSales: number;
  };
}

export interface XReport {
  reportType: string;
  shiftNumber: number;
  cashier: string;
  openingTime: Date;
  reportTime: Date;
  openingFloat: number;
  totalCashSales: number;
  totalCardSales: number;
  totalSales: number;
  cashIn: number;
  cashOut: number;
  cashDrops: number;
  expectedCash: number;
  movements: CashMovement[];
  drawerOpens: number;
}

export interface ZReport extends XReport {
  closingTime: Date;
  actualCash: number;
  variance: number;
  totalDiscounts: number;
  totalRefunds: number;
  closedBy: string;
  notes?: string;
}
