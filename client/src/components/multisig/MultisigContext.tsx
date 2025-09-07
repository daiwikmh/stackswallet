import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { getConnectedStxAddress } from '../../utils/wallet';

interface MultisigContextType {
  walletAddress: string | null;
  isWalletReady: boolean;
  refreshAddress: () => Promise<void>;
}

const MultisigContext = createContext<MultisigContextType | undefined>(undefined);

interface MultisigProviderProps {
  children: ReactNode;
  walletAddress: string | null;
  isWalletConnected: boolean;
}

export const MultisigProvider = ({ children, walletAddress, isWalletConnected }: MultisigProviderProps) => {
  const [currentAddress, setCurrentAddress] = useState<string | null>(walletAddress);

  // Function to refresh address from storage if needed
  const refreshAddress = async () => {
    if (isWalletConnected && !currentAddress) {
      console.log('🔄 Multisig refreshing address from storage...');
      const storageAddress = await getConnectedStxAddress();
      if (storageAddress) {
        console.log('✅ Multisig updated address from storage:', storageAddress);
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

  const value: MultisigContextType = {
    walletAddress: currentAddress,
    isWalletReady: isWalletConnected && !!currentAddress,
    refreshAddress,
  };

  return (
    <MultisigContext.Provider value={value}>
      {children}
    </MultisigContext.Provider>
  );
};

export const useMultisig = () => {
  const context = useContext(MultisigContext);
  if (context === undefined) {
    throw new Error('useMultisig must be used within a MultisigProvider');
  }
  return context;
};