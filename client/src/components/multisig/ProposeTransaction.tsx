import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MultisigContract, STXToMicroSTX, formatSTX } from './contract';
import { useMultisig } from './MultisigContext';
import { Send, FileText, DollarSign } from 'lucide-react';

interface ProposeTransactionProps {
  onSuccess?: () => void;
}

const ProposeTransaction: React.FC<ProposeTransactionProps> = ({ onSuccess }) => {
  const { walletAddress, isWalletReady } = useMultisig();
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWalletReady || !recipient || !amount || parseFloat(amount) <= 0) return;

    setIsSubmitting(true);
    try {
      const microSTXAmount = STXToMicroSTX(parseFloat(amount));
      await MultisigContract.proposeTransaction(
        recipient, 
        microSTXAmount, 
        memo.trim() || undefined
      );
      
      // Reset form
      setRecipient('');
      setAmount('');
      setMemo('');
      onSuccess?.();
    } catch (error) {
      console.error('Failed to propose transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidAddress = (address: string): boolean => {
    return /^S[TP][A-Z0-9]{39}$/.test(address);
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
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
          <Send className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Propose Transaction</h2>
          <p className="text-neutral-400">Create a new transaction that requires approval from wallet owners</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipient Address */}
        <div className="space-y-2">
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-900">
            Recipient Address
          </label>
          <input
            id="recipient"
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="SP... or ST..."
            className={`block w-full px-4 py-3 border-2 rounded-lg focus:ring-2 text-sm font-mono bg-white text-gray-900 placeholder-gray-500 focus:outline-none ${
              recipient && !isValidAddress(recipient)
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            required
          />
          {recipient && !isValidAddress(recipient) && (
            <div className="text-sm text-red-600">
              Please enter a valid Stacks address (starts with SP or ST)
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-900">
            Amount
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="amount"
              type="number"
              step="0.000001"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.000000"
              className="block w-full pl-10 pr-20 py-3 border-2 rounded-lg text-sm bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none border-gray-300"
              required
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm font-medium">STX</span>
            </div>
          </div>
          {amount && parseFloat(amount) > 0 && (
            <div className="text-sm text-gray-600">
              = {formatSTX(STXToMicroSTX(parseFloat(amount)))} (in microSTX)
            </div>
          )}
        </div>

        {/* Memo (Optional) */}
        <div className="space-y-2">
          <label htmlFor="memo" className="block text-sm font-medium text-gray-900">
            Memo <span className="text-gray-500">(Optional)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Transaction description or notes..."
              rows={3}
              maxLength={34}
              className="block w-full pl-10 pr-3 py-3 border-2 rounded-lg text-sm bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none border-gray-300 resize-none"
            />
          </div>
          <div className="text-sm text-gray-500">
            {memo.length}/34 characters
          </div>
        </div>

        {/* Transaction Info */}
        <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/30">
          <h4 className="font-medium text-orange-400 mb-2">Transaction Details</h4>
          <div className="text-sm text-neutral-300 space-y-1">
            <div><strong>Proposer:</strong> {walletAddress}</div>
            {recipient && <div><strong>Recipient:</strong> {recipient}</div>}
            {amount && <div><strong>Amount:</strong> {amount} STX</div>}
            {memo && <div><strong>Memo:</strong> {memo}</div>}
          </div>
          <div className="text-xs text-blue-600 mt-3">
            This transaction will require approval from other wallet owners before execution.
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || !recipient || !amount || parseFloat(amount) <= 0 || !isValidAddress(recipient)}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Proposing Transaction...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Propose Transaction
            </>
          )}
        </Button>
      </form>

      {/* Help Text */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
        <strong>Note:</strong> After proposing, other wallet owners can approve this transaction. 
        Once the required number of approvals is reached, any owner can execute the transaction 
        to send the funds to the recipient.
      </div>
    </div>
  );
};

export default ProposeTransaction;