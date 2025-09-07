import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SplitwiseContract, formatSTX, parseSplitMemo } from './contract';
import { useSplitwise } from './SplitwiseContext';
import { CheckCircle, Clock, AlertCircle, Users } from 'lucide-react';

interface ApproveExpenseProps {
  onSuccess?: () => void;
}

const ApproveExpense: React.FC<ApproveExpenseProps> = ({ onSuccess }) => {
  const { walletAddress, isWalletReady } = useSplitwise();
  const [transactionId, setTransactionId] = useState('');
  const [expenseDetails, setExpenseDetails] = useState<any>(null);
  const [groupInfo, setGroupInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canApprove, setCanApprove] = useState(false);

  const fetchExpenseDetails = async () => {
    if (!transactionId || !isWalletReady) return;

    setIsLoading(true);
    try {
      const [expense, group] = await Promise.all([
        SplitwiseContract.getSplitExpense(parseInt(transactionId)),
        SplitwiseContract.getGroupInfo()
      ]);

      setExpenseDetails(expense);
      setGroupInfo(group);

      // Check if user can approve (is group member and hasn't executed yet)
      if (expense && !expense.executed && walletAddress) {
        const isMember = await SplitwiseContract.isGroupMember(walletAddress);
        setCanApprove(isMember);
      } else {
        setCanApprove(false);
      }
    } catch (error) {
      console.error('Failed to fetch expense details:', error);
      setExpenseDetails(null);
      setGroupInfo(null);
      setCanApprove(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenseDetails();
  }, [transactionId, isWalletReady, walletAddress]);

  const handleApprove = async () => {
    if (!transactionId || !isWalletReady) return;

    setIsSubmitting(true);
    try {
      await SplitwiseContract.approveSplitExpense(parseInt(transactionId));
      
      // Refresh expense details after approval
      setTimeout(() => {
        fetchExpenseDetails();
        onSuccess?.();
      }, 2000);
    } catch (error) {
      console.error('Failed to approve expense:', error);
    } finally {
      setIsSubmitting(false);
    }
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

  const splitInfo = expenseDetails?.memo ? parseSplitMemo(expenseDetails.memo) : null;
  const approvalPercentage = groupInfo && expenseDetails 
    ? (expenseDetails.approvals / groupInfo.approvalThreshold) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-green-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Approve Split Expense</h2>
          <p className="text-neutral-400">Review and approve expense proposals</p>
        </div>
      </div>

      {/* Transaction ID Input */}
      <div className="space-y-2">
        <label htmlFor="transactionId" className="block text-sm font-medium text-white">
          Transaction ID
        </label>
        <div className="flex gap-3">
          <input
            id="transactionId"
            type="number"
            min="0"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="Enter transaction ID to review"
            className="flex-1 px-4 py-3 border-2 rounded-lg text-sm bg-neutral-800 text-white placeholder-neutral-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none border-neutral-600"
          />
          <Button
            onClick={fetchExpenseDetails}
            disabled={!transactionId || isLoading}
            variant="outline"
            className="border-neutral-600 text-neutral-300 hover:bg-neutral-700"
          >
            {isLoading ? 'Loading...' : 'Load'}
          </Button>
        </div>
      </div>

      {/* Expense Details */}
      {expenseDetails && (
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Expense Details</h3>
            <div className="flex items-center gap-2">
              {expenseDetails.executed ? (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30">
                  <CheckCircle className="w-3 h-3 inline mr-1" />
                  EXECUTED
                </span>
              ) : (
                <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium border border-orange-500/30">
                  <Clock className="w-3 h-3 inline mr-1" />
                  PENDING
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-neutral-400 mb-1">Expense Title</p>
                <p className="text-white">{splitInfo?.title || 'Multisig Payment'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-neutral-400 mb-1">Proposed By</p>
                <p className="text-white font-mono text-sm">
                  {expenseDetails.proposer.slice(0, 8)}...{expenseDetails.proposer.slice(-6)}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-neutral-400 mb-1">Payment To</p>
                <p className="text-white font-mono text-sm">
                  {expenseDetails.recipient.slice(0, 8)}...{expenseDetails.recipient.slice(-6)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-neutral-400 mb-1">Total Amount</p>
                <p className="text-white text-xl font-bold">{formatSTX(expenseDetails.amount)}</p>
              </div>

              {splitInfo?.members && (
                <div>
                  <p className="text-sm font-medium text-neutral-400 mb-1">Split Among</p>
                  <p className="text-white">{splitInfo.members} members</p>
                  {splitInfo.perPerson && (
                    <p className="text-sm text-neutral-400">
                      {(splitInfo.perPerson).toFixed(6)} STX per person
                    </p>
                  )}
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-neutral-400 mb-1">Created</p>
                <p className="text-white text-sm">
                  {new Date(expenseDetails.createdAt * 1000).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Approval Progress */}
          <div className="mt-6 pt-6 border-t border-neutral-600">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-white flex items-center gap-2">
                <Users className="w-4 h-4" />
                Approval Progress
              </h4>
              <span className="text-sm text-neutral-400">
                {expenseDetails.approvals}/{groupInfo?.approvalThreshold} approvals
              </span>
            </div>
            
            <div className="w-full bg-neutral-700 rounded-full h-2 mb-3">
              <div
                className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(approvalPercentage, 100)}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-xs text-neutral-400">
              <span>
                {approvalPercentage >= 100 ? 'Ready to execute' : 'Needs more approvals'}
              </span>
              <span>{approvalPercentage.toFixed(0)}%</span>
            </div>
          </div>

          {expenseDetails.memo && (
            <div className="mt-4 p-3 bg-neutral-900 rounded border border-neutral-600">
              <p className="text-xs font-medium text-neutral-400 mb-1">MEMO</p>
              <p className="text-sm text-white">{expenseDetails.memo}</p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {expenseDetails && (
        <div className="flex gap-3">
          {canApprove && !expenseDetails.executed && (
            <Button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="bg-green-500 hover:bg-green-600 text-white flex-1"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Expense
                </>
              )}
            </Button>
          )}

          {expenseDetails.executed && (
            <div className="flex-1 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
              <p className="text-green-400 font-medium">✅ This expense has been executed</p>
            </div>
          )}

          {!canApprove && !expenseDetails.executed && expenseDetails && (
            <div className="flex-1 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg text-center">
              <p className="text-orange-400 font-medium flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                You cannot approve this expense
              </p>
              <p className="text-orange-300/70 text-sm mt-1">
                You must be a group member to approve expenses
              </p>
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-neutral-400 bg-neutral-800 border border-neutral-700 p-3 rounded">
        <strong>How to approve:</strong> Enter the transaction ID of the expense you want to approve. 
        You must be a member of the group to approve expenses. Once enough approvals are collected, 
        any member can execute the expense to send funds.
      </div>
    </div>
  );
};

export default ApproveExpense;