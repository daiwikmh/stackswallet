import { useEffect, useState } from 'react';
import { handleFetchLatestVaa } from './pyth';
import { request } from '@stacks/connect';
import { Cl, Pc } from '@stacks/transactions';
import { Buffer } from 'buffer';
import { useStacksWallet } from '../../contexts/StacksWalletContext';

interface PriceData {
  vaaHex: string;
  bufferLength: number;
  timestamp: string;
  contractResponse?: any;
  status: 'loading' | 'success' | 'error';
}

const PythPriceLogger = () => {
  const { isWalletConnected, selectedAddress } = useStacksWallet();
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🚀 PythPriceLogger useEffect triggered');
    console.log('🔗 Wallet Connected:', isWalletConnected);
    console.log('📍 Selected Address:', selectedAddress);
    
    if (!isWalletConnected) {
      console.log('⏳ Waiting for wallet connection...');
      console.log('🔗 Connection Status:', { isWalletConnected, selectedAddress });
      return;
    }
    
    if (!selectedAddress) {
      console.log('⚠️ Wallet connected but no selected address - proceeding anyway for price feeds');
      console.log('🔗 Connection Status:', { isWalletConnected, selectedAddress });
    }
    
    console.log('✅ Wallet connected, starting price feed process...');

    const fetchAndCallContract = async () => {
      console.log('🎯 Starting fetchAndCallContract function...');
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('✨ Beginning Pyth price feed process...');
        console.log('📍 Connected Address:', selectedAddress);
        console.log('🔧 Setting loading state...');
        
        // Fetch VAA data using existing HermesClient approach
        console.log('🔄 Fetching Pyth VAA data...');
        const latestVaaHex = await handleFetchLatestVaa();
        console.log('📈 Pyth Latest VAA Hex:', latestVaaHex);
        
        // Process buffer
        const cleanHex = latestVaaHex.startsWith('0x') ? latestVaaHex.slice(2) : latestVaaHex;
        const messageBuffer = Buffer.from(cleanHex, 'hex');
        const hexResult = `0x${messageBuffer.toString('hex')}`;
        
        console.log('🔢 Clean hex:', cleanHex);
        console.log('📊 Buffer length:', messageBuffer.length);
        
        // Set initial price data 
        setPriceData({
          vaaHex: latestVaaHex,
          bufferLength: messageBuffer.length,
          timestamp: new Date().toISOString(),
          status: 'loading'
        });
        
        console.log('🏗️ Preparing testnet contract call...');
        const contractAddress = "STR738QQX1PVTM6WTDF833Z18T8R0ZB791TCNEFM";
        const contractName = "pyth-oracle-v4";
        const fullContractId = `${contractAddress}.${contractName}`;
        
        const postCond1 = Pc.principal(contractAddress)
          .willSendLte(1)
          .ustx();
        
        const response = await request("stx_callContract", {
          contract: fullContractId,
          functionName: "update-price-feeds",
          functionArgs: [Cl.bufferFromHex(hexResult)],
          network: "testnet",
          postConditions: [postCond1],
          postConditionMode: "deny",
        });
        
        // Update with contract response
        setPriceData(prev => prev ? {
          ...prev,
          contractResponse: response,
          status: 'success'
        } : null);
        
        console.log('✅ Contract call response:', response);
        console.log('🎯 Successfully called pyth-oracle-v3 on testnet with STX/USD data!');
        
      } catch (error) {
        console.error('❌ MAJOR ERROR in Pyth + Contract call:', error);
        console.error('❌ Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack trace',
          error: error
        });
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(errorMessage);
        setPriceData(prev => prev ? { ...prev, status: 'error' } : null);
        
        console.log('🔧 Set error state to:', errorMessage);
      } finally {
        console.log('🏁 Finally block - setting loading to false');
        setIsLoading(false);
      }
    };

    console.log('🚀 About to call fetchAndCallContract...');
    fetchAndCallContract();
  }, [isWalletConnected]); // Removed selectedAddress dependency since we don't require it

  // Add debug logging for render
  console.log('🖼️ PythPriceLogger rendering with:', { 
    isWalletConnected, 
    selectedAddress, 
    isLoading, 
    hasError: !!error,
    hasPriceData: !!priceData 
  });

  if (!isWalletConnected) {
    console.log('🔒 Rendering wallet connection waiting state');
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📈 Pyth Price Feeds</h2>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Connect your Stacks wallet to view live price feeds</p>
          <div className="text-sm text-gray-500">
            ⏳ Waiting for wallet connection...
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Connected: {String(isWalletConnected)} | Address: {selectedAddress || 'none'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📈 Pyth STX/USD Price Feed</h2>
        <div className="text-sm text-gray-500">
          Testnet • {selectedAddress?.slice(0, 8)}...
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Fetching price data...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-red-800 font-semibold">❌ Error</h3>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      )}

      {priceData && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Status</h3>
              <p className="text-sm mt-1">
                {priceData.status === 'loading' && '🔄 Processing...'}
                {priceData.status === 'success' && '✅ Success'}
                {priceData.status === 'error' && '❌ Failed'}
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Buffer Size</h3>
              <p className="text-sm mt-1">{priceData.bufferLength} bytes</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">Timestamp</h3>
              <p className="text-sm mt-1">{new Date(priceData.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">VAA Hex Data</h3>
            <div className="bg-white p-3 rounded border font-mono text-xs break-all">
              {priceData.vaaHex}
            </div>
          </div>

          {priceData.contractResponse && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Contract Response</h3>
              <pre className="bg-white p-3 rounded border text-xs overflow-auto">
                {JSON.stringify(priceData.contractResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PythPriceLogger;