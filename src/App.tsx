import { useState, useEffect, useMemo } from 'react';
import { AppState, Account, JournalEntry, JournalLine, InventoryItem, Livestock, Transaction } from './types';
import { loadState, saveState, generateId, formatCurrency, formatDate } from './store';
import { calculateAccountBalance, getTrialBalance, validateJournalBalance, calculateIncomeStatement, calculateBalanceSheet, calculateCashFlow, calculateProductionCost, getDashboardMetrics } from './utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { LayoutDashboard, BookOpen, FileText, Package, TrendingUp, Users, Settings, Menu, X, ChevronDown, Plus, Edit, Trash2, AlertCircle, CheckCircle, DollarSign, ShoppingCart, ArrowUpRight, ArrowDownRight, BarChart3, PieChart as PieChartIcon, Activity, Database, FileSpreadsheet, Printer } from 'lucide-react';

type ViewType = 'dashboard' | 'accounts' | 'transactions' | 'journal' | 'ledger' | 'trial-balance' | 'adjustments' | 'reports' | 'livestock' | 'inventory' | 'production' | 'assets' | 'close-book' | 'analytics' | 'settings';

const COLORS = ['#166534', '#15803d', '#16a34a', '#22c55e', '#4ade80', '#86efac', '#d4a017', '#f59e0b', '#ef4444', '#3b82f6'];

export default function App() {
  const [state, setState] = useState<AppState>(loadState());
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [filterPeriod, setFilterPeriod] = useState('monthly');

  useEffect(() => { saveState(state); }, [state]);

  const metrics = useMemo(() => getDashboardMetrics(state), [state]);

  const menuItems: { id: ViewType; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'livestock', label: 'Data Peternakan', icon: Activity },
    { id: 'inventory', label: 'Persediaan', icon: Package },
    { id: 'production', label: 'Produksi', icon: TrendingUp },
    { id: 'transactions', label: 'Transaksi', icon: ShoppingCart },
    { id: 'journal', label: 'Jurnal', icon: BookOpen },
    { id: 'ledger', label: 'Buku Besar', icon: FileText },
    { id: 'trial-balance', label: 'Neraca Saldo', icon: FileSpreadsheet },
    { id: 'adjustments', label: 'Penyesuaian', icon: Edit },
    { id: 'accounts', label: 'Chart of Accounts', icon: Database },
    { id: 'assets', label: 'Aset Tetap', icon: DollarSign },
    { id: 'reports', label: 'Laporan Keuangan', icon: FileText },
    { id: 'production', label: 'Biaya Produksi', icon: BarChart3 },
    { id: 'close-book', label: 'Tutup Buku', icon: Settings },
    { id: 'analytics', label: 'Analitik', icon: PieChartIcon },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} bg-gradient-to-b from-green-900 to-green-800 text-white transition-all duration-300 flex-shrink-0`}>
        <div className="p-4 border-b border-green-700">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <span className="text-yellow-400">🐄</span> SIPETERNAK
          </h1>
          <p className="text-xs text-green-300 mt-1">Accounting System</p>
        </div>
        <nav className="p-2 overflow-y-auto h-[calc(100vh-80px)]">
          {menuItems.map(item => (
            <button
              key={item.id + item.label}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 transition-colors ${currentView === item.id ? 'bg-green-700 text-yellow-300' : 'hover:bg-green-700/50 text-green-100'}`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="text-lg font-semibold text-gray-800">
              {menuItems.find(m => m.id === currentView)?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <select value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)} className="text-sm border rounded-lg px-3 py-1.5">
              <option value="daily">Harian</option>
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
              <option value="quarterly">Triwulanan</option>
              <option value="yearly">Tahunan</option>
            </select>
            <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center text-white text-sm font-bold">A</div>
          </div>
        </header>

        <div className="p-6">
          {currentView === 'dashboard' && <DashboardView state={state} metrics={metrics} />}
          {currentView === 'accounts' && <AccountsView state={state} setState={setState} />}
          {currentView === 'transactions' && <TransactionsView state={state} setState={setState} />}
          {currentView === 'journal' && <JournalView state={state} setState={setState} />}
          {currentView === 'ledger' && <LedgerView state={state} />}
          {currentView === 'trial-balance' && <TrialBalanceView state={state} />}
          {currentView === 'adjustments' && <AdjustmentsView state={state} setState={setState} />}
          {currentView === 'reports' && <ReportsView state={state} />}
          {currentView === 'livestock' && <LivestockView state={state} setState={setState} />}
          {currentView === 'inventory' && <InventoryView state={state} setState={setState} />}
          {currentView === 'production' && <ProductionView state={state} />}
          {currentView === 'assets' && <AssetsView state={state} setState={setState} />}
          {currentView === 'close-book' && <CloseBookView state={state} setState={setState} />}
          {currentView === 'analytics' && <AnalyticsView state={state} metrics={metrics} />}
          {currentView === 'settings' && <SettingsView state={state} setState={setState} />}
        </div>
      </main>
    </div>
  );
}

// ==================== DASHBOARD ====================
function DashboardView({ state, metrics }: { state: AppState; metrics: any }) {
  const revenueByType = state.journalEntries.filter(j => j.status === 'posted').flatMap(j => j.entries).filter(e => {
    const acc = state.accounts.find(a => a.id === e.accountId);
    return acc?.type === 'revenue';
  }).reduce((acc: any, e) => {
    const acc2 = state.accounts.find(a => a.id === e.accountId)!;
    acc[acc2.name] = (acc[acc2.name] || 0) + e.credit;
    return acc;
  }, {});

  const revenueChartData = Object.entries(revenueByType).map(([name, value]) => ({ name: name.replace('Penjualan ', ''), value: value as number }));
  const expenseChartData = [
    { name: 'Pakan', value: metrics.feedCost },
    { name: 'Obat/Vit', value: metrics.medicineCost },
    { name: 'Tenaga Kerja', value: metrics.laborCost },
    { name: 'Listrik', value: Math.abs(calculateAccountBalance('x5', state.journalEntries)) },
    { name: 'Air', value: Math.abs(calculateAccountBalance('x6', state.journalEntries)) },
  ].filter(d => d.value > 0);

  const monthlyData = [
    { month: 'Jan', pendapatan: 2500000, biaya: 1800000 },
    { month: 'Feb', pendapatan: metrics.totalRevenue, biaya: metrics.totalExpenses },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <MetricCard title="Total Kas" value={formatCurrency(metrics.cash)} icon="💰" color="bg-green-50 border-green-200" />
        <MetricCard title="Saldo Bank" value={formatCurrency(metrics.bank)} icon="🏦" color="bg-blue-50 border-blue-200" />
        <MetricCard title="Pendapatan" value={formatCurrency(metrics.totalRevenue)} icon="📈" color="bg-emerald-50 border-emerald-200" />
        <MetricCard title="Total Biaya" value={formatCurrency(metrics.totalExpenses)} icon="📉" color="bg-red-50 border-red-200" />
        <MetricCard title="Laba/Rugi" value={formatCurrency(metrics.netIncome)} icon={metrics.netIncome >= 0 ? '✅' : '❌'} color={metrics.netIncome >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} />
        <MetricCard title="Nilai Persediaan" value={formatCurrency(metrics.inventoryValue)} icon="📦" color="bg-yellow-50 border-yellow-200" />
        <MetricCard title="Nilai Ternak" value={formatCurrency(metrics.livestockValue)} icon="🐄" color="bg-amber-50 border-amber-200" />
        <MetricCard title="Jumlah Ternak" value={metrics.totalLivestock.toString() + ' ekor'} icon="🐓" color="bg-orange-50 border-orange-200" />
        <MetricCard title="Total Aset" value={formatCurrency(metrics.totalAssets)} icon="🏗️" color="bg-indigo-50 border-indigo-200" />
        <MetricCard title="Biaya Produksi" value={formatCurrency(metrics.totalProductionCost)} icon="🏭" color="bg-purple-50 border-purple-200" />
        <MetricCard title="Biaya per Ekor" value={formatCurrency(metrics.costPerAnimal)} icon="🐑" color="bg-teal-50 border-teal-200" />
        <MetricCard title="Biaya per Telur" value={formatCurrency(metrics.costPerEgg)} icon="🥚" color="bg-pink-50 border-pink-200" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Pendapatan vs Biaya</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `${(v/1000000).toFixed(0)}jt`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend />
              <Bar dataKey="pendapatan" fill="#166534" name="Pendapatan" />
              <Bar dataKey="biaya" fill="#dc2626" name="Biaya" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Pendapatan per Jenis Usaha</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={revenueChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {revenueChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Komposisi Biaya</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={expenseChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(v) => `${(v/1000000).toFixed(0)}jt`} />
              <YAxis type="category" dataKey="name" width={80} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="value" fill="#d4a017" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Produksi Peternakan</h3>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-700">{metrics.totalEggs.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Telur (butir)</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-700">{metrics.totalMilk}</p>
              <p className="text-sm text-gray-600">Susu (liter)</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-700">{metrics.totalLivestock}</p>
              <p className="text-sm text-gray-600">Ternak Aktif</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-700">{formatCurrency(metrics.costPerEgg)}</p>
              <p className="text-sm text-gray-600">HPP per Telur</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Transaksi Terbaru</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3">Tanggal</th>
                <th className="text-left p-3">Nomor</th>
                <th className="text-left p-3">Keterangan</th>
                <th className="text-right p-3">Jumlah</th>
                <th className="text-center p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {state.transactions.slice(-5).reverse().map(t => {
                const journal = state.journalEntries.find(j => j.id === t.journalId);
                const amount = journal?.entries.reduce((s, e) => s + e.debit, 0) || 0;
                return (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{formatDate(t.date)}</td>
                    <td className="p-3 font-mono text-xs">{t.number}</td>
                    <td className="p-3">{t.description}</td>
                    <td className="p-3 text-right font-medium">{formatCurrency(amount)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${t.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {t.status === 'completed' ? 'Selesai' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }: { title: string; value: string; icon: string; color: string }) {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-xs text-gray-600 mt-2">{title}</p>
      <p className="text-sm font-bold text-gray-800 mt-1 truncate">{value}</p>
    </div>
  );
}

// ==================== CHART OF ACCOUNTS ====================
function AccountsView({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const [filter, setFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Account>>({ type: 'asset', normalBalance: 'debit', isActive: true });

  const filtered = filter === 'all' ? state.accounts : state.accounts.filter(a => a.type === filter);

  const handleSave = () => {
    if (!formData.code || !formData.name) return;
    if (formData.id) {
      setState({ ...state, accounts: state.accounts.map(a => a.id === formData.id ? { ...a, ...formData } as Account : a) });
    } else {
      setState({ ...state, accounts: [...state.accounts, { ...formData, id: generateId() } as Account] });
    }
    setShowForm(false);
    setFormData({ type: 'asset', normalBalance: 'debit', isActive: true });
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus akun ini?')) {
      setState({ ...state, accounts: state.accounts.filter(a => a.id !== id) });
    }
  };

  const typeLabels: Record<string, string> = { asset: 'Aset', liability: 'Liabilitas', equity: 'Ekuitas', revenue: 'Pendapatan', expense: 'Beban' };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['all', 'asset', 'liability', 'equity', 'revenue', 'expense'].map(t => (
            <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 rounded-lg text-sm ${filter === t ? 'bg-green-700 text-white' : 'bg-white border hover:bg-gray-50'}`}>
              {t === 'all' ? 'Semua' : typeLabels[t]}
            </button>
          ))}
        </div>
        <button onClick={() => { setShowForm(true); setFormData({ type: 'asset', normalBalance: 'debit', isActive: true }); }} className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-green-800">
          <Plus size={16} /> Tambah Akun
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-5 space-y-4">
          <h3 className="font-semibold">{formData.id ? 'Edit' : 'Tambah'} Akun</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-600">Kode Akun</label>
              <input value={formData.code || ''} onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="1-1000" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Nama Akun</label>
              <input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nama akun" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Tipe</label>
              <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any, normalBalance: ['asset','expense'].includes(e.target.value) ? 'debit' : 'credit' })} className="w-full border rounded-lg px-3 py-2 text-sm">
                {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Saldo Normal</label>
              <select value={formData.normalBalance} onChange={e => setFormData({ ...formData, normalBalance: e.target.value as any })} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="debit">Debit</option>
                <option value="credit">Kredit</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800">Simpan</button>
            <button onClick={() => setShowForm(false)} className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Batal</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left p-3">Kode</th>
              <th className="text-left p-3">Nama Akun</th>
              <th className="text-left p-3">Tipe</th>
              <th className="text-left p-3">Saldo Normal</th>
              <th className="text-right p-3">Saldo</th>
              <th className="text-center p-3">Status</th>
              <th className="text-center p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(account => {
              const balance = calculateAccountBalance(account.id, state.journalEntries);
              return (
                <tr key={account.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs">{account.code}</td>
                  <td className="p-3 font-medium">{account.name}</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{typeLabels[account.type]}</span></td>
                  <td className="p-3 capitalize">{account.normalBalance}</td>
                  <td className="p-3 text-right font-medium">{formatCurrency(Math.abs(balance))}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs ${account.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {account.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button onClick={() => { setFormData(account); setShowForm(true); }} className="p-1 hover:bg-blue-50 rounded text-blue-600"><Edit size={14} /></button>
                    <button onClick={() => handleDelete(account.id)} className="p-1 hover:bg-red-50 rounded text-red-600"><Trash2 size={14} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== TRANSACTIONS ====================
function TransactionsView({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<string>('cash_receipt');
  const [formData, setFormData] = useState<any>({ date: new Date().toISOString().split('T')[0], description: '', amount: 0, accountId: '', counterpartId: '' });

  const handleSaveTransaction = () => {
    const { description, amount, accountId, counterpartId, date, relatedParty } = formData;
    if (!description || !amount || !accountId || !counterpartId) { alert('Lengkapi semua field'); return; }

    const journalId = generateId();
    const journalNumber = `JU-2026-${String(state.journalEntries.length + 1).padStart(3, '0')}`;
    
    let debitAccount = accountId;
    let creditAccount = counterpartId;

    if (formType === 'cash_payment' || formType === 'inventory_out') {
      debitAccount = counterpartId;
      creditAccount = accountId;
    }

    const journal: JournalEntry = {
      id: journalId,
      number: journalNumber,
      date,
      reference: `TRX-${String(state.transactions.length + 1).padStart(3, '0')}`,
      description,
      entries: [
        { id: generateId(), accountId: debitAccount, description: state.accounts.find(a => a.id === debitAccount)?.name || '', debit: amount, credit: 0 },
        { id: generateId(), accountId: creditAccount, description: state.accounts.find(a => a.id === creditAccount)?.name || '', debit: 0, credit: amount },
      ],
      status: 'posted',
      createdAt: new Date().toISOString(),
      createdBy: 'u1'
    };

    const transaction: Transaction = {
      id: generateId(),
      type: formType as any,
      date,
      number: journal.reference,
      description,
      journalId,
      relatedParty,
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    setState({
      ...state,
      journalEntries: [...state.journalEntries, journal],
      transactions: [...state.transactions, transaction]
    });
    setShowForm(false);
    setFormData({ date: new Date().toISOString().split('T')[0], description: '', amount: 0, accountId: '', counterpartId: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {['Semua', 'Penerimaan Kas', 'Pengeluaran Kas', 'Penjualan Kredit', 'Pembelian Kredit'].map((t, i) => (
            <button key={t} className="px-3 py-1.5 rounded-lg text-sm bg-white border hover:bg-gray-50">{t}</button>
          ))}
        </div>
        <button onClick={() => setShowForm(true)} className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-green-800">
          <Plus size={16} /> Transaksi Baru
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-5 space-y-4">
          <h3 className="font-semibold">Transaksi Baru</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-600">Jenis Transaksi</label>
              <select value={formType} onChange={e => setFormType(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="cash_receipt">Penerimaan Kas</option>
                <option value="cash_payment">Pengeluaran Kas</option>
                <option value="credit_sale">Penjualan Kredit</option>
                <option value="credit_purchase">Pembelian Kredit</option>
                <option value="general">Umum</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Tanggal</label>
              <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Jumlah (Rp)</label>
              <input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-600">{formType.includes('payment') || formType.includes('purchase') ? 'Kredit (Sumber Dana)' : 'Debit (Penerima)'}</label>
              <select value={formData.accountId} onChange={e => setFormData({ ...formData, accountId: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Pilih akun...</option>
                {state.accounts.filter(a => a.isActive).map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">{formType.includes('payment') || formType.includes('purchase') ? 'Debit (Tujuan)' : 'Kredit (Sumber)'}</label>
              <select value={formData.counterpartId} onChange={e => setFormData({ ...formData, counterpartId: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Pilih akun...</option>
                {state.accounts.filter(a => a.isActive).map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Pihak Terkait</label>
              <input value={formData.relatedParty || ''} onChange={e => setFormData({ ...formData, relatedParty: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nama pelanggan/supplier" />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600">Keterangan</label>
            <input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Deskripsi transaksi" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSaveTransaction} className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800">Simpan & Posting</button>
            <button onClick={() => setShowForm(false)} className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Batal</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left p-3">Tanggal</th>
              <th className="text-left p-3">Nomor</th>
              <th className="text-left p-3">Jenis</th>
              <th className="text-left p-3">Keterangan</th>
              <th className="text-left p-3">Pihak</th>
              <th className="text-right p-3">Jumlah</th>
              <th className="text-center p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {state.transactions.map(t => {
              const journal = state.journalEntries.find(j => j.id === t.journalId);
              const amount = journal?.entries.reduce((s, e) => s + e.debit, 0) || 0;
              const typeLabels: Record<string, string> = { cash_receipt: 'Penerimaan Kas', cash_payment: 'Pengeluaran Kas', credit_sale: 'Penjualan Kredit', credit_purchase: 'Pembelian Kredit', livestock_purchase: 'Beli Ternak', livestock_sale: 'Jual Ternak', inventory_in: 'Stok Masuk', inventory_out: 'Stok Keluar', general: 'Umum', adjustment: 'Penyesuaian' };
              return (
                <tr key={t.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{formatDate(t.date)}</td>
                  <td className="p-3 font-mono text-xs">{t.number}</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">{typeLabels[t.type] || t.type}</span></td>
                  <td className="p-3">{t.description}</td>
                  <td className="p-3 text-xs">{t.relatedParty || '-'}</td>
                  <td className="p-3 text-right font-medium">{formatCurrency(amount)}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs ${t.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {t.status === 'completed' ? 'Selesai' : 'Pending'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== JOURNAL ====================
function JournalView({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [lines, setLines] = useState<JournalLine[]>([
    { id: generateId(), accountId: '', description: '', debit: 0, credit: 0 },
    { id: generateId(), accountId: '', description: '', debit: 0, credit: 0 },
  ]);
  const [journalDesc, setJournalDesc] = useState('');
  const [journalDate, setJournalDate] = useState(new Date().toISOString().split('T')[0]);

  const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = lines.reduce((s, l) => s + l.credit, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const addLine = () => setLines([...lines, { id: generateId(), accountId: '', description: '', debit: 0, credit: 0 }]);
  const removeLine = (id: string) => setLines(lines.filter(l => l.id !== id));
  const updateLine = (id: string, field: string, value: any) => setLines(lines.map(l => l.id === id ? { ...l, [field]: value } : l));

  const handleSave = () => {
    if (!isBalanced) { alert('Jurnal tidak seimbang! Total Debit harus sama dengan Total Kredit.'); return; }
    if (!journalDesc) { alert('Keterangan wajib diisi'); return; }
    if (lines.some(l => !l.accountId)) { alert('Semua baris harus memiliki akun'); return; }

    const journal: JournalEntry = {
      id: generateId(),
      number: `JU-2026-${String(state.journalEntries.length + 1).padStart(3, '0')}`,
      date: journalDate,
      reference: `REF-${String(state.journalEntries.length + 1).padStart(3, '0')}`,
      description: journalDesc,
      entries: lines.filter(l => l.debit > 0 || l.credit > 0),
      status: 'posted',
      createdAt: new Date().toISOString(),
      createdBy: 'u1'
    };

    setState({ ...state, journalEntries: [...state.journalEntries, journal] });
    setShowForm(false);
    setLines([
      { id: generateId(), accountId: '', description: '', debit: 0, credit: 0 },
      { id: generateId(), accountId: '', description: '', debit: 0, credit: 0 },
    ]);
    setJournalDesc('');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">Total: {state.journalEntries.length} jurnal</p>
        <button onClick={() => setShowForm(true)} className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-green-800">
          <Plus size={16} /> Jurnal Baru
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-5 space-y-4">
          <h3 className="font-semibold">Jurnal Umum Baru</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Tanggal</label>
              <input type="date" value={journalDate} onChange={e => setJournalDate(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Keterangan</label>
              <input value={journalDesc} onChange={e => setJournalDesc(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Deskripsi jurnal" />
            </div>
          </div>
          
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-2">Akun</th>
                <th className="text-left p-2">Keterangan</th>
                <th className="text-right p-2">Debit</th>
                <th className="text-right p-2">Kredit</th>
                <th className="p-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {lines.map(line => (
                <tr key={line.id} className="border-b">
                  <td className="p-2">
                    <select value={line.accountId} onChange={e => updateLine(line.id, 'accountId', e.target.value)} className="w-full border rounded px-2 py-1.5 text-xs">
                      <option value="">Pilih akun...</option>
                      {state.accounts.filter(a => a.isActive).map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                    </select>
                  </td>
                  <td className="p-2">
                    <input value={line.description} onChange={e => updateLine(line.id, 'description', e.target.value)} className="w-full border rounded px-2 py-1.5 text-xs" />
                  </td>
                  <td className="p-2">
                    <input type="number" value={line.debit || ''} onChange={e => updateLine(line.id, 'debit', Number(e.target.value))} className="w-full border rounded px-2 py-1.5 text-xs text-right" />
                  </td>
                  <td className="p-2">
                    <input type="number" value={line.credit || ''} onChange={e => updateLine(line.id, 'credit', Number(e.target.value))} className="w-full border rounded px-2 py-1.5 text-xs text-right" />
                  </td>
                  <td className="p-2">
                    {lines.length > 2 && <button onClick={() => removeLine(line.id)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-bold">
                <td colSpan={2} className="p-2 text-right">Total:</td>
                <td className="p-2 text-right">{formatCurrency(totalDebit)}</td>
                <td className="p-2 text-right">{formatCurrency(totalCredit)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button onClick={addLine} className="border px-3 py-1.5 rounded text-sm hover:bg-gray-50">+ Baris</button>
            </div>
            <div className={`text-sm font-medium ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
              {isBalanced ? '✓ SEIMBANG' : `✗ Selisih: ${formatCurrency(Math.abs(totalDebit - totalCredit))}`}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSave} disabled={!isBalanced} className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800 disabled:opacity-50">Simpan & Posting</button>
            <button onClick={() => setShowForm(false)} className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Batal</button>
          </div>
        </div>
      )}

      {/* Journal List */}
      <div className="space-y-3">
        {state.journalEntries.slice().reverse().map(journal => (
          <div key={journal.id} className="bg-white rounded-xl border overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-gray-500">{journal.number}</span>
                <span className="mx-2 text-gray-300">|</span>
                <span className="text-sm font-medium">{formatDate(journal.date)}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs ${journal.status === 'posted' ? 'bg-green-100 text-green-700' : journal.status === 'closed' ? 'bg-gray-200 text-gray-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {journal.status === 'posted' ? 'Diposting' : journal.status === 'closed' ? 'Ditutup' : 'Draft'}
              </span>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-700 mb-3">{journal.description}</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500">
                    <th className="text-left pb-2">Akun</th>
                    <th className="text-left pb-2">Keterangan</th>
                    <th className="text-right pb-2">Debit</th>
                    <th className="text-right pb-2">Kredit</th>
                  </tr>
                </thead>
                <tbody>
                  {journal.entries.map(entry => {
                    const account = state.accounts.find(a => a.id === entry.accountId);
                    return (
                      <tr key={entry.id} className="border-t">
                        <td className="py-1.5 font-mono">{account?.code} - {account?.name}</td>
                        <td className="py-1.5 text-gray-500">{entry.description}</td>
                        <td className="py-1.5 text-right">{entry.debit > 0 ? formatCurrency(entry.debit) : ''}</td>
                        <td className="py-1.5 text-right">{entry.credit > 0 ? formatCurrency(entry.credit) : ''}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t font-bold">
                    <td colSpan={2} className="pt-2 text-right">Total:</td>
                    <td className="pt-2 text-right">{formatCurrency(journal.entries.reduce((s, e) => s + e.debit, 0))}</td>
                    <td className="pt-2 text-right">{formatCurrency(journal.entries.reduce((s, e) => s + e.credit, 0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== LEDGER ====================
function LedgerView({ state }: { state: AppState }) {
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  
  const accountEntries = useMemo(() => {
    if (!selectedAccount) return [];
    const entries: { date: string; ref: string; desc: string; debit: number; credit: number; balance: number }[] = [];
    let runningBalance = 0;
    
    state.journalEntries.filter(j => j.status === 'posted').sort((a, b) => a.date.localeCompare(b.date)).forEach(journal => {
      journal.entries.filter(e => e.accountId === selectedAccount).forEach(entry => {
        runningBalance += entry.debit - entry.credit;
        entries.push({
          date: journal.date,
          ref: journal.number,
          desc: journal.description,
          debit: entry.debit,
          credit: entry.credit,
          balance: runningBalance
        });
      });
    });
    return entries;
  }, [selectedAccount, state]);

  const account = state.accounts.find(a => a.id === selectedAccount);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border p-4">
        <label className="text-sm text-gray-600 block mb-2">Pilih Akun:</label>
        <select value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)} className="w-full md:w-96 border rounded-lg px-3 py-2 text-sm">
          <option value="">-- Pilih Akun --</option>
          {state.accounts.filter(a => a.isActive).map(a => (
            <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
          ))}
        </select>
      </div>

      {account && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="p-4 border-b bg-green-50">
            <h3 className="font-semibold text-green-800">{account.code} - {account.name}</h3>
            <p className="text-sm text-gray-600">Saldo Normal: {account.normalBalance} | Tipe: {account.type}</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-3">Tanggal</th>
                <th className="text-left p-3">Referensi</th>
                <th className="text-left p-3">Keterangan</th>
                <th className="text-right p-3">Debit</th>
                <th className="text-right p-3">Kredit</th>
                <th className="text-right p-3">Saldo</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b bg-blue-50">
                <td colSpan={3} className="p-3 font-medium">Saldo Awal</td>
                <td className="p-3"></td>
                <td className="p-3"></td>
                <td className="p-3 text-right font-medium">0</td>
              </tr>
              {accountEntries.map((entry, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-3">{formatDate(entry.date)}</td>
                  <td className="p-3 font-mono text-xs">{entry.ref}</td>
                  <td className="p-3">{entry.desc}</td>
                  <td className="p-3 text-right">{entry.debit > 0 ? formatCurrency(entry.debit) : ''}</td>
                  <td className="p-3 text-right">{entry.credit > 0 ? formatCurrency(entry.credit) : ''}</td>
                  <td className="p-3 text-right font-medium">{formatCurrency(entry.balance)}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td colSpan={3} className="p-3 text-right">Total:</td>
                <td className="p-3 text-right">{formatCurrency(accountEntries.reduce((s, e) => s + e.debit, 0))}</td>
                <td className="p-3 text-right">{formatCurrency(accountEntries.reduce((s, e) => s + e.credit, 0))}</td>
                <td className="p-3 text-right">{formatCurrency(accountEntries.length > 0 ? accountEntries[accountEntries.length - 1].balance : 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ==================== TRIAL BALANCE ====================
function TrialBalanceView({ state }: { state: AppState }) {
  const trialBalance = useMemo(() => getTrialBalance(state), [state]);
  const totalDebit = trialBalance.reduce((s, r) => s + r.debit, 0);
  const totalCredit = trialBalance.reduce((s, r) => s + r.credit, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 1;

  return (
    <div className="space-y-4">
      <div className={`rounded-xl border p-4 flex items-center justify-between ${isBalanced ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center gap-3">
          {isBalanced ? <CheckCircle className="text-green-600" size={24} /> : <AlertCircle className="text-red-600" size={24} />}
          <div>
            <p className="font-semibold">{isBalanced ? 'Neraca Saldo SEIMBANG' : 'NERACA SALDO TIDAK SEIMBANG!'}</p>
            <p className="text-sm text-gray-600">Total Debit: {formatCurrency(totalDebit)} | Total Kredit: {formatCurrency(totalCredit)}</p>
          </div>
        </div>
        {!isBalanced && <p className="text-red-600 font-bold">Selisih: {formatCurrency(Math.abs(totalDebit - totalCredit))}</p>}
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-semibold">Neraca Saldo</h3>
          <p className="text-sm text-gray-500">Per {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left p-3">Kode Akun</th>
              <th className="text-left p-3">Nama Akun</th>
              <th className="text-right p-3">Debit</th>
              <th className="text-right p-3">Kredit</th>
            </tr>
          </thead>
          <tbody>
            {trialBalance.map(row => (
              <tr key={row.accountId} className="border-b hover:bg-gray-50">
                <td className="p-3 font-mono text-xs">{row.accountCode}</td>
                <td className="p-3">{row.accountName}</td>
                <td className="p-3 text-right">{row.debit > 0 ? formatCurrency(row.debit) : ''}</td>
                <td className="p-3 text-right">{row.credit > 0 ? formatCurrency(row.credit) : ''}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-green-50 font-bold border-t-2">
              <td colSpan={2} className="p-3 text-right">TOTAL:</td>
              <td className="p-3 text-right">{formatCurrency(totalDebit)}</td>
              <td className="p-3 text-right">{formatCurrency(totalCredit)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ==================== ADJUSTMENTS ====================
function AdjustmentsView({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [adjType, setAdjType] = useState('depreciation');
  const [adjDesc, setAdjDesc] = useState('');
  const [adjAmount, setAdjAmount] = useState(0);
  const [adjDate, setAdjDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSave = () => {
    if (!adjDesc || !adjAmount) { alert('Lengkapi data'); return; }
    
    let debitAccount = '', creditAccount = '';
    switch (adjType) {
      case 'depreciation': debitAccount = 'x9'; creditAccount = 'a16'; break;
      case 'accrued_expense': debitAccount = 'x13'; creditAccount = 'l5'; break;
      case 'inventory_used': debitAccount = 'x1'; creditAccount = 'a4'; break;
      default: debitAccount = 'x13'; creditAccount = 'a1'; break;
    }

    const journalId = generateId();
    const journal: JournalEntry = {
      id: journalId, number: `JPA-2026-${String(state.journalEntries.length + 1).padStart(3, '0')}`,
      date: adjDate, reference: `ADJ-${String(state.adjustments.length + 1).padStart(3, '0')}`,
      description: `[Penyesuaian] ${adjDesc}`,
      entries: [
        { id: generateId(), accountId: debitAccount, description: state.accounts.find(a => a.id === debitAccount)?.name || '', debit: adjAmount, credit: 0 },
        { id: generateId(), accountId: creditAccount, description: state.accounts.find(a => a.id === creditAccount)?.name || '', debit: 0, credit: adjAmount },
      ],
      status: 'adjusted', createdAt: new Date().toISOString(), createdBy: 'u1'
    };

    setState({
      ...state,
      journalEntries: [...state.journalEntries, journal],
      adjustments: [...state.adjustments, { id: generateId(), type: adjType as any, date: adjDate, description: adjDesc, journalId, periodId: 'fp2' }]
    });
    setShowForm(false);
    setAdjDesc(''); setAdjAmount(0);
  };

  const typeLabels: Record<string, string> = { depreciation: 'Penyusutan', accrued_expense: 'Beban Masih Harus Dibayar', accrued_revenue: 'Pendapatan Masih Harus Diterima', prepaid_expense: 'Beban Dibayar Dimuka', inventory_used: 'Persediaan Terpakai', inventory_adjustment: 'Penyesuaian Persediaan', livestock_adjustment: 'Penyesuaian Ternak', livestock_death_loss: 'Kerugian Kematian Ternak', other: 'Lainnya' };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">Jurnal penyesuaian untuk mengoreksi saldo akun sebelum penyusunan laporan keuangan.</p>
        <button onClick={() => setShowForm(true)} className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-green-800">
          <Plus size={16} /> Jurnal Penyesuaian
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-5 space-y-4">
          <h3 className="font-semibold">Jurnal Penyesuaian</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Jenis Penyesuaian</label>
              <select value={adjType} onChange={e => setAdjType(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Tanggal</label>
              <input type="date" value={adjDate} onChange={e => setAdjDate(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Jumlah (Rp)</label>
              <input type="number" value={adjAmount} onChange={e => setAdjAmount(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Keterangan</label>
              <input value={adjDesc} onChange={e => setAdjDesc(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Deskripsi penyesuaian" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800">Simpan</button>
            <button onClick={() => setShowForm(false)} className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Batal</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left p-3">Tanggal</th>
              <th className="text-left p-3">Jenis</th>
              <th className="text-left p-3">Keterangan</th>
              <th className="text-right p-3">Jumlah</th>
              <th className="text-center p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {state.adjustments.map(adj => {
              const journal = state.journalEntries.find(j => j.id === adj.journalId);
              const amount = journal?.entries[0]?.debit || 0;
              return (
                <tr key={adj.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{formatDate(adj.date)}</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">{typeLabels[adj.type]}</span></td>
                  <td className="p-3">{adj.description}</td>
                  <td className="p-3 text-right font-medium">{formatCurrency(amount)}</td>
                  <td className="p-3 text-center"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Diposting</span></td>
                </tr>
              );
            })}
            {state.adjustments.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400">Belum ada jurnal penyesuaian</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Auto-generate suggestions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">💡 Saran Penyesuaian Otomatis</h4>
        <div className="space-y-2 text-sm">
          {state.fixedAssets.map(fa => {
            const annualDepr = (fa.acquisitionCost - fa.residualValue) / fa.usefulLife;
            const monthlyDepr = annualDepr / 12;
            return (
              <div key={fa.id} className="flex items-center justify-between bg-white rounded-lg p-3 border">
                <span>{fa.name} - Penyusutan bulanan</span>
                <span className="font-medium">{formatCurrency(monthlyDepr)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==================== FINANCIAL REPORTS ====================
function ReportsView({ state }: { state: AppState }) {
  const [activeReport, setActiveReport] = useState<'income' | 'balance' | 'cashflow' | 'equity' | 'production' | 'inventory' | 'livestock'>('income');
  
  const incomeStatement = useMemo(() => calculateIncomeStatement(state), [state]);
  const balanceSheet = useMemo(() => calculateBalanceSheet(state), [state]);
  const cashFlow = useMemo(() => calculateCashFlow(state), [state]);
  const productionCost = useMemo(() => calculateProductionCost(state), [state]);

  const reports = [
    { id: 'income', label: 'Laba Rugi' },
    { id: 'balance', label: 'Neraca' },
    { id: 'cashflow', label: 'Arus Kas' },
    { id: 'equity', label: 'Perubahan Ekuitas' },
    { id: 'production', label: 'Biaya Produksi' },
    { id: 'inventory', label: 'Persediaan' },
    { id: 'livestock', label: 'Ternak' },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {reports.map(r => (
          <button key={r.id} onClick={() => setActiveReport(r.id)} className={`px-4 py-2 rounded-lg text-sm ${activeReport === r.id ? 'bg-green-700 text-white' : 'bg-white border hover:bg-gray-50'}`}>
            {r.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border p-6">
        {activeReport === 'income' && (
          <div>
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-green-800">LAPORAN LABA RUGI</h3>
              <p className="text-sm text-gray-500">Periode Februari 2026</p>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-green-700 border-b pb-2">PENDAPATAN</h4>
                {incomeStatement.revenue.map((r, i) => (
                  <div key={i} className="flex justify-between py-1 pl-4 text-sm">
                    <span>{r.name}</span>
                    <span>{formatCurrency(r.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 pl-4 font-bold border-t mt-2">
                  <span>Total Pendapatan</span>
                  <span className="text-green-700">{formatCurrency(incomeStatement.totalRevenue)}</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-red-700 border-b pb-2">BEBAN</h4>
                {incomeStatement.expenses.map((e, i) => (
                  <div key={i} className="flex justify-between py-1 pl-4 text-sm">
                    <span>{e.name}</span>
                    <span>{formatCurrency(e.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 pl-4 font-bold border-t mt-2">
                  <span>Total Beban</span>
                  <span className="text-red-700">{formatCurrency(incomeStatement.totalExpenses)}</span>
                </div>
              </div>
              <div className={`flex justify-between py-3 px-4 rounded-lg text-lg font-bold ${incomeStatement.netIncome >= 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <span>LABA (RUGI) BERSIH</span>
                <span>{formatCurrency(incomeStatement.netIncome)}</span>
              </div>
            </div>
          </div>
        )}

        {activeReport === 'balance' && (
          <div>
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-green-800">NERACA / LAPORAN POSISI KEUANGAN</h3>
              <p className="text-sm text-gray-500">Per {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-green-700 border-b pb-2">ASET</h4>
                {balanceSheet.assets.map((a, i) => (
                  <div key={i} className="flex justify-between py-1 pl-4 text-sm">
                    <span>{a.name}</span>
                    <span>{formatCurrency(a.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 pl-4 font-bold border-t mt-2">
                  <span>Total Aset</span>
                  <span>{formatCurrency(balanceSheet.totalAssets)}</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-orange-700 border-b pb-2">LIABILITAS</h4>
                {balanceSheet.liabilities.map((l, i) => (
                  <div key={i} className="flex justify-between py-1 pl-4 text-sm">
                    <span>{l.name}</span>
                    <span>{formatCurrency(l.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 pl-4 font-bold border-t mt-2">
                  <span>Total Liabilitas</span>
                  <span>{formatCurrency(balanceSheet.totalLiabilities)}</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-blue-700 border-b pb-2">EKUITAS</h4>
                {balanceSheet.equity.map((e, i) => (
                  <div key={i} className="flex justify-between py-1 pl-4 text-sm">
                    <span>{e.name}</span>
                    <span>{formatCurrency(e.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 pl-4 font-bold border-t mt-2">
                  <span>Total Ekuitas</span>
                  <span>{formatCurrency(balanceSheet.totalEquity)}</span>
                </div>
              </div>
              <div className={`flex justify-between py-3 px-4 rounded-lg font-bold ${balanceSheet.isBalanced ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <span>Total Liabilitas + Ekuitas</span>
                <span>{formatCurrency(balanceSheet.totalLiabilities + balanceSheet.totalEquity)}</span>
              </div>
              <div className={`text-center py-2 rounded ${balanceSheet.isBalanced ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {balanceSheet.isBalanced ? '✓ NERACA SEIMBANG (Aset = Liabilitas + Ekuitas)' : '✗ NERACA TIDAK SEIMBANG'}
              </div>
            </div>
          </div>
        )}

        {activeReport === 'cashflow' && (
          <div>
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-green-800">LAPORAN ARUS KAS</h3>
              <p className="text-sm text-gray-500">Periode Februari 2026</p>
            </div>
            <div className="space-y-4">
              <div className="border-b pb-3">
                <h4 className="font-semibold text-green-700">Arus Kas dari Aktivitas Operasi</h4>
                <div className="flex justify-between py-2 pl-4">
                  <span>Penerimaan dari pelanggan</span>
                  <span className="text-green-600">{formatCurrency(incomeStatement.totalRevenue)}</span>
                </div>
                <div className="flex justify-between py-2 pl-4">
                  <span>Pembayaran beban operasional</span>
                  <span className="text-red-600">({formatCurrency(incomeStatement.totalExpenses)})</span>
                </div>
                <div className="flex justify-between py-2 pl-4 font-bold border-t">
                  <span>Kas Bersih dari Aktivitas Operasi</span>
                  <span>{formatCurrency(cashFlow.operatingCashFlow)}</span>
                </div>
              </div>
              <div className="border-b pb-3">
                <h4 className="font-semibold text-blue-700">Arus Kas dari Aktivitas Investasi</h4>
                <div className="flex justify-between py-2 pl-4 font-bold">
                  <span>Kas Bersih dari Aktivitas Investasi</span>
                  <span>{formatCurrency(cashFlow.investingCashFlow)}</span>
                </div>
              </div>
              <div className="border-b pb-3">
                <h4 className="font-semibold text-purple-700">Arus Kas dari Aktivitas Pendanaan</h4>
                <div className="flex justify-between py-2 pl-4 font-bold">
                  <span>Kas Bersih dari Aktivitas Pendanaan</span>
                  <span>{formatCurrency(cashFlow.financingCashFlow)}</span>
                </div>
              </div>
              <div className="flex justify-between py-3 px-4 bg-green-50 rounded-lg font-bold text-lg">
                <span>Kenaikan (Penurunan) Kas Bersih</span>
                <span>{formatCurrency(cashFlow.netCashFlow)}</span>
              </div>
              <div className="flex justify-between py-2 px-4 bg-blue-50 rounded-lg">
                <span>Saldo Kas Akhir</span>
                <span className="font-bold">{formatCurrency(cashFlow.cashBalance)}</span>
              </div>
            </div>
          </div>
        )}

        {activeReport === 'equity' && (
          <div>
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-green-800">LAPORAN PERUBAHAN EKUITAS</h3>
              <p className="text-sm text-gray-500">Periode Februari 2026</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span>Modal Awal</span>
                <span className="font-medium">{formatCurrency(500000000)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>(+) Laba Bersih Periode Berjalan</span>
                <span className="font-medium text-green-700">{formatCurrency(incomeStatement.netIncome)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>(-) Prive</span>
                <span className="font-medium text-red-700">{formatCurrency(0)}</span>
              </div>
              <div className="flex justify-between py-3 px-4 bg-green-50 rounded-lg font-bold text-lg">
                <span>Modal Akhir</span>
                <span>{formatCurrency(500000000 + incomeStatement.netIncome)}</span>
              </div>
            </div>
          </div>
        )}

        {activeReport === 'production' && (
          <div>
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-green-800">LAPORAN BIAYA PRODUksi</h3>
              <p className="text-sm text-gray-500">Periode Februari 2026</p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold border-b pb-2">Komponen Biaya Produksi</h4>
              <div className="flex justify-between py-1 pl-4"><span>Beban Pakan</span><span>{formatCurrency(productionCost.feedCost)}</span></div>
              <div className="flex justify-between py-1 pl-4"><span>Beban Obat</span><span>{formatCurrency(productionCost.medicineCost)}</span></div>
              <div className="flex justify-between py-1 pl-4"><span>Beban Vitamin</span><span>{formatCurrency(productionCost.vitaminCost)}</span></div>
              <div className="flex justify-between py-1 pl-4"><span>Beban Tenaga Kerja</span><span>{formatCurrency(productionCost.laborCost)}</span></div>
              <div className="flex justify-between py-1 pl-4"><span>Beban Listrik</span><span>{formatCurrency(productionCost.electricityCost)}</span></div>
              <div className="flex justify-between py-1 pl-4"><span>Beban Air</span><span>{formatCurrency(productionCost.waterCost)}</span></div>
              <div className="flex justify-between py-1 pl-4"><span>Beban Pemeliharaan</span><span>{formatCurrency(productionCost.maintenanceCost)}</span></div>
              <div className="flex justify-between py-1 pl-4"><span>Beban Penyusutan</span><span>{formatCurrency(productionCost.depreciationCost)}</span></div>
              <div className="flex justify-between py-3 px-4 bg-green-50 rounded-lg font-bold text-lg border-t-2 mt-2">
                <span>TOTAL BIAYA PRODUKSI</span>
                <span>{formatCurrency(productionCost.totalCost)}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="bg-yellow-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600">Biaya per Ekor</p>
                  <p className="font-bold text-yellow-700">{formatCurrency(productionCost.costPerAnimal)}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600">Biaya per Telur</p>
                  <p className="font-bold text-orange-700">{formatCurrency(productionCost.costPerEgg)}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600">Biaya per Liter Susu</p>
                  <p className="font-bold text-blue-700">{formatCurrency(productionCost.costPerLiterMilk)}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-600">Ternak Aktif</p>
                  <p className="font-bold text-green-700">{productionCost.activeLivestock} ekor</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeReport === 'inventory' && (
          <div>
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-green-800">LAPORAN PERSEDIAAN</h3>
              <p className="text-sm text-gray-500">Per {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-3">Kode</th>
                  <th className="text-left p-3">Nama</th>
                  <th className="text-left p-3">Kategori</th>
                  <th className="text-right p-3">Stok</th>
                  <th className="text-right p-3">Harga/unit</th>
                  <th className="text-right p-3">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {state.inventory.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-xs">{item.code}</td>
                    <td className="p-3">{item.name}</td>
                    <td className="p-3 capitalize">{item.category}</td>
                    <td className="p-3 text-right">{item.stock} {item.unit}</td>
                    <td className="p-3 text-right">{formatCurrency(item.pricePerUnit)}</td>
                    <td className="p-3 text-right font-medium">{formatCurrency(item.totalValue)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-green-50 font-bold">
                  <td colSpan={5} className="p-3 text-right">Total Nilai Persediaan:</td>
                  <td className="p-3 text-right">{formatCurrency(state.inventory.reduce((s, i) => s + i.totalValue, 0))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {activeReport === 'livestock' && (
          <div>
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-green-800">LAPORAN TERNAK</h3>
              <p className="text-sm text-gray-500">Per {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-700">{state.livestock.filter(l => l.status === 'active').length}</p>
                <p className="text-sm text-gray-600">Populasi Aktif</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-700">{state.livestockMovements.filter(m => m.type === 'birth').length}</p>
                <p className="text-sm text-gray-600">Kelahiran</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-700">{state.livestockMovements.filter(m => m.type === 'purchase').length}</p>
                <p className="text-sm text-gray-600">Pembelian</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-700">{state.livestockMovements.filter(m => m.type === 'death').length}</p>
                <p className="text-sm text-gray-600">Kematian</p>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-3">Kode</th>
                  <th className="text-left p-3">Jenis</th>
                  <th className="text-left p-3">Ras</th>
                  <th className="text-left p-3">Lokasi</th>
                  <th className="text-right p-3">Berat (kg)</th>
                  <th className="text-right p-3">Nilai</th>
                  <th className="text-center p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {state.livestock.map(l => (
                  <tr key={l.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-xs">{l.code}</td>
                    <td className="p-3">{l.type}</td>
                    <td className="p-3">{l.breed}</td>
                    <td className="p-3">{l.location}</td>
                    <td className="p-3 text-right">{l.weight}</td>
                    <td className="p-3 text-right">{formatCurrency(l.currentValue)}</td>
                    <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded text-xs ${l.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{l.status}</span></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-green-50 font-bold">
                  <td colSpan={5} className="p-3 text-right">Total Nilai Ternak:</td>
                  <td className="p-3 text-right">{formatCurrency(state.livestock.filter(l => l.status === 'active').reduce((s, l) => s + l.currentValue, 0))}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== LIVESTOCK ====================
function LivestockView({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Livestock>>({ type: 'Ayam', gender: 'female', status: 'active' });

  const handleSave = () => {
    if (!formData.code || !formData.type) { alert('Lengkapi data'); return; }
    const livestock: Livestock = {
      id: generateId(),
      code: formData.code || '',
      type: formData.type || '',
      breed: formData.breed || '',
      gender: formData.gender || 'female',
      birthDate: formData.birthDate || '',
      weight: formData.weight || 0,
      status: 'active',
      location: formData.location || '',
      acquisitionCost: formData.acquisitionCost || 0,
      currentValue: formData.acquisitionCost || 0,
      source: formData.source || 'Pembelian',
      businessUnit: formData.businessUnit
    };
    setState({ ...state, livestock: [...state.livestock, livestock] });
    setShowForm(false);
    setFormData({ type: 'Ayam', gender: 'female', status: 'active' });
  };

  const livestockByType = state.livestock.filter(l => l.status === 'active').reduce((acc: any, l) => {
    acc[l.type] = (acc[l.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(livestockByType).map(([type, count]) => (
          <div key={type} className="bg-white rounded-xl border p-4 text-center">
            <p className="text-3xl font-bold text-green-700">{count as number}</p>
            <p className="text-sm text-gray-600">{type}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Data Ternak</h3>
        <button onClick={() => setShowForm(true)} className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-green-800">
          <Plus size={16} /> Tambah Ternak
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-5 space-y-4">
          <h3 className="font-semibold">Tambah Data Ternak</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-600">Kode Ternak</label>
              <input value={formData.code || ''} onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Jenis Ternak</label>
              <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option>Ayam</option><option>Sapi</option><option>Kambing</option><option>Domba</option><option>Bebek</option><option>Puyuh</option><option>Kerbau</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Ras</label>
              <input value={formData.breed || ''} onChange={e => setFormData({ ...formData, breed: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Jenis Kelamin</label>
              <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value as any })} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="female">Betina</option><option value="male">Jantan</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Tanggal Lahir</label>
              <input type="date" value={formData.birthDate || ''} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Berat (kg)</label>
              <input type="number" value={formData.weight || ''} onChange={e => setFormData({ ...formData, weight: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Lokasi Kandang</label>
              <input value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Harga Perolehan</label>
              <input type="number" value={formData.acquisitionCost || ''} onChange={e => setFormData({ ...formData, acquisitionCost: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800">Simpan</button>
            <button onClick={() => setShowForm(false)} className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Batal</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left p-3">Kode</th>
              <th className="text-left p-3">Jenis</th>
              <th className="text-left p-3">Ras</th>
              <th className="text-center p-3">JK</th>
              <th className="text-left p-3">Tgl Lahir</th>
              <th className="text-right p-3">Berat</th>
              <th className="text-left p-3">Lokasi</th>
              <th className="text-right p-3">Nilai</th>
              <th className="text-center p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {state.livestock.map(l => (
              <tr key={l.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-mono text-xs">{l.code}</td>
                <td className="p-3">{l.type}</td>
                <td className="p-3 text-xs">{l.breed}</td>
                <td className="p-3 text-center">{l.gender === 'male' ? '♂' : '♀'}</td>
                <td className="p-3 text-xs">{formatDate(l.birthDate)}</td>
                <td className="p-3 text-right">{l.weight} kg</td>
                <td className="p-3 text-xs">{l.location}</td>
                <td className="p-3 text-right">{formatCurrency(l.currentValue)}</td>
                <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded text-xs ${l.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{l.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== INVENTORY ====================
function InventoryView({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({ category: 'feed', unit: 'kg' });

  const handleSave = () => {
    if (!formData.code || !formData.name) { alert('Lengkapi data'); return; }
    const item: InventoryItem = {
      id: generateId(),
      code: formData.code || '',
      name: formData.name || '',
      category: formData.category as any || 'feed',
      unit: formData.unit || 'kg',
      stock: formData.stock || 0,
      minStock: formData.minStock || 0,
      pricePerUnit: formData.pricePerUnit || 0,
      totalValue: (formData.stock || 0) * (formData.pricePerUnit || 0),
      location: formData.location || '',
      businessUnit: formData.businessUnit,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setState({ ...state, inventory: [...state.inventory, item] });
    setShowForm(false);
    setFormData({ category: 'feed', unit: 'kg' });
  };

  const lowStock = state.inventory.filter(i => i.stock <= i.minStock);

  return (
    <div className="space-y-4">
      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2"><AlertCircle size={18} /> Peringatan Stok Rendah</h4>
          <div className="flex flex-wrap gap-2">
            {lowStock.map(i => (
              <span key={i.id} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs">{i.name}: {i.stock} {i.unit} (min: {i.minStock})</span>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">Total Nilai Persediaan: <span className="font-bold text-green-700">{formatCurrency(state.inventory.reduce((s, i) => s + i.totalValue, 0))}</span></div>
        <button onClick={() => setShowForm(true)} className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-green-800">
          <Plus size={16} /> Tambah Item
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-5 space-y-4">
          <h3 className="font-semibold">Tambah Item Persediaan</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-600">Kode</label>
              <input value={formData.code || ''} onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Nama</label>
              <input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Kategori</label>
              <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="feed">Pakan</option><option value="concentrate">Konsentrat</option><option value="forage">Hijauan</option><option value="medicine">Obat</option><option value="vitamin">Vitamin</option><option value="vaccine">Vaksin</option><option value="material">Bahan Baku</option><option value="supplies">Perlengkapan</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Satuan</label>
              <input value={formData.unit || ''} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Stok</label>
              <input type="number" value={formData.stock || ''} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Min Stok</label>
              <input type="number" value={formData.minStock || ''} onChange={e => setFormData({ ...formData, minStock: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Harga/Unit</label>
              <input type="number" value={formData.pricePerUnit || ''} onChange={e => setFormData({ ...formData, pricePerUnit: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Lokasi</label>
              <input value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800">Simpan</button>
            <button onClick={() => setShowForm(false)} className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Batal</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left p-3">Kode</th>
              <th className="text-left p-3">Nama</th>
              <th className="text-left p-3">Kategori</th>
              <th className="text-right p-3">Stok</th>
              <th className="text-right p-3">Min</th>
              <th className="text-right p-3">Harga/unit</th>
              <th className="text-right p-3">Nilai</th>
              <th className="text-center p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {state.inventory.map(item => (
              <tr key={item.id} className={`border-b hover:bg-gray-50 ${item.stock <= item.minStock ? 'bg-red-50' : ''}`}>
                <td className="p-3 font-mono text-xs">{item.code}</td>
                <td className="p-3 font-medium">{item.name}</td>
                <td className="p-3 capitalize text-xs">{item.category}</td>
                <td className="p-3 text-right">{item.stock} {item.unit}</td>
                <td className="p-3 text-right text-gray-500">{item.minStock}</td>
                <td className="p-3 text-right">{formatCurrency(item.pricePerUnit)}</td>
                <td className="p-3 text-right font-medium">{formatCurrency(item.totalValue)}</td>
                <td className="p-3 text-center">
                  {item.stock <= item.minStock ? 
                    <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">Stok Rendah</span> :
                    <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">Aman</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== PRODUCTION ====================
function ProductionView({ state }: { state: AppState }) {
  const productionCost = calculateProductionCost(state);
  
  const productionByType = state.productionRecords.reduce((acc: any, r) => {
    const key = r.productType;
    if (!acc[key]) acc[key] = { quantity: 0, records: 0 };
    acc[key].quantity += r.quantity;
    acc[key].records += 1;
    return acc;
  }, {});

  const chartData = state.productionRecords.map(r => ({
    date: r.date.slice(5),
    quantity: r.quantity,
    type: r.productType
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700">{productionByType.eggs?.quantity || 0}</p>
          <p className="text-sm text-gray-600">Total Telur (butir)</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{productionByType.milk?.quantity || 0}</p>
          <p className="text-sm text-gray-600">Total Susu (liter)</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{formatCurrency(productionCost.costPerEgg)}</p>
          <p className="text-sm text-gray-600">HPP per Telur</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-2xl font-bold text-purple-700">{formatCurrency(productionCost.costPerLiterMilk)}</p>
          <p className="text-sm text-gray-600">HPP per Liter Susu</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold mb-4">Riwayat Produksi</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left p-3">Tanggal</th>
              <th className="text-left p-3">Unit Usaha</th>
              <th className="text-left p-3">Jenis Ternak</th>
              <th className="text-left p-3">Produk</th>
              <th className="text-right p-3">Jumlah</th>
              <th className="text-left p-3">Satuan</th>
            </tr>
          </thead>
          <tbody>
            {state.productionRecords.map(r => {
              const bu = state.businessUnits.find(b => b.id === r.businessUnitId);
              const typeLabels: Record<string, string> = { eggs: 'Telur', milk: 'Susu', meat: 'Daging', doc: 'DOC', manure: 'Pupuk Kandang', other: 'Lainnya' };
              return (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{formatDate(r.date)}</td>
                  <td className="p-3 text-xs">{bu?.name || '-'}</td>
                  <td className="p-3">{r.livestockType}</td>
                  <td className="p-3">{typeLabels[r.productType]}</td>
                  <td className="p-3 text-right font-medium">{r.quantity}</td>
                  <td className="p-3">{r.unit}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold mb-4">Analisis Biaya Produksi</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-gray-600">Total Biaya Produksi</p>
            <p className="font-bold text-green-700">{formatCurrency(productionCost.totalCost)}</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-xs text-gray-600">Biaya Pakan (%)</p>
            <p className="font-bold text-yellow-700">{productionCost.totalCost > 0 ? ((productionCost.feedCost / productionCost.totalCost) * 100).toFixed(1) : 0}%</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-600">Biaya Tenaga Kerja (%)</p>
            <p className="font-bold text-blue-700">{productionCost.totalCost > 0 ? ((productionCost.laborCost / productionCost.totalCost) * 100).toFixed(1) : 0}%</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-gray-600">Biaya per Ekor</p>
            <p className="font-bold text-purple-700">{formatCurrency(productionCost.costPerAnimal)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== FIXED ASSETS ====================
function AssetsView({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold mb-4">Daftar Aset Tetap</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left p-3">Kode</th>
              <th className="text-left p-3">Nama</th>
              <th className="text-left p-3">Kategori</th>
              <th className="text-right p-3">Harga Perolehan</th>
              <th className="text-right p-3">Akum. Penyusutan</th>
              <th className="text-right p-3">Nilai Buku</th>
              <th className="text-center p-3">Umur (thn)</th>
              <th className="text-center p-3">Metode</th>
            </tr>
          </thead>
          <tbody>
            {state.fixedAssets.map(fa => (
              <tr key={fa.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-mono text-xs">{fa.code}</td>
                <td className="p-3 font-medium">{fa.name}</td>
                <td className="p-3 text-xs">{fa.category}</td>
                <td className="p-3 text-right">{formatCurrency(fa.acquisitionCost)}</td>
                <td className="p-3 text-right text-red-600">{formatCurrency(fa.accumulatedDepreciation)}</td>
                <td className="p-3 text-right font-medium">{formatCurrency(fa.currentValue)}</td>
                <td className="p-3 text-center">{fa.usefulLife}</td>
                <td className="p-3 text-center text-xs">Garis Lurus</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-green-50 font-bold">
              <td colSpan={3} className="p-3 text-right">Total:</td>
              <td className="p-3 text-right">{formatCurrency(state.fixedAssets.reduce((s, fa) => s + fa.acquisitionCost, 0))}</td>
              <td className="p-3 text-right">{formatCurrency(state.fixedAssets.reduce((s, fa) => s + fa.accumulatedDepreciation, 0))}</td>
              <td className="p-3 text-right">{formatCurrency(state.fixedAssets.reduce((s, fa) => s + fa.currentValue, 0))}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">📊 Jadwal Penyusutan Bulanan</h4>
        <div className="space-y-2">
          {state.fixedAssets.map(fa => {
            const monthlyDepr = (fa.acquisitionCost - fa.residualValue) / fa.usefulLife / 12;
            return (
              <div key={fa.id} className="flex items-center justify-between bg-white rounded-lg p-3 border">
                <div>
                  <span className="font-medium text-sm">{fa.name}</span>
                  <span className="text-xs text-gray-500 ml-2">({fa.category})</span>
                </div>
                <span className="font-medium text-sm text-yellow-700">{formatCurrency(monthlyDepr)}/bulan</span>
              </div>
            );
          })}
          <div className="flex items-center justify-between bg-yellow-100 rounded-lg p-3 border font-bold">
            <span>Total Penyusutan Bulanan</span>
            <span>{formatCurrency(state.fixedAssets.reduce((s, fa) => s + (fa.acquisitionCost - fa.residualValue) / fa.usefulLife / 12, 0))}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== CLOSE BOOK ====================
function CloseBookView({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const trialBalance = getTrialBalance(state);
  const totalDebit = trialBalance.reduce((s, r) => s + r.debit, 0);
  const totalCredit = trialBalance.reduce((s, r) => s + r.credit, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 1;
  const openPeriod = state.financialPeriods.find(p => p.status === 'open');

  const handleClosePeriod = () => {
    if (!isBalanced) { alert('Neraca saldo tidak seimbang! Tidak dapat menutup periode.'); return; }
    if (!confirm('Yakin ingin menutup periode ini? Transaksi akan dikunci.')) return;
    
    setState({
      ...state,
      financialPeriods: state.financialPeriods.map(p => p.id === openPeriod?.id ? { ...p, status: 'closed' as const } : p)
    });
    alert('Periode berhasil ditutup!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-bold text-green-800 mb-4">Proses Tutup Buku</h3>
        <p className="text-sm text-gray-600 mb-6">Langkah-langkah penutupan periode akuntansi:</p>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isBalanced ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isBalanced ? '✓' : '✗'}
            </div>
            <div>
              <p className="font-medium text-sm">1. Validasi Transaksi</p>
              <p className="text-xs text-gray-500">{isBalanced ? 'Semua transaksi valid dan seimbang' : 'Terdapat ketidakseimbangan debit dan kredit'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100 text-green-700">✓</div>
            <div>
              <p className="font-medium text-sm">2. Jurnal Penyesuaian</p>
              <p className="text-xs text-gray-500">{state.adjustments.length} jurnal penyesuaian telah dibuat</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100 text-green-700">✓</div>
            <div>
              <p className="font-medium text-sm">3. Laporan Keuangan</p>
              <p className="text-xs text-gray-500">Laporan keuangan telah tersedia</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-700">4</div>
            <div>
              <p className="font-medium text-sm">4. Jurnal Penutup</p>
              <p className="text-xs text-gray-500">Menutup akun nominal (pendapatan & beban) ke laba ditahan</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-700">5</div>
            <div>
              <p className="font-medium text-sm">5. Saldo Awal Periode Berikutnya</p>
              <p className="text-xs text-gray-500">Memindahkan saldo akun riil sebagai saldo awal</p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-800">Periode Aktif: <span className="font-bold">{openPeriod?.name || 'Tidak ada'}</span></p>
          <p className="text-xs text-blue-600 mt-1">{openPeriod ? `${formatDate(openPeriod.startDate)} - ${formatDate(openPeriod.endDate)}` : ''}</p>
        </div>

        <div className="mt-4 flex gap-3">
          <button onClick={handleClosePeriod} disabled={!isBalanced || !openPeriod} className="bg-red-600 text-white px-6 py-2.5 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
            🔒 Tutup Periode
          </button>
          <button className="border px-6 py-2.5 rounded-lg text-sm hover:bg-gray-50">
            🔓 Buka Kembali (Admin)
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== ANALYTICS ====================
function AnalyticsView({ state, metrics }: { state: AppState; metrics: any }) {
  const incomeStatement = calculateIncomeStatement(state);
  const productionCost = calculateProductionCost(state);
  
  const profitMargin = incomeStatement.totalRevenue > 0 ? (incomeStatement.netIncome / incomeStatement.totalRevenue * 100) : 0;
  const feedRatio = productionCost.totalCost > 0 ? (productionCost.feedCost / productionCost.totalCost * 100) : 0;
  const laborRatio = productionCost.totalCost > 0 ? (productionCost.laborCost / productionCost.totalCost * 100) : 0;
  const roi = metrics.totalAssets > 0 ? (incomeStatement.netIncome / metrics.totalAssets * 100) : 0;

  const analyticsData = [
    { label: 'Margin Laba', value: `${profitMargin.toFixed(1)}%`, color: profitMargin > 0 ? 'text-green-700' : 'text-red-700', bg: profitMargin > 0 ? 'bg-green-50' : 'bg-red-50' },
    { label: 'Biaya Pakan / Total', value: `${feedRatio.toFixed(1)}%`, color: 'text-yellow-700', bg: 'bg-yellow-50' },
    { label: 'Biaya TK / Total', value: `${laborRatio.toFixed(1)}%`, color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: 'ROI', value: `${roi.toFixed(2)}%`, color: roi > 0 ? 'text-green-700' : 'text-red-700', bg: roi > 0 ? 'bg-green-50' : 'bg-red-50' },
    { label: 'HPP per Telur', value: formatCurrency(productionCost.costPerEgg), color: 'text-orange-700', bg: 'bg-orange-50' },
    { label: 'Biaya per Ekor', value: formatCurrency(productionCost.costPerAnimal), color: 'text-purple-700', bg: 'bg-purple-50' },
  ];

  const revenueVsExpense = [
    { name: 'Pendapatan', value: incomeStatement.totalRevenue },
    { name: 'Beban', value: incomeStatement.totalExpenses },
    { name: 'Laba', value: Math.max(0, incomeStatement.netIncome) },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {analyticsData.map((item, i) => (
          <div key={i} className={`rounded-xl border p-4 text-center ${item.bg}`}>
            <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-gray-600 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold mb-4">Pendapatan vs Beban vs Laba</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueVsExpense}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => `${(v/1000000).toFixed(0)}jt`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="value" fill="#166534">
                {revenueVsExpense.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold mb-4">Komposisi Biaya Produksi</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={[
                { name: 'Pakan', value: productionCost.feedCost },
                { name: 'Obat', value: productionCost.medicineCost },
                { name: 'Vitamin', value: productionCost.vitaminCost },
                { name: 'Tenaga Kerja', value: productionCost.laborCost },
                { name: 'Listrik', value: productionCost.electricityCost },
                { name: 'Lainnya', value: productionCost.waterCost + productionCost.maintenanceCost + productionCost.depreciationCost },
              ].filter(d => d.value > 0)} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {[0,1,2,3,4,5].map(i => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold mb-4">Ringkasan Analisis Usaha</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">Break Even Point (Telur)</span>
              <span className="font-medium text-sm">{productionCost.costPerEgg > 0 ? formatCurrency(productionCost.costPerEgg) : '-'}/butir</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">Revenue per Animal</span>
              <span className="font-medium text-sm">{metrics.totalLivestock > 0 ? formatCurrency(metrics.totalRevenue / metrics.totalLivestock) : '-'}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">Biaya Produksi Total</span>
              <span className="font-medium text-sm">{formatCurrency(productionCost.totalCost)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">Arus Kas Operasi</span>
              <span className="font-medium text-sm">{formatCurrency(calculateCashFlow(state).operatingCashFlow)}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">Tren Laba</span>
              <span className={`font-medium text-sm ${incomeStatement.netIncome >= 0 ? 'text-green-700' : 'text-red-700'}`}>{incomeStatement.netIncome >= 0 ? '↑ Positif' : '↓ Negatif'}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">Efisiensi Pakan</span>
              <span className="font-medium text-sm">{feedRatio.toFixed(1)}% dari total biaya</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== SETTINGS ====================
function SettingsView({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const handleReset = () => {
    if (confirm('Reset semua data ke data demo? Semua perubahan akan hilang.')) {
      localStorage.removeItem('sipeternak_data');
      window.location.reload();
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sipeternak_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Business Units */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold mb-4">Unit Usaha</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {state.businessUnits.map(bu => (
            <div key={bu.id} className="border rounded-lg p-4">
              <h4 className="font-medium text-green-700">{bu.name}</h4>
              <p className="text-sm text-gray-500">{bu.description}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs ${bu.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {bu.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
                <span className="text-xs text-gray-500">{state.barns.filter(b => b.businessUnitId === bu.id).length} kandang</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Users */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold mb-4">Pengguna & Hak Akses</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left p-3">Nama</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Akses</th>
              <th className="text-center p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {state.users.map(u => {
              const roleLabels: Record<string, string> = { admin: 'Administrator', owner: 'Pemilik', accountant: 'Akuntan', farm_worker: 'Petugas Peternakan', auditor: 'Auditor' };
              const accessLabels: Record<string, string> = { admin: 'Akses Penuh', owner: 'Dashboard & Laporan', accountant: 'Transaksi & Laporan', farm_worker: 'Data Operasional', auditor: 'Baca Saja' };
              return (
                <tr key={u.id} className="border-b">
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3 text-xs">{u.email}</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">{roleLabels[u.role]}</span></td>
                  <td className="p-3 text-xs text-gray-500">{accessLabels[u.role]}</td>
                  <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded text-xs ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.isActive ? 'Aktif' : 'Nonaktif'}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Financial Periods */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold mb-4">Periode Akuntansi</h3>
        <div className="space-y-2">
          {state.financialPeriods.map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <span className="font-medium text-sm">{p.name}</span>
                <span className="text-xs text-gray-500 ml-2">{formatDate(p.startDate)} - {formatDate(p.endDate)}</span>
              </div>
              <span className={`px-3 py-1 rounded text-xs font-medium ${p.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                {p.status === 'open' ? '🔓 Terbuka' : '🔒 Ditutup'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold mb-4">Manajemen Data</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExport} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700">
            <Database size={16} /> Backup Data (JSON)
          </button>
          <button onClick={handleReset} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-red-700">
            <Trash2 size={16} /> Reset ke Data Demo
          </button>
          <button className="border px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50">
            <Printer size={16} /> Cetak Laporan
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3">💡 Data disimpan secara lokal (offline-first). Gunakan backup untuk menyimpan salinan data.</p>
      </div>

      {/* Audit Trail */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold mb-4">Audit Trail</h3>
        <p className="text-sm text-gray-500 mb-3">Seluruh aktivitas tercatat dan dapat ditelusuri.</p>
        <div className="space-y-2">
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <span className="font-medium">Sistem</span> - <span className="text-gray-500">Data demo dimuat dengan {state.journalEntries.length} jurnal, {state.transactions.length} transaksi, {state.livestock.length} ternak, {state.inventory.length} item persediaan</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <span className="font-medium">Administrator</span> - <span className="text-gray-500">Aplikasi SIPETERNAK Accounting diinisialisasi</span>
            <span className="text-xs text-gray-400 ml-2">{new Date().toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
