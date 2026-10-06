import { AppState, Account, JournalEntry, Transaction, InventoryItem, Livestock, BusinessUnit, Barn, Customer, Supplier, FixedAsset, FinancialPeriod, User, ProductionRecord, LivestockMovement, InventoryMovement } from './types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'sipeternak_data';

// Default Chart of Accounts
const defaultAccounts: Account[] = [
  // Assets
  { id: 'a1', code: '1-1000', name: 'Kas', type: 'asset', normalBalance: 'debit', isActive: true },
  { id: 'a2', code: '1-1100', name: 'Bank', type: 'asset', normalBalance: 'debit', isActive: true },
  { id: 'a3', code: '1-1200', name: 'Piutang Usaha', type: 'asset', normalBalance: 'debit', isActive: true },
  { id: 'a4', code: '1-1300', name: 'Persediaan Pakan', type: 'asset', normalBalance: 'debit', isActive: true },
  { id: 'a5', code: '1-1310', name: 'Persediaan Obat', type: 'asset', normalBalance: 'debit', isActive: true },
  { id: 'a6', code: '1-1320', name: 'Persediaan Vitamin', type: 'asset', normalBalance: 'debit', isActive: true },
  { id: 'a7', code: '1-1330', name: 'Persediaan Bahan', type: 'asset', normalBalance: 'debit', isActive: true },
  { id: 'a8', code: '1-1340', name: 'Persediaan Produk Peternakan', type: 'asset', normalBalance: 'debit', isActive: true },
  { id: 'a9', code: '1-1400', name: 'Ternak', type: 'asset', normalBalance: 'debit', isActive: true },
  { id: 'a10', code: '1-1500', name: 'Tanah', type: 'asset', normalBalance: 'debit', isActive: true },
  { id: 'a11', code: '1-1600', name: 'Bangunan', type: 'asset', normalBalance: 'debit', isActive: true },
  { id: 'a12', code: '1-1610', name: 'Kandang', type: 'asset', normalBalance: 'debit', isActive: true },
  { id: 'a13', code: '1-1700', name: 'Mesin', type: 'asset', normalBalance: 'debit', isActive: true },
  { id: 'a14', code: '1-1800', name: 'Peralatan', type: 'asset', normalBalance: 'debit', isActive: true },
  { id: 'a15', code: '1-1900', name: 'Kendaraan', type: 'asset', normalBalance: 'debit', isActive: true },
  { id: 'a16', code: '1-1950', name: 'Akumulasi Penyusutan', type: 'asset', normalBalance: 'credit', isActive: true },
  // Liabilities
  { id: 'l1', code: '2-1000', name: 'Utang Usaha', type: 'liability', normalBalance: 'credit', isActive: true },
  { id: 'l2', code: '2-1100', name: 'Utang Gaji', type: 'liability', normalBalance: 'credit', isActive: true },
  { id: 'l3', code: '2-1200', name: 'Utang Pembelian Pakan', type: 'liability', normalBalance: 'credit', isActive: true },
  { id: 'l4', code: '2-1300', name: 'Utang Bank', type: 'liability', normalBalance: 'credit', isActive: true },
  { id: 'l5', code: '2-1900', name: 'Liabilitas Lainnya', type: 'liability', normalBalance: 'credit', isActive: true },
  // Equity
  { id: 'e1', code: '3-1000', name: 'Modal Pemilik', type: 'equity', normalBalance: 'credit', isActive: true },
  { id: 'e2', code: '3-1100', name: 'Prive', type: 'equity', normalBalance: 'debit', isActive: true },
  { id: 'e3', code: '3-1200', name: 'Laba Ditahan', type: 'equity', normalBalance: 'credit', isActive: true },
  { id: 'e4', code: '3-1300', name: 'Laba/Rugi Berjalan', type: 'equity', normalBalance: 'credit', isActive: true },
  // Revenue
  { id: 'r1', code: '4-1000', name: 'Penjualan Ternak', type: 'revenue', normalBalance: 'credit', isActive: true },
  { id: 'r2', code: '4-1100', name: 'Penjualan Telur', type: 'revenue', normalBalance: 'credit', isActive: true },
  { id: 'r3', code: '4-1200', name: 'Penjualan Susu', type: 'revenue', normalBalance: 'credit', isActive: true },
  { id: 'r4', code: '4-1300', name: 'Penjualan Daging', type: 'revenue', normalBalance: 'credit', isActive: true },
  { id: 'r5', code: '4-1400', name: 'Penjualan DOC/Anakan', type: 'revenue', normalBalance: 'credit', isActive: true },
  { id: 'r6', code: '4-1500', name: 'Penjualan Pupuk Kandang', type: 'revenue', normalBalance: 'credit', isActive: true },
  { id: 'r7', code: '4-1900', name: 'Pendapatan Lainnya', type: 'revenue', normalBalance: 'credit', isActive: true },
  // Expenses
  { id: 'x1', code: '5-1000', name: 'Beban Pakan', type: 'expense', normalBalance: 'debit', isActive: true },
  { id: 'x2', code: '5-1100', name: 'Beban Obat', type: 'expense', normalBalance: 'debit', isActive: true },
  { id: 'x3', code: '5-1200', name: 'Beban Vitamin', type: 'expense', normalBalance: 'debit', isActive: true },
  { id: 'x4', code: '5-1300', name: 'Beban Tenaga Kerja', type: 'expense', normalBalance: 'debit', isActive: true },
  { id: 'x5', code: '5-1400', name: 'Beban Listrik', type: 'expense', normalBalance: 'debit', isActive: true },
  { id: 'x6', code: '5-1500', name: 'Beban Air', type: 'expense', normalBalance: 'debit', isActive: true },
  { id: 'x7', code: '5-1600', name: 'Beban Transportasi', type: 'expense', normalBalance: 'debit', isActive: true },
  { id: 'x8', code: '5-1700', name: 'Beban Pemeliharaan', type: 'expense', normalBalance: 'debit', isActive: true },
  { id: 'x9', code: '5-1800', name: 'Beban Penyusutan', type: 'expense', normalBalance: 'debit', isActive: true },
  { id: 'x10', code: '5-1900', name: 'Beban Sewa', type: 'expense', normalBalance: 'debit', isActive: true },
  { id: 'x11', code: '5-2000', name: 'Beban Administrasi', type: 'expense', normalBalance: 'debit', isActive: true },
  { id: 'x12', code: '5-2100', name: 'Beban Pemasaran', type: 'expense', normalBalance: 'debit', isActive: true },
  { id: 'x13', code: '5-2900', name: 'Beban Lainnya', type: 'expense', normalBalance: 'debit', isActive: true },
];

const defaultBusinessUnits: BusinessUnit[] = [
  { id: 'bu1', name: 'Peternakan Ayam Petelur', description: 'Unit usaha ayam petelur', isActive: true },
  { id: 'bu2', name: 'Peternakan Sapi Perah', description: 'Unit usaha sapi perah', isActive: true },
  { id: 'bu3', name: 'Peternakan Kambing', description: 'Unit usaha kambing', isActive: true },
];

const defaultBarns: Barn[] = [
  { id: 'b1', name: 'Kandang A - Layer', location: 'Area Utara', capacity: 5000, businessUnitId: 'bu1' },
  { id: 'b2', name: 'Kandang B - Sapi', location: 'Area Selatan', capacity: 50, businessUnitId: 'bu2' },
  { id: 'b3', name: 'Kandang C - Kambing', location: 'Area Timur', capacity: 100, businessUnitId: 'bu3' },
];

const defaultCustomers: Customer[] = [
  { id: 'c1', name: 'Toko Sembako Berkah', phone: '081234567890', address: 'Jl. Merdeka No. 10', email: 'berkah@email.com' },
  { id: 'c2', name: 'Warung Makan Sederhana', phone: '081234567891', address: 'Jl. Sudirman No. 25', email: '' },
  { id: 'c3', name: 'Pasar Induk Kota', phone: '081234567892', address: 'Pasar Induk Blok C', email: '' },
];

const defaultSuppliers: Supplier[] = [
  { id: 's1', name: 'PT Pakan Nusantara', phone: '081345678901', address: 'Kawasan Industri Blok A', email: 'sales@pakannusantara.com' },
  { id: 's2', name: 'CV Obat Hewan Sejahtera', phone: '081345678902', address: 'Jl. Veteriner No. 5', email: '' },
  { id: 's3', name: 'UD Hijauan Segar', phone: '081345678903', address: 'Desa Sukamaju', email: '' },
];

const defaultUsers: User[] = [
  { id: 'u1', name: 'Administrator', role: 'admin', email: 'admin@sipeternak.com', isActive: true },
  { id: 'u2', name: 'Budi Santoso', role: 'owner', email: 'budi@sipeternak.com', isActive: true },
  { id: 'u3', name: 'Siti Rahayu', role: 'accountant', email: 'siti@sipeternak.com', isActive: true },
  { id: 'u4', name: 'Ahmad Fauzi', role: 'farm_worker', email: 'ahmad@sipeternak.com', isActive: true },
];

const defaultFinancialPeriods: FinancialPeriod[] = [
  { id: 'fp1', name: 'Januari 2026', startDate: '2026-01-01', endDate: '2026-01-31', status: 'closed', isAdjusting: false },
  { id: 'fp2', name: 'Februari 2026', startDate: '2026-02-01', endDate: '2026-02-28', status: 'open', isAdjusting: false },
];

// Demo Journal Entries
const demoJournalEntries: JournalEntry[] = [
  {
    id: 'j1', number: 'JU-2026-001', date: '2026-02-01', reference: 'MODAL-AWAL',
    description: 'Setoran modal awal pemilik',
    entries: [
      { id: 'jl1', accountId: 'a1', description: 'Kas', debit: 500000000, credit: 0 },
      { id: 'jl2', accountId: 'e1', description: 'Modal Pemilik', debit: 0, credit: 500000000 },
    ],
    businessUnit: 'bu1', status: 'posted', createdAt: '2026-02-01T08:00:00Z', createdBy: 'u1'
  },
  {
    id: 'j2', number: 'JU-2026-002', date: '2026-02-02', reference: 'BELI-PAKAN-001',
    description: 'Pembelian pakan ayam 5 ton dari PT Pakan Nusantara',
    entries: [
      { id: 'jl3', accountId: 'a4', description: 'Persediaan Pakan', debit: 25000000, credit: 0 },
      { id: 'jl4', accountId: 'a1', description: 'Kas', debit: 0, credit: 25000000 },
    ],
    businessUnit: 'bu1', costCenter: 'Kandang A', status: 'posted', createdAt: '2026-02-02T09:00:00Z', createdBy: 'u3'
  },
  {
    id: 'j3', number: 'JU-2026-003', date: '2026-02-03', reference: 'JUAL-TELUR-001',
    description: 'Penjualan 500 butir telur ke Toko Sembako Berkah',
    entries: [
      { id: 'jl5', accountId: 'a1', description: 'Kas', debit: 750000, credit: 0 },
      { id: 'jl6', accountId: 'r2', description: 'Penjualan Telur', debit: 0, credit: 750000 },
    ],
    businessUnit: 'bu1', costCenter: 'Kandang A', status: 'posted', createdAt: '2026-02-03T10:00:00Z', createdBy: 'u3'
  },
  {
    id: 'j4', number: 'JU-2026-004', date: '2026-02-05', reference: 'GAJI-001',
    description: 'Pembayaran gaji karyawan bulan Februari',
    entries: [
      { id: 'jl7', accountId: 'x4', description: 'Beban Tenaga Kerja', debit: 8000000, credit: 0 },
      { id: 'jl8', accountId: 'a1', description: 'Kas', debit: 0, credit: 8000000 },
    ],
    businessUnit: 'bu1', status: 'posted', createdAt: '2026-02-05T11:00:00Z', createdBy: 'u3'
  },
  {
    id: 'j5', number: 'JU-2026-005', date: '2026-02-07', reference: 'BELI-OBAT-001',
    description: 'Pembelian obat dan vitamin ternak',
    entries: [
      { id: 'jl9', accountId: 'a5', description: 'Persediaan Obat', debit: 3000000, credit: 0 },
      { id: 'jl10', accountId: 'a6', description: 'Persediaan Vitamin', debit: 2000000, credit: 0 },
      { id: 'jl11', accountId: 'a1', description: 'Kas', debit: 0, credit: 5000000 },
    ],
    businessUnit: 'bu1', status: 'posted', createdAt: '2026-02-07T09:30:00Z', createdBy: 'u3'
  },
  {
    id: 'j6', number: 'JU-2026-006', date: '2026-02-10', reference: 'JUAL-SUSU-001',
    description: 'Penjualan 200 liter susu sapi',
    entries: [
      { id: 'jl12', accountId: 'a1', description: 'Kas', debit: 4000000, credit: 0 },
      { id: 'jl13', accountId: 'r3', description: 'Penjualan Susu', debit: 0, credit: 4000000 },
    ],
    businessUnit: 'bu2', costCenter: 'Kandang B', status: 'posted', createdAt: '2026-02-10T10:00:00Z', createdBy: 'u3'
  },
  {
    id: 'j7', number: 'JU-2026-007', date: '2026-02-12', reference: 'LISTRIK-001',
    description: 'Pembayaran listrik bulan Februari',
    entries: [
      { id: 'jl14', accountId: 'x5', description: 'Beban Listrik', debit: 2500000, credit: 0 },
      { id: 'jl15', accountId: 'a1', description: 'Kas', debit: 0, credit: 2500000 },
    ],
    businessUnit: 'bu1', status: 'posted', createdAt: '2026-02-12T14:00:00Z', createdBy: 'u3'
  },
  {
    id: 'j8', number: 'JU-2026-008', date: '2026-02-15', reference: 'JUAL-TELUR-002',
    description: 'Penjualan 800 butir telur ke Pasar Induk (kredit)',
    entries: [
      { id: 'jl16', accountId: 'a3', description: 'Piutang Usaha', debit: 1200000, credit: 0 },
      { id: 'jl17', accountId: 'r2', description: 'Penjualan Telur', debit: 0, credit: 1200000 },
    ],
    businessUnit: 'bu1', costCenter: 'Kandang A', status: 'posted', createdAt: '2026-02-15T08:00:00Z', createdBy: 'u3'
  },
  {
    id: 'j9', number: 'JU-2026-009', date: '2026-02-18', reference: 'BELI-TERNAK-001',
    description: 'Pembelian 50 ekor ayam petelur siap produksi',
    entries: [
      { id: 'jl18', accountId: 'a9', description: 'Ternak', debit: 15000000, credit: 0 },
      { id: 'jl19', accountId: 'a1', description: 'Kas', debit: 0, credit: 15000000 },
    ],
    businessUnit: 'bu1', status: 'posted', createdAt: '2026-02-18T09:00:00Z', createdBy: 'u3'
  },
  {
    id: 'j10', number: 'JU-2026-010', date: '2026-02-20', reference: 'PAKAN-PAKAI-001',
    description: 'Pemakaian pakan untuk produksi minggu ke-3',
    entries: [
      { id: 'jl20', accountId: 'x1', description: 'Beban Pakan', debit: 12000000, credit: 0 },
      { id: 'jl21', accountId: 'a4', description: 'Persediaan Pakan', debit: 0, credit: 12000000 },
    ],
    businessUnit: 'bu1', costCenter: 'Kandang A', status: 'posted', createdAt: '2026-02-20T10:00:00Z', createdBy: 'u3'
  },
  {
    id: 'j11', number: 'JU-2026-011', date: '2026-02-22', reference: 'JUAL-TELUR-003',
    description: 'Penjualan 600 butir telur tunai',
    entries: [
      { id: 'jl22', accountId: 'a1', description: 'Kas', debit: 900000, credit: 0 },
      { id: 'jl23', accountId: 'r2', description: 'Penjualan Telur', debit: 0, credit: 900000 },
    ],
    businessUnit: 'bu1', costCenter: 'Kandang A', status: 'posted', createdAt: '2026-02-22T11:00:00Z', createdBy: 'u3'
  },
  {
    id: 'j12', number: 'JU-2026-012', date: '2026-02-25', reference: 'AIR-001',
    description: 'Pembayaran air bulan Februari',
    entries: [
      { id: 'jl24', accountId: 'x6', description: 'Beban Air', debit: 800000, credit: 0 },
      { id: 'jl25', accountId: 'a1', description: 'Kas', debit: 0, credit: 800000 },
    ],
    businessUnit: 'bu1', status: 'posted', createdAt: '2026-02-25T14:00:00Z', createdBy: 'u3'
  },
];

const demoTransactions: Transaction[] = [
  { id: 't1', type: 'general', date: '2026-02-01', number: 'TRX-001', description: 'Setoran modal awal', journalId: 'j1', status: 'completed', createdAt: '2026-02-01T08:00:00Z' },
  { id: 't2', type: 'cash_payment', date: '2026-02-02', number: 'TRX-002', description: 'Pembelian pakan tunai', journalId: 'j2', relatedParty: 'PT Pakan Nusantara', status: 'completed', createdAt: '2026-02-02T09:00:00Z' },
  { id: 't3', type: 'cash_receipt', date: '2026-02-03', number: 'TRX-003', description: 'Penjualan telur tunai', journalId: 'j3', relatedParty: 'Toko Sembako Berkah', status: 'completed', createdAt: '2026-02-03T10:00:00Z' },
  { id: 't4', type: 'cash_payment', date: '2026-02-05', number: 'TRX-004', description: 'Pembayaran gaji', journalId: 'j4', status: 'completed', createdAt: '2026-02-05T11:00:00Z' },
  { id: 't5', type: 'cash_payment', date: '2026-02-07', number: 'TRX-005', description: 'Pembelian obat & vitamin', journalId: 'j5', relatedParty: 'CV Obat Hewan Sejahtera', status: 'completed', createdAt: '2026-02-07T09:30:00Z' },
  { id: 't6', type: 'cash_receipt', date: '2026-02-10', number: 'TRX-006', description: 'Penjualan susu', journalId: 'j6', relatedParty: 'Pasar Induk Kota', status: 'completed', createdAt: '2026-02-10T10:00:00Z' },
  { id: 't7', type: 'cash_payment', date: '2026-02-12', number: 'TRX-007', description: 'Pembayaran listrik', journalId: 'j7', status: 'completed', createdAt: '2026-02-12T14:00:00Z' },
  { id: 't8', type: 'credit_sale', date: '2026-02-15', number: 'TRX-008', description: 'Penjualan telur kredit', journalId: 'j8', relatedParty: 'Pasar Induk Kota', dueDate: '2026-03-15', status: 'completed', createdAt: '2026-02-15T08:00:00Z' },
  { id: 't9', type: 'livestock_purchase', date: '2026-02-18', number: 'TRX-009', description: 'Pembelian 50 ekor ayam', journalId: 'j9', relatedParty: 'Peternak Lokal', status: 'completed', createdAt: '2026-02-18T09:00:00Z' },
  { id: 't10', type: 'inventory_out', date: '2026-02-20', number: 'TRX-010', description: 'Pemakaian pakan', journalId: 'j10', status: 'completed', createdAt: '2026-02-20T10:00:00Z' },
  { id: 't11', type: 'cash_receipt', date: '2026-02-22', number: 'TRX-011', description: 'Penjualan telur tunai', journalId: 'j11', relatedParty: 'Warung Makan Sederhana', status: 'completed', createdAt: '2026-02-22T11:00:00Z' },
  { id: 't12', type: 'cash_payment', date: '2026-02-25', number: 'TRX-012', description: 'Pembayaran air', journalId: 'j12', status: 'completed', createdAt: '2026-02-25T14:00:00Z' },
];

const demoInventory: InventoryItem[] = [
  { id: 'inv1', code: 'PAK-001', name: 'Pakan Layer P-2100', category: 'feed', unit: 'kg', stock: 3500, minStock: 1000, pricePerUnit: 5000, totalValue: 17500000, location: 'Gudang Pakan', businessUnit: 'bu1', lastUpdated: '2026-02-20' },
  { id: 'inv2', code: 'PAK-002', name: 'Konsentrat Sapi', category: 'concentrate', unit: 'kg', stock: 500, minStock: 200, pricePerUnit: 7000, totalValue: 3500000, location: 'Gudang Pakan', businessUnit: 'bu2', lastUpdated: '2026-02-15' },
  { id: 'inv3', code: 'OBT-001', name: 'Vaksin ND (Newcastle Disease)', category: 'vaccine', unit: 'dosis', stock: 200, minStock: 50, pricePerUnit: 3000, totalValue: 600000, location: 'Lemari Obat', businessUnit: 'bu1', lastUpdated: '2026-02-07' },
  { id: 'inv4', code: 'OBT-002', name: 'Antibiotik Ternak', category: 'medicine', unit: 'botol', stock: 30, minStock: 10, pricePerUnit: 50000, totalValue: 1500000, location: 'Lemari Obat', businessUnit: 'bu1', lastUpdated: '2026-02-07' },
  { id: 'inv5', code: 'VIT-001', name: 'Vitamin Mix Ternak', category: 'vitamin', unit: 'kg', stock: 25, minStock: 5, pricePerUnit: 80000, totalValue: 2000000, location: 'Gudang Pakan', businessUnit: 'bu1', lastUpdated: '2026-02-07' },
  { id: 'inv6', code: 'HIJ-001', name: 'Rumput Gajah', category: 'forage', unit: 'kg', stock: 800, minStock: 300, pricePerUnit: 1500, totalValue: 1200000, location: 'Area Hijauan', businessUnit: 'bu2', lastUpdated: '2026-02-18' },
  { id: 'inv7', code: 'PRD-001', name: 'Telur Ayam (siap jual)', category: 'supplies', unit: 'butir', stock: 1200, minStock: 200, pricePerUnit: 1500, totalValue: 1800000, location: 'Gudang Produk', businessUnit: 'bu1', lastUpdated: '2026-02-22' },
];

const demoLivestock: Livestock[] = [
  { id: 'lv1', code: 'AYM-001', type: 'Ayam', breed: 'Lohmann Brown', gender: 'female', birthDate: '2025-06-01', weight: 1.8, status: 'active', location: 'Kandang A', acquisitionCost: 300000, currentValue: 280000, source: 'Pembelian', businessUnit: 'bu1' },
  { id: 'lv2', code: 'AYM-002', type: 'Ayam', breed: 'Isa Brown', gender: 'female', birthDate: '2025-07-15', weight: 1.7, status: 'active', location: 'Kandang A', acquisitionCost: 300000, currentValue: 285000, source: 'Pembelian', businessUnit: 'bu1' },
  { id: 'lv3', code: 'SAP-001', type: 'Sapi', breed: 'FH (Friesian Holstein)', gender: 'female', birthDate: '2023-03-10', weight: 450, status: 'active', location: 'Kandang B', acquisitionCost: 25000000, currentValue: 23000000, source: 'Pembelian', businessUnit: 'bu2' },
  { id: 'lv4', code: 'SAP-002', type: 'Sapi', breed: 'FH (Friesian Holstein)', gender: 'female', birthDate: '2023-05-20', weight: 430, status: 'active', location: 'Kandang B', acquisitionCost: 24000000, currentValue: 22000000, source: 'Pembelian', businessUnit: 'bu2' },
  { id: 'lv5', code: 'KMB-001', type: 'Kambing', breed: 'Etawa', gender: 'male', birthDate: '2024-01-15', weight: 45, status: 'active', location: 'Kandang C', acquisitionCost: 3500000, currentValue: 3200000, source: 'Pembelian', businessUnit: 'bu3' },
  { id: 'lv6', code: 'KMB-002', type: 'Kambing', breed: 'Boer', gender: 'female', birthDate: '2024-04-10', weight: 38, status: 'active', location: 'Kandang C', acquisitionCost: 2800000, currentValue: 2600000, source: 'Pembelian', businessUnit: 'bu3' },
];

const demoProductionRecords: ProductionRecord[] = [
  { id: 'pr1', date: '2026-02-01', businessUnitId: 'bu1', livestockType: 'Ayam', productType: 'eggs', quantity: 450, unit: 'butir' },
  { id: 'pr2', date: '2026-02-05', businessUnitId: 'bu1', livestockType: 'Ayam', productType: 'eggs', quantity: 480, unit: 'butir' },
  { id: 'pr3', date: '2026-02-10', businessUnitId: 'bu2', livestockType: 'Sapi', productType: 'milk', quantity: 200, unit: 'liter', weight: 205 },
  { id: 'pr4', date: '2026-02-15', businessUnitId: 'bu1', livestockType: 'Ayam', productType: 'eggs', quantity: 500, unit: 'butir' },
  { id: 'pr5', date: '2026-02-20', businessUnitId: 'bu1', livestockType: 'Ayam', productType: 'eggs', quantity: 470, unit: 'butir' },
  { id: 'pr6', date: '2026-02-22', businessUnitId: 'bu2', livestockType: 'Sapi', productType: 'milk', quantity: 180, unit: 'liter', weight: 185 },
  { id: 'pr7', date: '2026-02-25', businessUnitId: 'bu1', livestockType: 'Ayam', productType: 'eggs', quantity: 490, unit: 'butir' },
  { id: 'pr8', date: '2026-02-28', businessUnitId: 'bu3', livestockType: 'Kambing', productType: 'manure', quantity: 50, unit: 'kg' },
];

const demoFixedAssets: FixedAsset[] = [
  { id: 'fa1', code: 'FA-001', name: 'Kandang Ayam Layer', category: 'Bangunan', acquisitionDate: '2024-01-15', acquisitionCost: 150000000, residualValue: 15000000, usefulLife: 20, depreciationMethod: 'straight_line', accumulatedDepreciation: 14250000, currentValue: 135750000, accountId: 'a12', depreciationAccountId: 'a16' },
  { id: 'fa2', code: 'FA-002', name: 'Kandang Sapi', category: 'Bangunan', acquisitionDate: '2023-06-01', acquisitionCost: 200000000, residualValue: 20000000, usefulLife: 20, depreciationMethod: 'straight_line', accumulatedDepreciation: 33750000, currentValue: 166250000, accountId: 'a12', depreciationAccountId: 'a16' },
  { id: 'fa3', code: 'FA-003', name: 'Mesin Inkubator', category: 'Mesin', acquisitionDate: '2025-03-01', acquisitionCost: 25000000, residualValue: 2500000, usefulLife: 10, depreciationMethod: 'straight_line', accumulatedDepreciation: 4687500, currentValue: 20312500, accountId: 'a13', depreciationAccountId: 'a16' },
  { id: 'fa4', code: 'FA-004', name: 'Mobil Pickup', category: 'Kendaraan', acquisitionDate: '2024-08-01', acquisitionCost: 180000000, residualValue: 36000000, usefulLife: 8, depreciationMethod: 'straight_line', accumulatedDepreciation: 30937500, currentValue: 149062500, accountId: 'a15', depreciationAccountId: 'a16' },
];

const demoLivestockMovements: LivestockMovement[] = [
  { id: 'lm1', livestockId: 'lv1', type: 'purchase', date: '2025-06-01', quantity: 1, description: 'Pembelian ayam Lohmann Brown', value: 300000 },
  { id: 'lm2', livestockId: 'lv2', type: 'purchase', date: '2025-07-15', quantity: 1, description: 'Pembelian ayam Isa Brown', value: 300000 },
  { id: 'lm3', livestockId: 'lv3', type: 'purchase', date: '2023-03-10', quantity: 1, description: 'Pembelian sapi FH', value: 25000000 },
  { id: 'lm4', livestockId: 'lv4', type: 'purchase', date: '2023-05-20', quantity: 1, description: 'Pembelian sapi FH', value: 24000000 },
  { id: 'lm5', livestockId: 'lv5', type: 'purchase', date: '2024-01-15', quantity: 1, description: 'Pembelian kambing Etawa', value: 3500000 },
  { id: 'lm6', livestockId: 'lv6', type: 'purchase', date: '2024-04-10', quantity: 1, description: 'Pembelian kambing Boer', value: 2800000 },
];

const demoInventoryMovements: InventoryMovement[] = [
  { id: 'im1', itemId: 'inv1', type: 'in', date: '2026-02-02', quantity: 5000, pricePerUnit: 5000, totalValue: 25000000, description: 'Pembelian pakan dari PT Pakan Nusantara', reference: 'PO-001' },
  { id: 'im2', itemId: 'inv1', type: 'out', date: '2026-02-20', quantity: 1500, pricePerUnit: 5000, totalValue: 7500000, description: 'Pemakaian pakan minggu ke-3', reference: 'USE-001' },
  { id: 'im3', itemId: 'inv1', type: 'out', date: '2026-02-25', quantity: 0, pricePerUnit: 5000, totalValue: 4500000, description: 'Pemakaian pakan minggu ke-4', reference: 'USE-002' },
  { id: 'im4', itemId: 'inv4', type: 'in', date: '2026-02-07', quantity: 30, pricePerUnit: 50000, totalValue: 1500000, description: 'Pembelian antibiotik', reference: 'PO-002' },
  { id: 'im5', itemId: 'inv5', type: 'in', date: '2026-02-07', quantity: 25, pricePerUnit: 80000, totalValue: 2000000, description: 'Pembelian vitamin mix', reference: 'PO-003' },
];

function getDefaultState(): AppState {
  return {
    accounts: defaultAccounts,
    journalEntries: demoJournalEntries,
    transactions: demoTransactions,
    livestock: demoLivestock,
    livestockMovements: demoLivestockMovements,
    inventory: demoInventory,
    inventoryMovements: demoInventoryMovements,
    businessUnits: defaultBusinessUnits,
    barns: defaultBarns,
    customers: defaultCustomers,
    suppliers: defaultSuppliers,
    fixedAssets: demoFixedAssets,
    financialPeriods: defaultFinancialPeriods,
    adjustments: [],
    auditLogs: [],
    users: defaultUsers,
    productionRecords: demoProductionRecords,
  };
}

export function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading state:', e);
  }
  const defaultState = getDefaultState();
  saveState(defaultState);
  return defaultState;
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving state:', e);
  }
}

export function resetState(): AppState {
  const defaultState = getDefaultState();
  saveState(defaultState);
  return defaultState;
}

export function generateId(): string {
  return uuidv4();
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}
