import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MultisigContract, STXToMicroSTX, formatSTX, microSTXToSTX } from './contract';
import { useMultisig } from './MultisigContext';
import { PiggyBank, DollarSign } from 'lucide-react';

interface DepositFundsProps {
  onSuccess?: () => void;
}

const DepositFunds: React.FC<DepositFundsProps> = ({ onSuccess }) => {
  const { walletAddress, isWalletReady } = useMultisig();
  const [amount, setAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWalletReady || !amount || parseFloat(amount) <= 0) return;

    setIsSubmitting(true);
    try {
      const microSTXAmount = STXToMicroSTX(parseFloat(amount));
      await MultisigContract.deposit(microSTXAmount);
      setAmount('');
      onSuccess?.();
    } catch (error) {
      console.error('Failed to deposit funds:', error);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
          <PiggyBank className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Deposit Funds</h2>
          <p className="text-neutral-400">Add STX to the multisig wallet for transactions</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Input */}
        <div className="space-y-2">
          <label htmlFor="amount" className="block text-sm font-medium text-white">
            Deposit Amount
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              id="amount"
              type="number"
              step="0.000001"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.000000"
              className="block w-full pl-10 pr-20 py-3 border-2 rounded-lg text-sm bg-neutral-800 text-white placeholder-neutral-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none border-neutral-600"
              required
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-neutral-400 sm:text-sm font-medium">STX</span>
            </div>
          </div>
          {amount && parseFloat(amount) > 0 && (
            <div className="text-sm text-neutral-400">
              = {formatSTX(STXToMicroSTX(parseFloat(amount)))} (in microSTX)
            </div>
          )}
        </div>

        {/* Deposit Info */}
        <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/30">
          <h4 className="font-medium text-orange-400 mb-2">Deposit Information</h4>
          <ul className="text-sm text-neutral-300 space-y-1">
            <li>• Funds will be transferred to the multisig contract</li>
            <li>• All owners can see the deposited funds</li>
            <li>• Funds can only be spent through approved transactions</li>
            <li>• Anyone can deposit funds to the wallet</li>
          </ul>
        </div>

        {/* Wallet Address Display */}
        <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
          <label className="block text-sm font-medium text-white mb-2">
            Depositing From
          </label>
          <div className="font-mono text-sm bg-neutral-900 text-white p-3 rounded border border-neutral-600">
            {walletAddress}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Depositing...
            </>
          ) : (
            <>
              <PiggyBank className="w-4 h-4 mr-2" />
              Deposit {amount ? `${amount} STX` : 'Funds'}
            </>
          )}
        </Button>
      </form>

      {/* Help Text */}
      <div className="text-xs text-neutral-400 bg-neutral-800 border border-neutral-700 p-3 rounded">
        <strong>Note:</strong> Deposited funds will be held by the multisig contract and can only be spent 
        through transactions that receive the required number of approvals from wallet owners.
      </div>
    </div>
  );
};

export default DepositFunds;