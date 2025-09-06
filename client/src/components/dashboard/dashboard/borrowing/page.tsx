"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bitcoin, TrendingDown, AlertTriangle, DollarSign, Shield } from "lucide-react"

interface BorrowingAsset {
  id: string
  name: string
  symbol: string
  apy: string
  available: string
  ltv: string
  liquidationThreshold: string
  yourBorrow: string
  collateral: string
  healthFactor: string
}

export default function BorrowingPage() {
  const [selectedAsset, setSelectedAsset] = useState<BorrowingAsset | null>(null)
  const [borrowAmount, setBorrowAmount] = useState("")

  const borrowingAssets: BorrowingAsset[] = [
    {
      id: "usdc",
      name: "USDC",
      symbol: "USDC",
      apy: "3.2",
      available: "2,450,000",
      ltv: "75",
      liquidationThreshold: "80",
      yourBorrow: "15,000",
      collateral: "0.5000",
      healthFactor: "2.45",
    },
    {
      id: "usdt",
      name: "Tether USD",
      symbol: "USDT",
      apy: "3.8",
      available: "1,890,000",
      ltv: "70",
      liquidationThreshold: "75",
      yourBorrow: "0",
      collateral: "0.0000",
      healthFactor: "0",
    },
    {
      id: "dai",
      name: "Dai Stablecoin",
      symbol: "DAI",
      apy: "4.1",
      available: "890,000",
      ltv: "75",
      liquidationThreshold: "80",
      yourBorrow: "0",
      collateral: "0.0000",
      healthFactor: "0",
    },
    {
      id: "eth",
      name: "Ethereum",
      symbol: "ETH",
      apy: "5.7",
      available: "1,250",
      ltv: "65",
      liquidationThreshold: "70",
      yourBorrow: "0",
      collateral: "0.0000",
      healthFactor: "0",
    },
  ]

  const getHealthFactorColor = (factor: string): string => {
    const f = Number.parseFloat(factor)
    if (f >= 2) return "text-white"
    if (f >= 1.5) return "text-orange-500"
    if (f >= 1.1) return "text-red-500"
    return "text-red-500"
  }

  const totalCollateral = "2.5000"
  const totalBorrowed = "15,000"
  const borrowingPower = "45,000"
  const overallHealthFactor = "2.45"

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wider">BORROWING</h1>
          <p className="text-sm text-neutral-400">Borrow assets using your Bitcoin as collateral</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">Add Collateral</Button>
        </div>
      </div>

      {/* Borrowing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">TOTAL COLLATERAL</p>
                <p className="text-2xl font-bold text-white font-mono">{totalCollateral} BTC</p>
              </div>
              <Bitcoin className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">TOTAL BORROWED</p>
                <p className="text-2xl font-bold text-white font-mono">${totalBorrowed}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">BORROWING POWER</p>
                <p className="text-2xl font-bold text-white font-mono">${borrowingPower}</p>
              </div>
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 tracking-wider">HEALTH FACTOR</p>
                <p className={`text-2xl font-bold font-mono ${getHealthFactorColor(overallHealthFactor)}`}>
                  {overallHealthFactor}
                </p>
              </div>
              <Shield className="w-8 h-8 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Factor Warning */}
      {Number.parseFloat(overallHealthFactor) < 1.5 && Number.parseFloat(overallHealthFactor) > 0 && (
        <Card className="bg-red-500/10 border-red-500/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <div>
                <h3 className="text-sm font-bold text-red-500">LOW HEALTH FACTOR WARNING</h3>
                <p className="text-xs text-neutral-300">
                  Your health factor is below 1.5. Consider adding more collateral or repaying debt to avoid
                  liquidation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Assets to Borrow */}
      <Card className="bg-neutral-900 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">AVAILABLE TO BORROW</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {borrowingAssets.map((asset) => (
              <Card
                key={asset.id}
                className="bg-neutral-800 border-neutral-600 hover:border-orange-500/50 transition-colors cursor-pointer"
                onClick={() => setSelectedAsset(asset)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{asset.name}</h3>
                      <p className="text-sm text-neutral-400">{asset.symbol}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-500 font-mono">{asset.apy}%</div>
                      <div className="text-xs text-neutral-400">Borrow APY</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="text-neutral-400 mb-1">Available</div>
                        <div className="text-white font-mono">
                          {asset.available} {asset.symbol}
                        </div>
                      </div>
                      <div>
                        <div className="text-neutral-400 mb-1">Max LTV</div>
                        <div className="text-white font-mono">{asset.ltv}%</div>
                      </div>
                    </div>

                    {Number.parseFloat(asset.yourBorrow) > 0 && (
                      <div className="pt-2 border-t border-neutral-600">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <div className="text-neutral-400 mb-1">Your Debt</div>
                            <div className="text-white font-mono">
                              {asset.yourBorrow} {asset.symbol}
                            </div>
                          </div>
                          <div>
                            <div className="text-neutral-400 mb-1">Health Factor</div>
                            <div className={`font-mono ${getHealthFactorColor(asset.healthFactor)}`}>
                              {asset.healthFactor}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs">
                        {Number.parseFloat(asset.yourBorrow) > 0 ? "Borrow More" : "Borrow"}
                      </Button>
                      {Number.parseFloat(asset.yourBorrow) > 0 && (
                        <Button
                          variant="outline"
                          className="flex-1 border-neutral-600 text-neutral-400 hover:bg-neutral-700 text-xs bg-transparent"
                        >
                          Repay
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Your Borrowing Positions */}
      {borrowingAssets.some((asset) => Number.parseFloat(asset.yourBorrow) > 0) && (
        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
              YOUR BORROWING POSITIONS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-700">
                    <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">ASSET</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">DEBT</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">APY</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">
                      COLLATERAL
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">
                      HEALTH FACTOR
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-neutral-400 tracking-wider">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowingAssets
                    .filter((asset) => Number.parseFloat(asset.yourBorrow) > 0)
                    .map((asset) => (
                      <tr key={asset.id} className="border-b border-neutral-800 hover:bg-neutral-800 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-neutral-700 rounded-full flex items-center justify-center text-xs">
                              {asset.symbol.charAt(0)}
                            </div>
                            <span className="text-sm text-white">{asset.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-white font-mono">
                          {asset.yourBorrow} {asset.symbol}
                        </td>
                        <td className="py-3 px-4 text-sm text-red-500 font-mono">{asset.apy}%</td>
                        <td className="py-3 px-4 text-sm text-white font-mono">{asset.collateral} BTC</td>
                        <td className="py-3 px-4">
                          <span className={`text-sm font-mono ${getHealthFactorColor(asset.healthFactor)}`}>
                            {asset.healthFactor}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-red-500 text-xs">
                              Repay
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-neutral-400 hover:text-orange-500 text-xs"
                            >
                              Manage
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Borrow Asset Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-neutral-900 border-neutral-700 w-full max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-white tracking-wider">
                  Borrow {selectedAsset.name}
                </CardTitle>
                <p className="text-sm text-neutral-400">Use your Bitcoin as collateral</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedAsset(null)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">ASSET DETAILS</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Borrow APY:</span>
                        <span className="text-red-500 font-mono">{selectedAsset.apy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Available:</span>
                        <span className="text-white font-mono">
                          {selectedAsset.available} {selectedAsset.symbol}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Max LTV:</span>
                        <span className="text-white font-mono">{selectedAsset.ltv}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Liquidation Threshold:</span>
                        <span className="text-white font-mono">{selectedAsset.liquidationThreshold}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">BORROW AMOUNT</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-neutral-400 mb-1 block">Amount ({selectedAsset.symbol})</label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={borrowAmount}
                          onChange={(e) => setBorrowAmount(e.target.value)}
                          className="bg-neutral-800 border-neutral-600 text-white font-mono"
                        />
                      </div>

                      <div className="text-xs text-neutral-400 space-y-1">
                        <div className="flex justify-between">
                          <span>Collateral Required:</span>
                          <span className="text-white font-mono">
                            {borrowAmount
                              ? (
                                  Number.parseFloat(borrowAmount) /
                                  60000 /
                                  (Number.parseFloat(selectedAsset.ltv) / 100)
                                ).toFixed(6)
                              : "0.000000"}{" "}
                            BTC
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly Interest:</span>
                          <span className="text-white font-mono">
                            {borrowAmount
                              ? (
                                  (Number.parseFloat(borrowAmount) * Number.parseFloat(selectedAsset.apy)) /
                                  100 /
                                  12
                                ).toFixed(2)
                              : "0.00"}{" "}
                            {selectedAsset.symbol}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-neutral-700">
                <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white">Borrow {selectedAsset.symbol}</Button>
                <Button
                  variant="outline"
                  className="border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300 bg-transparent"
                >
                  View Terms
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
