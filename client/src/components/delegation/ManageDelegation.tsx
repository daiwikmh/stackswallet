import React, { useState } from 'react';
import { useStacksWallet } from '../../contexts/StacksWalletContext';
import { DelegationContract, STXToMicroSTX } from './contract';

interface ManageDelegationProps {
  onSuccess: () => void;
}

const ManageDelegation: React.FC<ManageDelegationProps> = ({ onSuccess }) => {
  const { selectedAddress } = useStacksWallet();
  const [activeAction, setActiveAction] = useState<string>('add-funds');
  const [formData, setFormData] = useState({
    delegate: '',
    amount: '',
    additionalDays: '7',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const actions = [
    { id: 'add-funds', label: 'Add Funds', description: 'Add more STX to existing delegation' },
    { id: 'withdraw', label: 'Withdraw', description: 'Withdraw remaining funds from expired delegation' },
    { id: 'revoke', label: 'Revoke', description: 'Cancel delegation and stop further spending' },
    { id: 'extend', label: 'Extend', description: 'Extend delegation duration' },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.delegate.trim()) {
      newErrors.delegate = 'Delegate address is required';
    } else if (!formData.delegate.startsWith('SP') && !formData.delegate.startsWith('ST')) {
      newErrors.delegate = 'Please enter a valid Stacks address';
    }

    if (activeAction === 'add-funds') {
      const amount = parseFloat(formData.amount);
      if (!formData.amount || isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Please enter a valid amount';
      }
    }

    if (activeAction === 'extend') {
      const days = parseInt(formData.additionalDays);
      if (!formData.additionalDays || isNaN(days) || days <= 0) {
        newErrors.additionalDays = 'Please enter a valid number of days';
      }
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
    
    console.log('Managing delegation with address:', selectedAddress);

    setIsLoading(true);
    
    try {
      switch (activeAction) {
        case 'add-funds':
          const additionalAmount = STXToMicroSTX(parseFloat(formData.amount));
          await DelegationContract.addFunds(
            formData.delegate,
            additionalAmount,
            selectedAddress
          );
          alert('Funds added successfully! Transaction submitted to the blockchain.');
          break;

        case 'withdraw':
          await DelegationContract.withdrawRemaining(formData.delegate);
          alert('Funds withdrawn successfully! Transaction submitted to the blockchain.');
          break;

        case 'revoke':
          await DelegationContract.revokeDelegation(formData.delegate);
          alert('Delegation revoked successfully! Transaction submitted to the blockchain.');
          break;

        case 'extend':
          const additionalDays = parseInt(formData.additionalDays);
          await DelegationContract.extendDelegation(formData.delegate, additionalDays);
          alert('Delegation extended successfully! Transaction submitted to the blockchain.');
          break;

        default:
          throw new Error('Invalid action');
      }

      // Reset form on success
      setFormData({
        delegate: '',
        amount: '',
        additionalDays: '7',
      });
      
      onSuccess();
    } catch (error) {
      console.error(`Failed to ${activeAction}:`, error);
      alert(`Failed to ${activeAction.replace('-', ' ')}. Please try again.`);
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

  const getActionColor = (actionId: string) => {
    switch (actionId) {
      case 'add-funds': return 'blue';
      case 'withdraw': return 'green';
      case 'revoke': return 'red';
      case 'extend': return 'purple';
      default: return 'gray';
    }
  };

  const currentAction = actions.find(action => action.id === activeAction);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Manage Existing Delegation
        </h2>
        <p className="text-gray-600">
          Perform actions on delegations you've created.
        </p>
      </div>

      {/* Action Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Action</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action) => {
            const color = getActionColor(action.id);
            const isActive = activeAction === action.id;
            
            return (
              <button
                key={action.id}
                onClick={() => setActiveAction(action.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                  isActive
                    ? `border-${color}-500 bg-${color}-50`
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`font-medium ${isActive ? `text-${color}-900` : 'text-gray-900'}`}>
                  {action.label}
                </div>
                <div className={`text-sm mt-1 ${isActive ? `text-${color}-700` : 'text-gray-600'}`}>
                  {action.description}
                </div>
              </button>
            );
          })}
        </div>
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
            The address of the delegate you want to manage
          </p>
        </div>

        {/* Conditional Fields */}
        {activeAction === 'add-funds' && (
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Amount (STX)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="5.0"
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
              Amount of additional STX to add to the delegation
            </p>
          </div>
        )}

        {activeAction === 'extend' && (
          <div>
            <label htmlFor="additionalDays" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Days
            </label>
            <input
              type="number"
              id="additionalDays"
              name="additionalDays"
              value={formData.additionalDays}
              onChange={handleInputChange}
              placeholder="7"
              min="1"
              className={`w-full px-4 py-3 border-2 rounded-lg text-sm bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                errors.additionalDays ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.additionalDays && (
              <p className="mt-1 text-sm text-red-600">{errors.additionalDays}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Number of additional days to extend the delegation
            </p>
          </div>
        )}

        {/* Action Description */}
        {currentAction && (
          <div className={`bg-${getActionColor(activeAction)}-50 border border-${getActionColor(activeAction)}-200 rounded-lg p-4`}>
            <h3 className={`text-sm font-medium text-${getActionColor(activeAction)}-900 mb-2`}>
              {currentAction.label} Details
            </h3>
            <div className={`text-sm text-${getActionColor(activeAction)}-700`}>
              {activeAction === 'add-funds' && (
                <p>This will add more STX to the existing delegation, increasing the available balance for the delegate to spend.</p>
              )}
              {activeAction === 'withdraw' && (
                <p>This will withdraw any remaining STX from an expired or revoked delegation back to your address.</p>
              )}
              {activeAction === 'revoke' && (
                <p>This will immediately stop the delegate from making further spending, but doesn't automatically withdraw funds.</p>
              )}
              {activeAction === 'extend' && (
                <p>This will extend the expiration date of the delegation by the specified number of days.</p>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-3 bg-${getActionColor(activeAction)}-600 hover:bg-${getActionColor(activeAction)}-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? `${currentAction?.label}...` : currentAction?.label}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManageDelegation;