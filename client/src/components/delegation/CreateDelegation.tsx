import React, { useState } from 'react';
import { useStacksWallet } from '../../contexts/StacksWalletContext';
import { DelegationContract, STXToMicroSTX } from './contract';

interface CreateDelegationProps {
  onSuccess: () => void;
}

const CreateDelegation: React.FC<CreateDelegationProps> = ({ onSuccess }) => {
  const { selectedAddress } = useStacksWallet();
  const [formData, setFormData] = useState({
    delegate: '',
    amount: '',
    dailyLimit: '',
    durationDays: '7',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.delegate.trim()) {
      newErrors.delegate = 'Delegate address is required';
    } else if (!formData.delegate.startsWith('SP') && !formData.delegate.startsWith('ST')) {
      newErrors.delegate = 'Please enter a valid Stacks address';
    }

    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    const dailyLimit = parseFloat(formData.dailyLimit);
    if (!formData.dailyLimit || isNaN(dailyLimit) || dailyLimit <= 0) {
      newErrors.dailyLimit = 'Please enter a valid daily limit';
    } else if (amount > 0 && dailyLimit > amount) {
      newErrors.dailyLimit = 'Daily limit cannot exceed total amount';
    }

    const days = parseInt(formData.durationDays);
    if (!formData.durationDays || isNaN(days) || days <= 0) {
      newErrors.durationDays = 'Please enter a valid duration';
    }

    if (formData.delegate === selectedAddress) {
      newErrors.delegate = 'You cannot delegate to yourself';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // if (!selectedAddress) {
    //   alert('Please connect your wallet first. Address not found.');
    //   console.error('selectedAddress is null or undefined:', selectedAddress);
    //   return;
    // }
    
    console.log('Creating delegation with address:', selectedAddress);

    setIsLoading(true);
    
    try {
      const amountMicroSTX = STXToMicroSTX(parseFloat(formData.amount));
      const dailyLimitMicroSTX = STXToMicroSTX(parseFloat(formData.dailyLimit));
      const durationDays = parseInt(formData.durationDays);

      await DelegationContract.createDelegationAndDeposit(
        formData.delegate,
        amountMicroSTX,
        dailyLimitMicroSTX,
        durationDays,
        selectedAddress
      );

      // Reset form on success
      setFormData({
        delegate: '',
        amount: '',
        dailyLimit: '',
        durationDays: '7',
      });
      
      alert('Delegation created successfully! Transaction submitted to the blockchain.');
      onSuccess();
    } catch (error) {
      console.error('Failed to create delegation:', error);
      alert('Failed to create delegation. Please try again.');
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
          Create New Delegation
        </h2>
        <p className="text-gray-600">
          Delegate STX to another address with daily spending limits and expiration.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Delegate Address */}
        <div>
          <label htmlFor="delegate" className="block text-sm font-medium text-gray-700 mb-2">
            Delegate Address
          </label>
          <input
            type="text"
            id="delegate"
            name="delegate"
            value={formData.delegate}
            onChange={handleInputChange}
            placeholder="SP1ABC..."
            className={`w-full px-4 py-3 border-2 rounded-lg font-mono text-sm bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
              errors.delegate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.delegate && (
            <p className="mt-1 text-sm text-red-600">{errors.delegate}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            The Stacks address that will be able to spend the delegated funds
          </p>
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Total Amount (STX)
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="10.0"
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
            Total amount of STX to deposit for delegation
          </p>
        </div>

        {/* Daily Limit */}
        <div>
          <label htmlFor="dailyLimit" className="block text-sm font-medium text-gray-700 mb-2">
            Daily Spending Limit (STX)
          </label>
          <input
            type="number"
            id="dailyLimit"
            name="dailyLimit"
            value={formData.dailyLimit}
            onChange={handleInputChange}
            placeholder="1.0"
            step="0.000001"
            min="0"
            className={`w-full px-4 py-3 border-2 rounded-lg text-sm bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
              errors.dailyLimit ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.dailyLimit && (
            <p className="mt-1 text-sm text-red-600">{errors.dailyLimit}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Maximum amount the delegate can spend per day
          </p>
        </div>

        {/* Duration */}
        <div>
          <label htmlFor="durationDays" className="block text-sm font-medium text-gray-700 mb-2">
            Duration (Days)
          </label>
          <input
            type="number"
            id="durationDays"
            name="durationDays"
            value={formData.durationDays}
            onChange={handleInputChange}
            placeholder="7"
            min="1"
            className={`w-full px-4 py-3 border-2 rounded-lg text-sm bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
              errors.durationDays ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.durationDays && (
            <p className="mt-1 text-sm text-red-600">{errors.durationDays}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            How many days the delegation should remain active
          </p>
        </div>

        {/* Summary Card */}
        {formData.amount && formData.dailyLimit && formData.durationDays && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Delegation Summary</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Total deposited: {formData.amount} STX</p>
              <p>• Daily limit: {formData.dailyLimit} STX</p>
              <p>• Duration: {formData.durationDays} days</p>
              <p>• Max possible spending: {Math.min(
                parseFloat(formData.amount) || 0,
                (parseFloat(formData.dailyLimit) || 0) * (parseInt(formData.durationDays) || 0)
              ).toFixed(6)} STX</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Delegation...' : 'Create Delegation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateDelegation;