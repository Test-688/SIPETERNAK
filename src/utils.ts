import { Account, JournalEntry, AppState } from './types';

export function calculateAccountBalance(accountId: string, journals: JournalEntry[]): number {
  let balance = 0;
  journals.forEach(j => {
    if (j.status === 'posted' || j.status === 'adjusted') {
      j.entries.forEach(e => {
        if (e.accountId === accountId) {
          balance += e.debit - e.credit;
        }
      });
    }
  });
  return balance;
}

export function getTrialBalance(state: AppState): { accountId: string; accountName: string; accountCode: string; debit: number; credit: number; type: string }[] {
  const result: { accountId: string; accountName: string; accountCode: string; debit: number; credit: number; type: string }[] = [];
  
  state.accounts.filter(a => a.isActive).forEach(account => {
    let balance = calculateAccountBalance(account.id, state.journalEntries);
    
    // Apply normal balance logic
    let debit = 0, credit = 0;
    if (account.normalBalance === 'debit') {
      if (balance >= 0) debit = balance;
      else credit = Math.abs(balance);
    } else {
      if (balance <= 0) credit = Math.abs(balance);
      else debit = balance;
    }
    
    if (debit > 0 || credit > 0) {
      result.push({
        accountId: account.id,
        accountName: account.name,
        accountCode: account.code,
        debit,
        credit,
        type: account.type
      });
    }
  });
  
  return result.sort((a, b) => a.accountCode.localeCompare(b.accountCode));
}

export function validateJournalBalance(entries: JournalEntry['entries']): boolean {
  const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);
  return Math.abs(totalDebit - totalCredit) < 0.01;
}

export function calculateIncomeStatement(state: AppState) {
  const revenueAccounts = state.accounts.filter(a => a.type === 'revenue' && a.isActive);
  const expenseAccounts = state.accounts.filter(a => a.type === 'expense' && a.isActive);
  
  let totalRevenue = 0;
  let totalExpenses = 0;
  
  const revenueDetails: { name: string; amount: number }[] = [];
  const expenseDetails: { name: string; amount: number }[] = [];
  
  revenueAccounts.forEach(account => {
    const balance = Math.abs(calculateAccountBalance(account.id, state.journalEntries));
    if (balance > 0) {
      revenueDetails.push({ name: account.name, amount: balance });
      totalRevenue += balance;
    }
  });
  
  expenseAccounts.forEach(account => {
    const balance = Math.abs(calculateAccountBalance(account.id, state.journalEntries));
    if (balance > 0) {
      expenseDetails.push({ name: account.name, amount: balance });
      totalExpenses += balance;
    }
  });
  
  return {
    revenue: revenueDetails,
    totalRevenue,
    expenses: expenseDetails,
    totalExpenses,
    netIncome: totalRevenue - totalExpenses
  };
}

export function calculateBalanceSheet(state: AppState) {
  const assetAccounts = state.accounts.filter(a => a.type === 'asset' && a.isActive);
  const liabilityAccounts = state.accounts.filter(a => a.type === 'liability' && a.isActive);
  const equityAccounts = state.accounts.filter(a => a.type === 'equity' && a.isActive);
  
  let totalAssets = 0;
  let totalLiabilities = 0;
  let totalEquity = 0;
  
  const assetDetails: { name: string; amount: number }[] = [];
  const liabilityDetails: { name: string; amount: number }[] = [];
  const equityDetails: { name: string; amount: number }[] = [];
  
  assetAccounts.forEach(account => {
    const balance = calculateAccountBalance(account.id, state.journalEntries);
    const amount = account.normalBalance === 'debit' ? balance : -balance;
    if (amount > 0) {
      assetDetails.push({ name: account.name, amount });
      totalAssets += amount;
    }
  });
  
  liabilityAccounts.forEach(account => {
    const balance = calculateAccountBalance(account.id, state.journalEntries);
    const amount = account.normalBalance === 'credit' ? -balance : balance;
    if (amount > 0) {
      liabilityDetails.push({ name: account.name, amount });
      totalLiabilities += amount;
    }
  });
  
  equityAccounts.forEach(account => {
    const balance = calculateAccountBalance(account.id, state.journalEntries);
    const amount = account.normalBalance === 'credit' ? -balance : balance;
    if (amount !== 0) {
      equityDetails.push({ name: account.name, amount });
      totalEquity += amount;
    }
  });
  
  // Add net income to equity
  const incomeStatement = calculateIncomeStatement(state);
  if (incomeStatement.netIncome !== 0) {
    equityDetails.push({ name: 'Laba/Rugi Berjalan', amount: incomeStatement.netIncome });
    totalEquity += incomeStatement.netIncome;
  }
  
  return {
    assets: assetDetails,
    totalAssets,
    liabilities: liabilityDetails,
    totalLiabilities,
    equity: equityDetails,
    totalEquity,
    isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1
  };
}

export function calculateCashFlow(state: AppState) {
  const cashAccount = state.accounts.find(a => a.code === '1-1000');
  const bankAccount = state.accounts.find(a => a.code === '1-1100');
  
  let operatingCashFlow = 0;
  let investingCashFlow = 0;
  let financingCashFlow = 0;
  
  state.journalEntries.filter(j => j.status === 'posted').forEach(journal => {
    journal.entries.forEach(entry => {
      if (cashAccount && (entry.accountId === cashAccount.id)) {
        const net = entry.debit - entry.credit;
        // Categorize based on related accounts
        const otherEntries = journal.entries.filter(e => e.accountId !== cashAccount.id);
        otherEntries.forEach(oe => {
          const account = state.accounts.find(a => a.id === oe.accountId);
          if (account) {
            if (account.type === 'revenue' || account.type === 'expense') {
              operatingCashFlow += net;
            } else if (account.type === 'asset' && (account.code.startsWith('1-1') && parseInt(account.code.split('-')[1]) >= 500)) {
              investingCashFlow += net;
            } else if (account.type === 'equity' || account.type === 'liability') {
              financingCashFlow += net;
            } else {
              operatingCashFlow += net;
            }
          }
        });
      }
    });
  });
  
  const cashBalance = (cashAccount ? calculateAccountBalance(cashAccount.id, state.journalEntries) : 0) +
    (bankAccount ? calculateAccountBalance(bankAccount.id, state.journalEntries) : 0);
  
  return {
    operatingCashFlow,
    investingCashFlow,
    financingCashFlow,
    netCashFlow: operatingCashFlow + investingCashFlow + financingCashFlow,
    cashBalance
  };
}

export function calculateProductionCost(state: AppState, businessUnitId?: string) {
  const feedExpense = state.accounts.find(a => a.code === '5-1000');
  const medicineExpense = state.accounts.find(a => a.code === '5-1100');
  const vitaminExpense = state.accounts.find(a => a.code === '5-1200');
  const laborExpense = state.accounts.find(a => a.code === '5-1300');
  const electricityExpense = state.accounts.find(a => a.code === '5-1400');
  const waterExpense = state.accounts.find(a => a.code === '5-1500');
  const maintenanceExpense = state.accounts.find(a => a.code === '5-1700');
  const depreciationExpense = state.accounts.find(a => a.code === '5-1800');
  
  const getBalance = (account: Account | undefined) => {
    if (!account) return 0;
    return Math.abs(calculateAccountBalance(account.id, state.journalEntries));
  };
  
  const feedCost = getBalance(feedExpense);
  const medicineCost = getBalance(medicineExpense);
  const vitaminCost = getBalance(vitaminExpense);
  const laborCost = getBalance(laborExpense);
  const electricityCost = getBalance(electricityExpense);
  const waterCost = getBalance(waterExpense);
  const maintenanceCost = getBalance(maintenanceExpense);
  const depreciationCost = getBalance(depreciationExpense);
  
  const totalCost = feedCost + medicineCost + vitaminCost + laborCost + electricityCost + waterCost + maintenanceCost + depreciationCost;
  
  // Get production data
  const records = businessUnitId 
    ? state.productionRecords.filter(r => r.businessUnitId === businessUnitId)
    : state.productionRecords;
  
  const totalEggs = records.filter(r => r.productType === 'eggs').reduce((sum, r) => sum + r.quantity, 0);
  const totalMilk = records.filter(r => r.productType === 'milk').reduce((sum, r) => sum + r.quantity, 0);
  const activeLivestock = businessUnitId 
    ? state.livestock.filter(l => l.status === 'active' && l.businessUnit === businessUnitId).length
    : state.livestock.filter(l => l.status === 'active').length;
  
  return {
    feedCost,
    medicineCost,
    vitaminCost,
    laborCost,
    electricityCost,
    waterCost,
    maintenanceCost,
    depreciationCost,
    totalCost,
    costPerAnimal: activeLivestock > 0 ? totalCost / activeLivestock : 0,
    costPerEgg: totalEggs > 0 ? totalCost / totalEggs : 0,
    costPerLiterMilk: totalMilk > 0 ? totalCost / totalMilk : 0,
    totalEggs,
    totalMilk,
    activeLivestock
  };
}

export function getDashboardMetrics(state: AppState) {
  const cashAccount = state.accounts.find(a => a.code === '1-1000');
  const bankAccount = state.accounts.find(a => a.code === '1-1100');
  const inventoryAccounts = state.accounts.filter(a => a.code.startsWith('1-13'));
  const livestockAccount = state.accounts.find(a => a.code === '1-1400');
  const assetAccounts = state.accounts.filter(a => a.type === 'asset' && a.isActive);
  
  const cashBalance = cashAccount ? calculateAccountBalance(cashAccount.id, state.journalEntries) : 0;
  const bankBalance = bankAccount ? calculateAccountBalance(bankAccount.id, state.journalEntries) : 0;
  
  const inventoryValue = state.inventory.reduce((sum, item) => sum + item.totalValue, 0);
  const livestockValue = state.livestock.filter(l => l.status === 'active').reduce((sum, l) => sum + l.currentValue, 0);
  
  let totalAssets = 0;
  assetAccounts.forEach(account => {
    const balance = calculateAccountBalance(account.id, state.journalEntries);
    const amount = account.normalBalance === 'debit' ? balance : -balance;
    if (amount > 0) totalAssets += amount;
  });
  
  const incomeStatement = calculateIncomeStatement(state);
  const productionCost = calculateProductionCost(state);
  
  return {
    cash: cashBalance,
    bank: bankBalance,
    totalRevenue: incomeStatement.totalRevenue,
    totalExpenses: incomeStatement.totalExpenses,
    netIncome: incomeStatement.netIncome,
    inventoryValue,
    livestockValue,
    totalAssets,
    totalLivestock: state.livestock.filter(l => l.status === 'active').length,
    feedCost: productionCost.feedCost,
    medicineCost: productionCost.medicineCost + productionCost.vitaminCost,
    laborCost: productionCost.laborCost,
    totalProductionCost: productionCost.totalCost,
    costPerAnimal: productionCost.costPerAnimal,
    costPerEgg: productionCost.costPerEgg,
    costPerLiterMilk: productionCost.costPerLiterMilk,
    totalEggs: productionCost.totalEggs,
    totalMilk: productionCost.totalMilk,
  };
}
