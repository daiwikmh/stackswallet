import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { getConnectedStxAddress } from '../../utils/wallet';

interface SplitwiseContextType {
  walletAddress: string | null;
  isWalletReady: boolean;
  refreshAddress: () => Promise<void>;
}

const SplitwiseContext = createContext<SplitwiseContextType | undefined>(undefined);

interface SplitwiseProviderProps {
  children: ReactNode;
  walletAddress: string | null;
  isWalletConnected: boolean;
}

export const SplitwiseProvider = ({ children, walletAddress, isWalletConnected }: SplitwiseProviderProps) => {
  const [currentAddress, setCurrentAddress] = useState<string | null>(walletAddress);

  // Function to refresh address from storage if needed
  const refreshAddress = async () => {
    if (isWalletConnected && !currentAddress) {
      console.log('🔄 Splitwise refreshing address from storage...');
      const storageAddress = await getConnectedStxAddress();
      if (storageAddress) {
        console.log('✅ Splitwise updated address from storage:', storageAddress);
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

  const value: SplitwiseContextType = {
    walletAddress: currentAddress,
    isWalletReady: isWalletConnected && !!currentAddress,
    refreshAddress,
  };

  return (
    <SplitwiseContext.Provider value={value}>
      {children}
    </SplitwiseContext.Provider>
  );
};

export const useSplitwise = () => {
  const context = useContext(SplitwiseContext);
  if (context === undefined) {
    throw new Error('useSplitwise must be used within a SplitwiseProvider');
  }
  return context;
};