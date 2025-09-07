import { getLocalStorage } from '@stacks/connect';
import { STACKS_TESTNET } from '@stacks/network';

// Utility to get the connected STX address from Stacks Connect storage
export const getConnectedStxAddress = async (): Promise<string | null> => {
  try {
    // Use getLocalStorage from @stacks/connect to retrieve wallet data
    const storage = getLocalStorage();
    console.log('🔍 Shared wallet storage:', storage);
    
    if (storage && storage.addresses) {
      // Check for STX addresses in the addresses.stx array
      if (storage.addresses.stx && Array.isArray(storage.addresses.stx) && storage.addresses.stx.length > 0) {
        const firstStxAddress = storage.addresses.stx[0];
        const address = typeof firstStxAddress === 'string' ? firstStxAddress : firstStxAddress.address;
        
        if (isValidStxAddress(address)) {
          console.log('✅ Shared wallet retrieved valid STX address:', address);
          return address;
        } else {
          console.log('⚠️ Shared wallet invalid STX address format:', address);
          return null;
        }
      }
      
      // Fallback: check if addresses is directly an array (old format)
      if (Array.isArray(storage.addresses) && storage.addresses.length > 0) {
        const firstAddress = storage.addresses[0];
        const address = typeof firstAddress === 'string' ? firstAddress : firstAddress.address;
        
        if (isValidStxAddress(address)) {
          console.log('✅ Shared wallet retrieved valid STX address (fallback):', address);
          return address;
        }
      }
    }
    
    console.log('⚠️ Shared wallet no STX addresses found in wallet storage');
    return null;
  } catch (error) {
    console.error('❌ Shared wallet error getting STX address from storage:', error);
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

// Helper to get all connected addresses from storage
export const getConnectedAddresses = async (): Promise<string[]> => {
  try {
    const storage = getLocalStorage();
    
    if (storage && storage.addresses) {
      let addresses: string[] = [];
      
      // Check for STX addresses in the addresses.stx array
      if (storage.addresses.stx && Array.isArray(storage.addresses.stx)) {
        addresses = storage.addresses.stx.map((addr: any) => 
          typeof addr === 'string' ? addr : addr.address
        ).filter((addr: string) => isValidStxAddress(addr));
      }
      
      // Fallback: check if addresses is directly an array (old format)
      if (addresses.length === 0 && Array.isArray(storage.addresses)) {
        addresses = storage.addresses.map((addr: any) => 
          typeof addr === 'string' ? addr : addr.address
        ).filter((addr: string) => isValidStxAddress(addr));
      }
      
      console.log('✅ Shared wallet retrieved addresses:', addresses);
      return addresses;
    }
    
    return [];
  } catch (error) {
    console.error('❌ Shared wallet error getting addresses:', error);
    return [];
  }
};

// Helper to check if wallet is connected
export const isWalletConnected = (): boolean => {
  try {
    const storage = getLocalStorage();
    
    if (storage && storage.addresses) {
      // Check for STX addresses in the addresses.stx array
      if (storage.addresses.stx && Array.isArray(storage.addresses.stx) && storage.addresses.stx.length > 0) {
        return true;
      }
      
      // Fallback: check if addresses is directly an array (old format)
      if (Array.isArray(storage.addresses) && storage.addresses.length > 0) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ Shared wallet error checking connection:', error);
    return false;
  }
};