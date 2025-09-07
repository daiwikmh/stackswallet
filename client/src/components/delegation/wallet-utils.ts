import { getLocalStorage } from '@stacks/connect';
import { STACKS_TESTNET } from '@stacks/network';

// Utility to get the connected STX address from Stacks Connect storage
export const getConnectedStxAddress = async (): Promise<string | null> => {
  try {
    // Use getLocalStorage from @stacks/connect to retrieve wallet data
    const storage = getLocalStorage();
    console.log('🔍 Wallet storage:', storage);
    
    if (storage && storage.addresses && Array.isArray(storage.addresses) && storage.addresses.length > 0) {
      // Handle both string addresses and address objects
      const firstAddress = storage.addresses[0];
      const address = typeof firstAddress === 'string' ? firstAddress : firstAddress.address;
      
      if (isValidStxAddress(address)) {
        console.log('✅ Retrieved valid STX address:', address);
        return address;
      } else {
        console.log('⚠️ Invalid STX address format:', address);
        return null;
      }
    }
    
    console.log('⚠️ No addresses found in wallet storage');
    return null;
  } catch (error) {
    console.error('❌ Error getting STX address from storage:', error);
    return null;
  }
};

// Helper to validate STX address format
export const isValidStxAddress = (address: string): boolean => {
  if (!address || typeof address !== 'string') return false;
  
  // STX addresses start with SP (mainnet) or ST (testnet) followed by 39 characters
  const stxAddressRegex = /^S[TP][A-Z0-9]{39}$/;
  return stxAddressRegex.test(address);
};

// Helper to format STX address for display
export const formatStxAddress = (address: string | null): string => {
  if (!address || typeof address !== 'string') return 'No address';
  if (!isValidStxAddress(address)) return 'Invalid address';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};