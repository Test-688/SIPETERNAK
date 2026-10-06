// ==================== TYPES ====================

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
export type NormalBalance = 'debit' | 'credit';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  normalBalance: NormalBalance;
  parentId?: string;
  isActive: boolean;
  description?: string;
}

export interface JournalEntry {
  id: string;
  number: string;
  date: string;
  reference: string;
  description: string;
  entries: JournalLine[];
  costCenter?: string;
  businessUnit?: string;
  status: 'draft' | 'posted' | 'adjusted' | 'closed';
  createdAt: string;
  createdBy: string;
}

export interface JournalLine {
  id: string;
  accountId: string;
  description: string;
  debit: number;
  credit: number;
}

export interface Transaction {
  id: string;
  type: 'cash_receipt' | 'cash_payment' | 'credit_sale' | 'credit_purchase' | 'livestock_purchase' | 'livestock_sale' | 'inventory_in' | 'inventory_out' | 'adjustment' | 'general';
  date: string;
  number: string;
  description: string;
  journalId: string;
  businessUnit?: string;
  costCenter?: string;
  relatedParty?: string;
  dueDate?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Livestock {
  id: string;
  code: string;
  type: string;
  breed: string;
  gender: 'male' | 'female';
  birthDate: string;
  weight: number;
  status: 'active' | 'sold' | 'dead' | 'transferred';
  location: string;
  acquisitionCost: number;
  currentValue: number;
  source: string;
  businessUnit?: string;
}

export interface LivestockMovement {
  id: string;
  livestockId: string;
  type: 'purchase' | 'birth' | 'addition' | 'sale' | 'death' | 'transfer' | 'reduction' | 'adjustment';
  date: string;
  quantity: number;
  description: string;
  value?: number;
  fromLocation?: string;
  toLocation?: string;
  journalId?: string;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: 'feed' | 'concentrate' | 'forage' | 'medicine' | 'vitamin' | 'vaccine' | 'material' | 'packaging' | 'supplies';
  unit: string;
  stock: number;
  minStock: number;
  pricePerUnit: number;
  totalValue: number;
  location: string;
  businessUnit?: string;
  lastUpdated: string;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment';
  date: string;
  quantity: number;
  pricePerUnit: number;
  totalValue: number;
  description: string;
  fromLocation?: string;
  toLocation?: string;
  reference?: string;
  journalId?: string;
}

export interface BusinessUnit {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface Barn {
  id: string;
  name: string;
  location: string;
  capacity: number;
  businessUnitId: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
}

export interface FixedAsset {
  id: string;
  code: string;
  name: string;
  category: string;
  acquisitionDate: string;
  acquisitionCost: number;
  residualValue: number;
  usefulLife: number;
  depreciationMethod: 'straight_line' | 'double_declining';
  accumulatedDepreciation: number;
  currentValue: number;
  accountId: string;
  depreciationAccountId: string;
}

export interface FinancialPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'open' | 'closed';
  isAdjusting: boolean;
}

export interface AdjustmentEntry {
  id: string;
  type: 'depreciation' | 'accrued_expense' | 'accrued_revenue' | 'prepaid_expense' | 'inventory_used' | 'inventory_adjustment' | 'livestock_adjustment' | 'livestock_death_loss' | 'other';
  date: string;
  description: string;
  journalId: string;
  periodId: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
  action: string;
  module: string;
  dataBefore?: string;
  dataAfter?: string;
  ipAddress?: string;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'owner' | 'accountant' | 'farm_worker' | 'auditor';
  email: string;
  isActive: boolean;
}

export interface ProductionRecord {
  id: string;
  date: string;
  businessUnitId: string;
  livestockType: string;
  productType: 'eggs' | 'milk' | 'meat' | 'doc' | 'manure' | 'other';
  quantity: number;
  unit: string;
  weight?: number;
}

export interface AppState {
  accounts: Account[];
  journalEntries: JournalEntry[];
  transactions: Transaction[];
  livestock: Livestock[];
  livestockMovements: LivestockMovement[];
  inventory: InventoryItem[];
  inventoryMovements: InventoryMovement[];
  businessUnits: BusinessUnit[];
  barns: Barn[];
  customers: Customer[];
  suppliers: Supplier[];
  fixedAssets: FixedAsset[];
  financialPeriods: FinancialPeriod[];
  adjustments: AdjustmentEntry[];
  auditLogs: AuditLog[];
  users: User[];
  productionRecords: ProductionRecord[];
}
