import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { connect, disconnect, isConnected } from '@stacks/connect';

interface StacksWalletContextType {
  isWalletConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  addresses: string[];
  selectedAddress: string | null;
}

const StacksWalletContext = createContext<StacksWalletContextType | undefined>(undefined);

interface StacksWalletProviderProps {
  children: ReactNode;
}

export const StacksWalletProvider = ({ children }: StacksWalletProviderProps) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  useEffect(() => {
    // Check if already connected on app load
    const checkConnection = () => {
      const connected = isConnected();
      console.log('🔍 Checking initial connection status:', connected);
      setIsWalletConnected(connected);
      
      if (connected) {
        // If connected, we would normally get addresses from the connect response
        // For now, we'll set a placeholder - the real addresses come from connect()
        console.log('✅ Wallet already connected');
      }
    };
    
    checkConnection();
  }, []);

  const connectWallet = async () => {
    try {
      console.log('🔗 Initiating wallet connection...');
      
      const response = await connect();
      console.log('📝 Full connection response structure:', JSON.stringify(response, null, 2));
      console.log('📝 Response type:', typeof response);
      console.log('📝 Response keys:', response ? Object.keys(response) : 'no keys');
      
      if (response) {
        setIsWalletConnected(true);
        console.log('✅ Set wallet connected to true');
        
        if (response.addresses && Array.isArray(response.addresses) && response.addresses.length > 0) {
          setAddresses(response.addresses);
          setSelectedAddress(response.addresses[0]);
          console.log('✅ Set addresses:', response.addresses);
          console.log('✅ Set selected address:', response.addresses[0]);
        } else {
          console.log('⚠️ No addresses in response or addresses is not an array');
          console.log('📍 Available response properties:', Object.keys(response));
          
          // Try alternative address fields
          if (response.address) {
            console.log('📍 Found single address field:', response.address);
            setSelectedAddress(response.address);
            setAddresses([response.address]);
          } else if (response.userSession) {
            console.log('📍 Found userSession, will try to extract address later');
          }
        }
      } else {
        console.log('⚠️ No response from connect()');
        setIsWalletConnected(true); // Still set connected if no error
      }
      
    } catch (error) {
      console.error('❌ Failed to connect wallet:', error);
      setIsWalletConnected(false);
    }
  };

  const disconnectWallet = () => {
    try {
      console.log('🔌 Disconnecting wallet...');
      disconnect(); // Call the disconnect function from @stacks/connect
      setIsWalletConnected(false);
      setAddresses([]);
      setSelectedAddress(null);
      console.log('✅ Wallet disconnected successfully');
    } catch (error) {
      console.error('❌ Error disconnecting wallet:', error);
    }
  };

  const value: StacksWalletContextType = {
    isWalletConnected,
    connectWallet,
    disconnectWallet,
    addresses,
    selectedAddress,
  };

  return (
    <StacksWalletContext.Provider value={value}>
      {children}
    </StacksWalletContext.Provider>
  );
};

export const useStacksWallet = () => {
  const context = useContext(StacksWalletContext);
  if (context === undefined) {
    throw new Error('useStacksWallet must be used within a StacksWalletProvider');
  }
  return context;
};