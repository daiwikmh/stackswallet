import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MultisigContract, STXToMicroSTX, formatSTX } from './contract';
import { useMultisig } from './MultisigContext';
import { Plus, Trash2, Users, Shield } from 'lucide-react';

interface InitializeWalletProps {
  onSuccess?: () => void;
}

const InitializeWallet: React.FC<InitializeWalletProps> = ({ onSuccess }) => {
  const { walletAddress, isWalletReady } = useMultisig();
  const [owners, setOwners] = useState<string[]>([]);
  const [threshold, setThreshold] = useState<number>(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newOwner, setNewOwner] = useState('');

  // Initialize owners array when wallet address is available
  React.useEffect(() => {
    if (walletAddress && owners.length === 0) {
      setOwners([walletAddress]);
    }
  }, [walletAddress, owners.length]);

  const addOwner = () => {
    if (newOwner && !owners.includes(newOwner) && owners.length < 10) {
      setOwners([...owners, newOwner]);
      setNewOwner('');
      // Ensure threshold doesn't exceed owner count
      if (threshold > owners.length + 1) {
        setThreshold(owners.length + 1);
      }
    }
  };

  const removeOwner = (index: number) => {
    if (owners.length > 1) {
      const newOwners = owners.filter((_, i) => i !== index);
      setOwners(newOwners);
      // Ensure threshold doesn't exceed owner count
      if (threshold > newOwners.length) {
        setThreshold(newOwners.length);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!isWalletReady) {
      console.log('⚠️ Wallet not ready');
      return;
    }
    
    if (owners.length === 0) {
      console.log('⚠️ No owners specified');
      return;
    }
    
    if (threshold === 0 || threshold > owners.length) {
      console.log('⚠️ Invalid threshold:', threshold);
      return;
    }

    // Filter out any empty addresses
    const validOwners = owners.filter(owner => owner && owner.trim() !== '');
    if (validOwners.length === 0) {
      console.log('⚠️ No valid owner addresses');
      return;
    }

    console.log('🔄 Initializing multisig wallet with:', { 
      owners: validOwners, 
      threshold,
      walletAddress,
      isWalletReady 
    });
    
    setIsSubmitting(true);
    try {
      console.log('📤 Calling MultisigContract.initialize...');
      const result = await MultisigContract.initialize(validOwners, threshold);
      console.log('✅ Initialize call completed:', result);
      onSuccess?.();
    } catch (error) {
      console.error('❌ Failed to initialize wallet:', error);
      alert(`Failed to initialize wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
          <Shield className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Initialize Multisig Wallet</h2>
          <p className="text-neutral-400">Set up a new multisig wallet with initial owners and approval threshold</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Owners Section */}
        <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Wallet Owners
          </h3>
          
          {/* Current Owners List */}
          <div className="space-y-3 mb-4">
            {owners.map((owner, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-neutral-900 rounded border border-neutral-600">
                <div className="flex-1">
                  <div className="text-sm font-mono text-white">{owner}</div>
                  {index === 0 && (
                    <div className="text-xs text-orange-400 mt-1">Current Wallet (You)</div>
                  )}
                </div>
                {owners.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOwner(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Add New Owner */}
          {owners.length < 10 && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                placeholder="Enter owner address (SP... or ST...)"
                className="flex-1 px-4 py-3 border-2 rounded-lg font-mono text-sm bg-neutral-800 text-white placeholder-neutral-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none border-neutral-600"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addOwner}
                disabled={!newOwner || owners.includes(newOwner)}
                className="border-neutral-600 text-neutral-300 hover:bg-neutral-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="text-xs text-neutral-400 mt-2">
            Maximum 10 owners. Each owner can propose and approve transactions.
          </div>
        </div>

        {/* Approval Threshold */}
        <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
          <label className="block text-sm font-medium text-white mb-2">
            Approval Threshold
          </label>
          <div className="flex items-center gap-4">
            <select
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="px-4 py-3 border-2 rounded-lg text-sm bg-neutral-800 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none border-neutral-600"
            >
              {Array.from({ length: owners.length }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num} of {owners.length}
                </option>
              ))}
            </select>
            <div className="text-sm text-neutral-400">
              signatures required to execute transactions
            </div>
          </div>
          <div className="text-xs text-neutral-400 mt-2">
            Higher thresholds provide more security but require more coordination.
          </div>
        </div>

        {/* Summary */}
        <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/30">
          <h4 className="font-medium text-orange-400 mb-2">Summary</h4>
          <ul className="text-sm text-neutral-300 space-y-1">
            <li>• {owners.length} owner{owners.length !== 1 ? 's' : ''} will be added to the wallet</li>
            <li>• {threshold} signature{threshold !== 1 ? 's' : ''} required to execute transactions</li>
            <li>• You can deposit funds after initialization</li>
            <li>• Owners can propose, approve, and execute transactions</li>
          </ul>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || owners.length === 0 || threshold === 0}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Initializing Wallet...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Initialize Multisig Wallet
            </>
          )}
        </Button>
      </form>

      {/* Help Text */}
      <div className="text-xs text-neutral-400 bg-neutral-800 border border-neutral-700 p-3 rounded">
        <strong>Note:</strong> After initialization, you can deposit STX to the wallet and start creating transactions. 
        Each transaction will need approval from the required number of owners before it can be executed.
      </div>
    </div>
  );
};

export default InitializeWallet;