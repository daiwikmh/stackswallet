import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SplitwiseContract, formatSTX, parseSplitMemo } from './contract';
import { useSplitwise } from './SplitwiseContext';
import { RefreshCw, CheckCircle, Clock, Play, Users, Calendar, DollarSign } from 'lucide-react';

interface ExpenseListProps {
  onRefresh?: () => void;
}

interface ExpenseItem {
  id: number;
  proposer: string;
  recipient: string;
  amount: number;
  memo: string;
  approvals: number;
  executed: boolean;
  createdAt: number;
  expiresAt: number;
  splitInfo: { title: string; members?: number; perPerson?: number };
  canSettle: boolean;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ onRefresh }) => {
  const { walletAddress, isWalletReady } = useSplitwise();
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [groupInfo, setGroupInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [settlementLoading, setSettlementLoading] = useState<number | null>(null);

  const loadExpenses = async () => {
    if (!isWalletReady) return;

    setIsLoading(true);
    try {
      const group = await SplitwiseContract.getGroupInfo();
      setGroupInfo(group);

      if (group?.transactionNonce) {
        const expensePromises = [];
        
        // Load recent expenses (last 20 transactions)
        const maxId = Math.max(0, group.transactionNonce - 1);
        const startId = Math.max(0, maxId - 19);
        
        for (let i = startId; i <= maxId; i++) {
          expensePromises.push(
            SplitwiseContract.getSplitExpense(i).then(async (expense) => {
              if (expense) {
                const canSettle = await SplitwiseContract.canSettleExpense(i);
                return {
                  id: i,
                  ...expense,
                  splitInfo: parseSplitMemo(expense.memo || ''),
                  canSettle
                };
              }
              return null;
            }).catch(() => null)
          );
        }

        const results = await Promise.all(expensePromises);
        const validExpenses = results.filter((exp): exp is ExpenseItem => exp !== null);
        
        // Sort by creation date (newest first)
        setExpenses(validExpenses.sort((a, b) => b.createdAt - a.createdAt));
      }
    } catch (error) {
      console.error('Failed to load expenses:', error);
      setExpenses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [isWalletReady]);

  const handleSettleExpense = async (expenseId: number) => {
    setSettlementLoading(expenseId);
    try {
      await SplitwiseContract.settleSplitExpense(expenseId);
      
      // Refresh after settlement
      setTimeout(() => {
        loadExpenses();
        onRefresh?.();
      }, 2000);
    } catch (error) {
      console.error('Failed to settle expense:', error);
    } finally {
      setSettlementLoading(null);
    }
  };

  const refreshData = () => {
    loadExpenses();
    onRefresh?.();
  };

  if (!isWalletReady) {
    return (
      <div className="p-6 text-center">
        <div className="text-orange-400 mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-white mb-2">Wallet Not Ready</h3>
        <p className="text-neutral-400">
          Please ensure your wallet is connected and an address is detected.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">All Split Expenses</h2>
            <p className="text-neutral-400">View and manage group expenses</p>
          </div>
        </div>
        
        <Button
          onClick={refreshData}
          disabled={isLoading}
          variant="ghost"
          size="sm"
          className="text-neutral-400 hover:text-orange-500"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Group Summary */}
      {groupInfo && (
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs font-medium text-neutral-400 mb-1">GROUP BALANCE</p>
              <p className="text-lg font-bold text-white">{formatSTX(groupInfo.balance)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-400 mb-1">MEMBERS</p>
              <p className="text-lg font-bold text-white">{groupInfo.membersCount}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-400 mb-1">APPROVAL THRESHOLD</p>
              <p className="text-lg font-bold text-white">{groupInfo.approvalThreshold}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-400 mb-1">TOTAL EXPENSES</p>
              <p className="text-lg font-bold text-white">{expenses.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-orange-500 mx-auto mb-2" />
            <p className="text-neutral-400">Loading expenses...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-700 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-neutral-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Expenses Found</h3>
            <p className="text-neutral-400">Create your first split expense to get started!</p>
          </div>
        ) : (
          expenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 hover:border-neutral-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {expense.splitInfo.title}
                    </h3>
                    <span className="text-xs font-medium text-neutral-500 bg-neutral-700 px-2 py-1 rounded">
                      ID: {expense.id}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-neutral-400">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>{formatSTX(expense.amount)}</span>
                    </div>
                    
                    {expense.splitInfo.members && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{expense.splitInfo.members} members</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(expense.createdAt * 1000).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {expense.executed ? (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30">
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                      COMPLETED
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium border border-orange-500/30">
                      <Clock className="w-3 h-3 inline mr-1" />
                      PENDING
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs font-medium text-neutral-400 mb-1">PROPOSED BY</p>
                  <p className="text-sm font-mono text-white">
                    {expense.proposer.slice(0, 8)}...{expense.proposer.slice(-6)}
                    {expense.proposer === walletAddress && (
                      <span className="ml-2 text-xs text-orange-400">(You)</span>
                    )}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-neutral-400 mb-1">PAYMENT TO</p>
                  <p className="text-sm font-mono text-white">
                    {expense.recipient.slice(0, 8)}...{expense.recipient.slice(-6)}
                    {expense.recipient === walletAddress && (
                      <span className="ml-2 text-xs text-orange-400">(You)</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Approval Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-neutral-400">APPROVAL PROGRESS</p>
                  <span className="text-xs text-neutral-400">
                    {expense.approvals}/{groupInfo?.approvalThreshold} approvals
                  </span>
                </div>
                
                <div className="w-full bg-neutral-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((expense.approvals / (groupInfo?.approvalThreshold || 1)) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>

              {expense.splitInfo.perPerson && (
                <div className="mb-4 p-3 bg-neutral-900 rounded border border-neutral-600">
                  <p className="text-xs font-medium text-neutral-400 mb-1">SPLIT DETAILS</p>
                  <p className="text-sm text-white">
                    {expense.splitInfo.perPerson.toFixed(6)} STX per person
                    {expense.splitInfo.members && ` (${expense.splitInfo.members} members)`}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {!expense.executed && expense.canSettle && (
                <Button
                  onClick={() => handleSettleExpense(expense.id)}
                  disabled={settlementLoading === expense.id}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                  size="sm"
                >
                  {settlementLoading === expense.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Settling...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Execute Payment
                    </>
                  )}
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Help Text */}
      <div className="text-xs text-neutral-400 bg-neutral-800 border border-neutral-700 p-3 rounded">
        <strong>Expense Status:</strong> Pending expenses need enough approvals before they can be executed. 
        Completed expenses have been settled and funds transferred. You can execute any expense that has 
        received enough approvals.
      </div>
    </div>
  );
};

export default ExpenseList;