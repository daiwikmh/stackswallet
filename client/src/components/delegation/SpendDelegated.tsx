import React, { useState } from 'react';
import { useStacksWallet } from '../../contexts/StacksWalletContext';
import { DelegationContract, STXToMicroSTX } from './contract';

interface SpendDelegatedProps {
  onSuccess: () => void;
}

const SpendDelegated: React.FC<SpendDelegatedProps> = ({ onSuccess }) => {
  const { selectedAddress } = useStacksWallet();
  const [formData, setFormData] = useState({
    owner: '',
    amount: '',
    recipient: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.owner.trim()) {
      newErrors.owner = 'Owner address is required';
    } else if (!formData.owner.startsWith('SP') && !formData.owner.startsWith('ST')) {
      newErrors.owner = 'Please enter a valid Stacks address';
    }

    if (!formData.recipient.trim()) {
      newErrors.recipient = 'Recipient address is required';
    } else if (!formData.recipient.startsWith('SP') && !formData.recipient.startsWith('ST')) {
      newErrors.recipient = 'Please enter a valid Stacks address';
    }

    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (formData.owner === selectedAddress) {
      newErrors.owner = 'You cannot spend from your own delegation (you are the owner, not the delegate)';
    }

    if (formData.recipient === formData.owner) {
      newErrors.recipient = 'Recipient cannot be the same as owner';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!selectedAddress) {
      alert('Please connect your wallet first. Address not found.');
      console.error('selectedAddress is null or undefined:', selectedAddress);
      return;
    }
    
    console.log('Spending delegation with address:', selectedAddress);

    setIsLoading(true);
    
    try {
      const amountMicroSTX = STXToMicroSTX(parseFloat(formData.amount));

      await DelegationContract.spendDelegated(
        formData.owner,
        amountMicroSTX,
        formData.recipient
      );

      // Reset form on success
      setFormData({
        owner: '',
        amount: '',
        recipient: '',
      });
      
      alert('Spending transaction submitted successfully! STX sent to recipient.');
      onSuccess();
    } catch (error) {
      console.error('Failed to spend delegated funds:', error);
      alert('Failed to spend delegated funds. Please check limits and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Spend Delegated Funds
        </h2>
        <p className="text-gray-600">
          Spend STX from delegations where you are the designated delegate.
        </p>
      </div>

      {/* Important Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">
              Important: Delegate Spending
            </h3>
            <div className="mt-2 text-sm text-amber-700">
              <p>• You can only spend from delegations where YOU are the delegate</p>
              <p>• Your wallet address ({selectedAddress}) must be authorized by the owner</p>
              <p>• Spending is subject to daily limits and delegation expiry</p>
              <p>• All transactions are recorded on the blockchain</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Owner Address */}
        <div>
          <label htmlFor="owner" className="block text-sm font-medium text-gray-700 mb-2">
            Delegation Owner Address
          </label>
          <input
            type="text"
            id="owner"
            name="owner"
            value={formData.owner}
            onChange={handleInputChange}
            placeholder="SP1ABC... (who delegated to you)"
            className={`w-full px-4 py-3 border-2 rounded-lg font-mono text-sm bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
              errors.owner ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.owner && (
            <p className="mt-1 text-sm text-red-600">{errors.owner}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            The address of the person who created the delegation
          </p>
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount to Spend (STX)
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="1.0"
            step="0.000001"
            min="0"
            className={`w-full px-4 py-3 border-2 rounded-lg text-sm bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
              errors.amount ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Amount of STX to spend from the delegation (subject to daily limits)
          </p>
        </div>

        {/* Recipient Address */}
        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            id="recipient"
            name="recipient"
            value={formData.recipient}
            onChange={handleInputChange}
            placeholder="SP1XYZ... (where to send the STX)"
            className={`w-full px-4 py-3 border-2 rounded-lg font-mono text-sm bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
              errors.recipient ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.recipient && (
            <p className="mt-1 text-sm text-red-600">{errors.recipient}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            The address that will receive the STX
          </p>
        </div>

        {/* Transaction Summary */}
        {formData.owner && formData.amount && formData.recipient && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Transaction Summary</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Spending {formData.amount} STX</p>
              <p>• From delegation by: {formData.owner}</p>
              <p>• Sending to: {formData.recipient}</p>
              <p>• Your role: Authorized delegate</p>
            </div>
          </div>
        )}

        {/* Current Delegate Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Your Delegate Address</h3>
          <p className="text-sm text-gray-700 font-mono bg-white px-3 py-1 rounded">
            {selectedAddress}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            This is the address that must be authorized as delegate for the spending to work
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing Spending...' : 'Spend Delegated STX'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SpendDelegated;