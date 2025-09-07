import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MultisigContract, TransactionInfo, formatSTX, formatAddress } from './contract';
import { useMultisig } from './MultisigContext';
import { CheckCircle, Clock, Send, FileText, User, Calendar } from 'lucide-react';

interface TransactionListProps {
  onRefresh?: () => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ onRefresh }) => {
  const { walletAddress, isWalletReady } = useMultisig();
  const [transactions, setTransactions] = useState<Array<{ id: number; info: TransactionInfo }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [walletInfo, setWalletInfo] = useState<any>(null);
  const [expandedTx, setExpandedTx] = useState<number | null>(null);

  const loadTransactions = async () => {
    if (!isWalletReady) return;

    setIsLoading(true);
    try {
      // First get wallet info to know how many transactions exist
      const info = await MultisigContract.getWalletInfo();
      if (info) {
        setWalletInfo(info);
        
        // Load recent transactions (last 10)
        const txs: Array<{ id: number; info: TransactionInfo }> = [];
        const maxTx = Math.min(info.transactionNonce, 10);
        
        for (let i = info.transactionNonce; i > info.transactionNonce - maxTx && i > 0; i--) {
          const txInfo = await MultisigContract.getTransaction(i);
          if (txInfo) {
            txs.push({ id: i, info: txInfo });
          }
        }
        
        setTransactions(txs);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [isWalletReady, walletAddress]);

  const handleApprove = async (txId: number) => {
    try {
      await MultisigContract.approveTransaction(txId);
      setTimeout(() => {
        loadTransactions();
        onRefresh?.();
      }, 2000);
    } catch (error) {
      console.error('Failed to approve transaction:', error);
    }
  };

  const handleExecute = async (txId: number) => {
    try {
      await MultisigContract.executeTransaction(txId);
      setTimeout(() => {
        loadTransactions();
        onRefresh?.();
      }, 2000);
    } catch (error) {
      console.error('Failed to execute transaction:', error);
    }
  };

  const getTransactionStatus = (tx: TransactionInfo) => {
    if (tx.executed) return { label: 'Executed', color: 'green', icon: CheckCircle };
    
    const now = Date.now() / 1000; // Current time in seconds
    const expiryTime = tx.expiresAt; // Assuming this is in seconds
    
    if (now > expiryTime) return { label: 'Expired', color: 'red', icon: Clock };
    if (walletInfo && tx.approvals >= walletInfo.approvalThreshold) {
      return { label: 'Ready to Execute', color: 'blue', icon: Send };
    }
    return { label: `${tx.approvals}/${walletInfo?.approvalThreshold || 0} Approvals`, color: 'yellow', icon: Clock };
  };

  if (!isWalletReady) {
    return (
      <div className="p-6 text-center">
        <div className="text-yellow-600 mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Wallet Not Ready</h3>
        <p className="text-gray-600">
          Please ensure your wallet is connected and an address is detected.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
            <p className="text-gray-600">View and manage pending and completed transactions</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={loadTransactions}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Found</h3>
          <p className="text-gray-600">No transactions have been proposed yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map(({ id, info }) => {
            const status = getTransactionStatus(info);
            const StatusIcon = status.icon;
            const isExpanded = expandedTx === id;
            
            return (
              <div key={id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedTx(isExpanded ? null : id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        status.color === 'green' ? 'bg-green-100 text-green-600' :
                        status.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        status.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        <StatusIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">Transaction #{id}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            status.color === 'green' ? 'bg-green-100 text-green-800' :
                            status.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                            status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatSTX(info.amount)} to {formatAddress(info.recipient)}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(info.createdAt * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Transaction Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Amount:</span>
                            <span className="font-mono">{formatSTX(info.amount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Recipient:</span>
                            <span className="font-mono text-xs">{formatAddress(info.recipient)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Proposer:</span>
                            <span className="font-mono text-xs">{formatAddress(info.proposer)}</span>
                          </div>
                          {info.memo && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Memo:</span>
                              <span className="italic">{info.memo}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Status</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Approvals:</span>
                            <span>{info.approvals}/{walletInfo?.approvalThreshold || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Created:</span>
                            <span>{new Date(info.createdAt * 1000).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Expires:</span>
                            <span>{new Date(info.expiresAt * 1000).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Executed:</span>
                            <span>{info.executed ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {!info.executed && (
                      <div className="flex gap-2 pt-4 border-t border-gray-200">
                        {walletInfo && info.approvals < walletInfo.approvalThreshold && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(id)}
                            className="text-green-600 border-green-300 hover:bg-green-50"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        
                        {walletInfo && info.approvals >= walletInfo.approvalThreshold && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleExecute(id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Execute
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransactionList;