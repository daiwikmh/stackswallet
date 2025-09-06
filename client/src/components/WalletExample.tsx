import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import StacksWalletConnect from './StacksWalletConnect';
import { useWallets } from '../hooks/useWallets';
import { Wallet, ExternalLink } from 'lucide-react';

export const WalletExample = () => {
  const { address, isConnected, userData } = useWallets();

  const formatAddress = (address: string | null) => {
    if (!address) return 'Not connected';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Stacks Wallet Connection</h1>
        <p className="text-gray-600">
          Connect your Stacks wallet to interact with the dApp
        </p>
      </div>

      {/* Stacks Wallet Card */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <CardTitle className="text-lg">Stacks Wallet</CardTitle>
          </div>
          <Badge 
            variant={isConnected ? "default" : "secondary"}
            className="ml-auto"
          >
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription>
            Connect your Stacks wallet to access STX and SIP-10 tokens
          </CardDescription>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Address:</p>
            <code className="text-xs bg-gray-100 p-2 rounded block">
              {formatAddress(address)}
            </code>
          </div>

          {isConnected && userData && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Profile:</p>
              <div className="text-xs space-y-1">
                <p>BNS Name: {userData.profile.name || 'No BNS name'}</p>
                <p>Testnet: {userData.profile.stxAddress.testnet}</p>
              </div>
            </div>
          )}

          <StacksWalletConnect 
            variant="outline" 
            className="w-full"
            showAddress={false}
          />
        </CardContent>
      </Card>

      {isConnected && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-800">
                  🎉 Stacks Wallet Connected!
                </h3>
                <p className="text-green-700 text-sm">
                  You can now interact with Stacks smart contracts and DeFi protocols
                </p>
              </div>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Quick Integration Guide</CardTitle>
          <CardDescription>
            How to use the Stacks wallet connection components in your app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Use the StacksWalletConnect component:</h4>
            <code className="text-xs bg-gray-100 p-2 rounded block">
              {`<StacksWalletConnect variant="default" showAddress={true} />`}
            </code>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">2. Use the useWallets hook for state management:</h4>
            <code className="text-xs bg-gray-100 p-2 rounded block">
              {`const { address, isConnected, connect, disconnect } = useWallets();`}
            </code>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">3. Use the useStacksWallet hook directly:</h4>
            <code className="text-xs bg-gray-100 p-2 rounded block">
              {`const { isConnected, address, connect, disconnect } = useStacksWallet();`}
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};