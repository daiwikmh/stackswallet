import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { getConnectedStxAddress } from '../../utils/wallet';

interface DelegationContextType {
  walletAddress: string | null;
  isWalletReady: boolean;
  refreshAddress: () => Promise<void>;
}

const DelegationContext = createContext<DelegationContextType | undefined>(undefined);

interface DelegationProviderProps {
  children: ReactNode;
  walletAddress: string | null;
  isWalletConnected: boolean;
}

export const DelegationProvider = ({ children, walletAddress, isWalletConnected }: DelegationProviderProps) => {
  const [currentAddress, setCurrentAddress] = useState<string | null>(walletAddress);

  // Function to refresh address from storage if needed
  const refreshAddress = async () => {
    if (isWalletConnected && !currentAddress) {
      console.log('🔄 Refreshing address from storage...');
      const storageAddress = await getConnectedStxAddress();
      if (storageAddress) {
        console.log('✅ Updated address from storage:', storageAddress);
        setCurrentAddress(storageAddress);
      }
    }
  };

  // Update local address when prop changes
  useEffect(() => {
    setCurrentAddress(walletAddress);
  }, [walletAddress]);

  // Auto-refresh address if wallet is connected but no address available
  useEffect(() => {
    if (isWalletConnected && !currentAddress) {
      refreshAddress();
    }
  }, [isWalletConnected, currentAddress]);

  const value: DelegationContextType = {
    walletAddress: currentAddress,
    isWalletReady: isWalletConnected && !!currentAddress,
    refreshAddress,
  };

  return (
    <DelegationContext.Provider value={value}>
      {children}
    </DelegationContext.Provider>
  );
};

export const useDelegation = () => {
  const context = useContext(DelegationContext);
  if (context === undefined) {
    throw new Error('useDelegation must be used within a DelegationProvider');
  }
  return context;
};