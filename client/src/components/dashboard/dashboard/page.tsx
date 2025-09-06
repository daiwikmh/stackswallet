"use client";

import { useState, useCallback } from "react";
import { ChevronRight, Wallet, TrendingUp, Coins, BarChart3, Bell, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import PortfolioPage from "./portfolio/page";
import LendingPage from "./lending/page";
import BorrowingPage from "./borrowing/page";
import StakingPage from "./staking/page";
import AnalyticsPage from "./analytics/page";
import { StacksWalletConnect } from "@/components/StacksWalletConnect";

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState("portfolio");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);


  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`${
          sidebarCollapsed ? "w-16" : "w-70"
        } bg-neutral-900 border-r border-neutral-700 transition-all duration-300 fixed md:relative z-50 md:z-auto h-full md:h-auto ${
          !sidebarCollapsed ? "md:block" : ""
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <div className={`${sidebarCollapsed ? "hidden" : "block"}`}>
              <h1 className="text-orange-500 font-bold text-lg tracking-wider">BITLEND</h1>
              <p className="text-neutral-500 text-xs">DeFi Protocol v1.0</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-neutral-400 hover:text-orange-500"
            >
              <ChevronRight
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                  sidebarCollapsed ? "" : "rotate-180"
                }`}
              />
            </Button>
          </div>

          <nav className="space-y-2">
            {[
              { id: "portfolio", icon: Wallet, label: "PORTFOLIO" },
              { id: "lending", icon: TrendingUp, label: "LENDING" },
              { id: "borrowing", icon: Coins, label: "BORROWING" },
              { id: "analytics", icon: BarChart3, label: "ANALYTICS" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded transition-colors ${
                  activeSection === item.id
                    ? "bg-orange-500 text-white"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`}
              >
                <item.icon className="w-5 h-5 md:w-5 md:h-5 sm:w-6 sm:h-6" />
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>

          {!sidebarCollapsed && (
            <div className="mt-8 p-4 bg-neutral-800 border border-neutral-700 rounded">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-xs text-white">WALLET ONLINE</span>
              </div>
              {/* <div className="text-xs text-neutral-500">
                <div>TVL: $2.4B</div>
                <div>USERS: 47K ACTIVE</div>
                <div>APY: 8.7% AVG</div>
              </div> */}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${!sidebarCollapsed ? "md:ml-0" : ""}`}>
        {/* Top Toolbar */}
        <div className="h-16 bg-neutral-800 border-b border-neutral-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="text-sm text-neutral-400">
              BITLEND PROTOCOL / <span className="text-orange-500">DASHBOARD</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-neutral-500">LAST UPDATE: 28/06/2025 18:46 UTC</div>
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-orange-500">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-orange-500">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <StacksWalletConnect
              variant="default"
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs"
              showAddress={true}
            />
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto">
          {activeSection === "portfolio" && <PortfolioPage />}
          {activeSection === "lending" && <LendingPage />}
          {activeSection === "borrowing" && <BorrowingPage />}
          {activeSection === "staking" && <StakingPage />}
          {activeSection === "analytics" && <AnalyticsPage />}
        </div>
      </div>
    </div>
  );
}