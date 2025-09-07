import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SplitwiseContract, STXToMicroSTX, formatAddress, EXPENSE_CATEGORIES } from './contract';
import { useSplitwise } from './SplitwiseContext';
import { Plus, Trash2, Receipt, DollarSign } from 'lucide-react';

interface CreateExpenseProps {
  onSuccess?: () => void;
}

const CreateExpense: React.FC<CreateExpenseProps> = ({ onSuccess }) => {
  const { walletAddress, isWalletReady } = useSplitwise();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('general');
  const [paidBy, setPaidBy] = useState(walletAddress || '');
  const [splitMembers, setSplitMembers] = useState<string[]>([walletAddress || '']);
  const [newMember, setNewMember] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addMember = () => {
    if (newMember && !splitMembers.includes(newMember) && splitMembers.length < 10) {
      setSplitMembers([...splitMembers, newMember]);
      setNewMember('');
    }
  };

  const removeMember = (index: number) => {
    if (splitMembers.length > 1) {
      setSplitMembers(splitMembers.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWalletReady || !title || !amount || !paidBy || splitMembers.length === 0) return;

    setIsSubmitting(true);
    try {
      const microSTXAmount = STXToMicroSTX(parseFloat(amount));
      await SplitwiseContract.createSplitExpense(
        paidBy,
        microSTXAmount,
        title,
        splitMembers,
        category
      );
      
      // Reset form
      setTitle('');
      setAmount('');
      setCategory('general');
      setPaidBy(walletAddress || '');
      setSplitMembers([walletAddress || '']);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const perPersonAmount = amount ? parseFloat(amount) / splitMembers.length : 0;
  const selectedCategory = EXPENSE_CATEGORIES.find(cat => cat.id === category);

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
          <Receipt className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Create Split Expense</h2>
          <p className="text-neutral-400">Add an expense and split it among group members</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Expense Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-white">
            Expense Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Dinner at restaurant, Uber ride, etc."
            className="block w-full px-4 py-3 border-2 rounded-lg text-sm bg-neutral-800 text-white placeholder-neutral-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none border-neutral-600"
            required
          />
        </div>

        {/* Amount and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="amount" className="block text-sm font-medium text-white">
              Total Amount
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
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-medium text-white">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full px-4 py-3 border-2 rounded-lg text-sm bg-neutral-800 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none border-neutral-600"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Paid By */}
        <div className="space-y-2">
          <label htmlFor="paidBy" className="block text-sm font-medium text-white">
            Paid By (Who should receive the money)
          </label>
          <input
            id="paidBy"
            type="text"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            placeholder="SP... or ST..."
            className="block w-full px-4 py-3 border-2 rounded-lg text-sm font-mono bg-neutral-800 text-white placeholder-neutral-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none border-neutral-600"
            required
          />
        </div>

        {/* Split Among */}
        <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            Split Among
          </h3>
          
          {/* Current Split Members */}
          <div className="space-y-3 mb-4">
            {splitMembers.map((member, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-neutral-900 rounded border border-neutral-600">
                <div className="flex-1">
                  <div className="text-sm font-mono text-white">{member}</div>
                  {member === walletAddress && (
                    <div className="text-xs text-orange-400 mt-1">You</div>
                  )}
                </div>
                <div className="text-sm text-neutral-400">
                  {perPersonAmount.toFixed(6)} STX
                </div>
                {splitMembers.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMember(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Add New Member */}
          {splitMembers.length < 10 && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
                placeholder="Enter member address (SP... or ST...)"
                className="flex-1 px-4 py-3 border-2 rounded-lg font-mono text-sm bg-neutral-800 text-white placeholder-neutral-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none border-neutral-600"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addMember}
                disabled={!newMember || splitMembers.includes(newMember)}
                className="border-neutral-600 text-neutral-300 hover:bg-neutral-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="text-xs text-neutral-400 mt-2">
            Maximum 10 members. Each member needs to approve the expense.
          </div>
        </div>

        {/* Split Summary */}
        <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/30">
          <h4 className="font-medium text-orange-400 mb-2 flex items-center gap-2">
            {selectedCategory?.icon} Split Summary
          </h4>
          <div className="text-sm text-neutral-300 space-y-1">
            <div><strong>Expense:</strong> {title || 'Untitled expense'}</div>
            <div><strong>Total Amount:</strong> {amount ? `${amount} STX` : '0 STX'}</div>
            <div><strong>Split Among:</strong> {splitMembers.length} member{splitMembers.length !== 1 ? 's' : ''}</div>
            <div><strong>Per Person:</strong> {perPersonAmount.toFixed(6)} STX</div>
            <div><strong>Payment to:</strong> {formatAddress(paidBy)}</div>
          </div>
          <div className="text-xs text-orange-400 mt-3">
            This expense will need approval from group members before settlement.
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || !title || !amount || !paidBy || splitMembers.length === 0}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Creating Expense...
            </>
          ) : (
            <>
              <Receipt className="w-4 h-4 mr-2" />
              Create Split Expense
            </>
          )}
        </Button>
      </form>

      {/* Help Text */}
      <div className="text-xs text-neutral-400 bg-neutral-800 border border-neutral-700 p-3 rounded">
        <strong>How it works:</strong> After creating the expense, group members can approve it. 
        Once enough approvals are received, the expense can be settled and funds will be sent to the person who paid.
      </div>
    </div>
  );
};

export default CreateExpense;