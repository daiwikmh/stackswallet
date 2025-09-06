import { useStacksWallet } from "../contexts/StacksWalletContext";

export const useWallets = () => {
  // Stacks wallet state
  const {
    address,
    isConnected,
    connect,
    disconnect,
    userData
  } = useStacksWallet();

  return {
    // Stacks wallet (main interface)
    address,
    isConnected,
    connect,
    disconnect,
    userData,
    // Legacy support for components that use stacks.* pattern
    stacks: {
      address,
      isConnected,
      connect,
      disconnect,
      userData,
    },
  };
};