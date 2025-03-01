import { useState, useEffect } from "react";
import { createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { WagmiProvider, useAccount } from "wagmi";
import { injected, coinbaseWallet } from "wagmi/connectors";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import {
  Wallet,
  ConnectWallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { Identity, Avatar, Name, Address } from "@coinbase/onchainkit/identity";
import { FundButton } from "@coinbase/onchainkit/fund";
import HomePage from "./components/HomePage";
import SponsorView from "./components/SponsorView";
import MerchantView from "./components/MerchantView";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
// Use Base Sepolia for testing
const chain = baseSepolia;

// Create a client for React Query
const queryClient = new QueryClient();

// Coinbase wallet connector
const coinbaseConnector = coinbaseWallet({
  appName: "ZepPay",
  jsonRpcUrl: `https://sepolia.base.org`,
});

// Create wagmi config
const config = createConfig({
  chains: [chain],
  transports: {
    [chain.id]: http(),
  },
  connectors: [
    coinbaseConnector,
    injected({
      shimDisconnect: true,
    }),
  ],
});

// Contract address for ZepPay
const CONTRACT_ADDRESS = "0xD2c89942a07074777c3BEf32EE0B27cb87D0a658";

function AppContent() {
  const [userType, setUserType] = useState<"none" | "sponsor" | "merchant">(
    "none"
  );
  const { address, isConnected } = useAccount();
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
    visible: boolean;
  } | null>(null);

  // Check if user has a stored role preference
  useEffect(() => {
    if (isConnected && userType === "none") {
      const savedUserType = localStorage.getItem(`zeppay-role-${address}`);
      if (savedUserType === "sponsor" || savedUserType === "merchant") {
        setUserType(savedUserType);
      }
    }
  }, [isConnected, address, userType]);

  // Save user role preference
  useEffect(() => {
    if (isConnected && userType !== "none" && address) {
      localStorage.setItem(`zeppay-role-${address}`, userType);
    }
  }, [userType, isConnected, address]);

  const handleSwitchRole = () => {
    setUserType("none");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {notification && notification.visible && (
        <div
          className={`fixed top-2 right-2 z-50 px-3 py-2 rounded-lg shadow-lg flex items-center text-sm ${
            notification.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : notification.type === "error"
              ? "bg-red-100 text-red-800 border border-red-200"
              : "bg-blue-100 text-blue-800 border border-blue-200"
          }`}
        >
          {notification.message}
          <button
            onClick={() => setNotification(null)}
            className="ml-2 text-gray-500 hover:text-gray-700"
          >
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      {/* <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-12">
            <div className="flex items-center">
              <div
                className="flex-shrink-0 flex items-center cursor-pointer"
                onClick={() => setUserType("none")}
              >
                <h1 className="text-base font-bold text-gray-900">ZepPay</h1>
              </div>

              {isConnected && userType !== "none" && (
                <div className="hidden md:flex ml-4 items-center space-x-2">
                  <div className="text-xs font-medium text-gray-700 px-2 py-1">
                    {userType === "sponsor" ? "Sponsor" : "Merchant"}
                  </div>
                  <button
                    onClick={handleSwitchRole}
                    className="text-xs text-gray-600 hover:text-gray-800"
                  >
                    Switch
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center">
              <Wallet>
                <ConnectWallet className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700" />
                {isConnected && (
                  <WalletDropdown>
                    <Identity
                      address={address}
                      hasCopyAddressOnClick
                      className="p-3 border-b border-gray-100"
                    >
                      <div className="flex items-center">
                        <Avatar
                          address={address}
                          className="h-8 w-8 rounded-full"
                        />
                        <div className="ml-2">
                          <Name
                            address={address}
                            className="text-sm font-medium"
                          />
                          <Address
                            address={address}
                            className="text-xs text-gray-500"
                          />
                        </div>
                      </div>
                    </Identity>
                    <div className="p-3 border-b border-gray-100">
                      <FundButton
                        text="Add Funds"
                        className="w-full bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-blue-700"
                      />
                    </div>
                    <WalletDropdownDisconnect />
                  </WalletDropdown>
                )}
              </Wallet>
            </div>
          </div>
        </div>
      </nav> */}

 {/* <nav className="navbar">
      <div className="navbar-container">
     
        <div className="navbar-left">
          <div className="logo" onClick={() => setUserType("none")}>
            <h1>ZepPay</h1>
          </div>

          
          {isConnected && userType !== "none" && (
            <div className="role-switcher">
              <span className="role-text">
                {userType === "sponsor" ? "Sponsor" : "Merchant"}
              </span>
              <button onClick={handleSwitchRole} className="switch-button">
                Switch
              </button>
            </div>
          )}
        </div>

      
        <div className="navbar-right">
  
      <div className="wallet-fund">
        <FundButton text="Add Funds" className="fund-button" />
      </div>

      
      <Wallet>
        <ConnectWallet className="connect-button" />
        {isConnected && (
          <WalletDropdown className="wallet-dropdown">
            <div className="wallet-dropdown-content">
             
              <WalletDropdownDisconnect className="disconnect-button" />
            </div>
          </WalletDropdown>
        )}
      </Wallet>
    </div>
      </div>
    </nav>  */}

<nav className="navbar">
  <div className="navbar-container">
    {/* Left Side - Logo */}
    <div className="navbar-left">
      <div className="logo" onClick={() => setUserType("none")}>
        <h1>ZepPay</h1>
      </div>

      {/* Role Switcher */}
      {isConnected && userType !== "none" && (
        <div className="role-switcher">
          <span className="role-text">
            {userType === "sponsor" ? "Sponsor" : "Merchant"}
          </span>
          <button onClick={handleSwitchRole} className="switch-button">
            Switch
          </button>
        </div>
      )}
    </div>

    {/* Right Side - Wallet */}
    <div className="navbar-right">
      {/* Add Funds Button */}
      <div className="wallet-fund">
        <FundButton text="Add Funds" className="fund-button" />
      </div>

      {/* Wallet Dropdown */}
      <Wallet>
        <ConnectWallet className="connect-button" />
        {isConnected && (
          <WalletDropdown className="wallet-dropdown">
            <div className="wallet-dropdown-content">
              {/* Disconnect Button */}
              <div className="wallet-disconnect">
                <WalletDropdownDisconnect className="disconnect-button" />
              </div>
            </div>
          </WalletDropdown>
        )}
      </Wallet>
    </div>
  </div>
</nav>


      <main className="max-w-4xl mx-auto py-6 px-4 flex-grow">
        {!isConnected ? (
          <div className="py-4">
            <div className="max-w-md mx-auto bg-white p-6 rounded-md shadow-sm">
              <h2 className="text-lg font-medium text-gray-900 mb-4 text-center">
                Connect your wallet to get started
              </h2>
              <ConnectWallet
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                text="Connect Wallet"
              />
            </div>
          </div>
        ) : userType === "none" ? (
          <HomePage onSelectUserType={setUserType} />
        ) : userType === "sponsor" ? (
          <SponsorView contractAddress={CONTRACT_ADDRESS} />
        ) : (
          <MerchantView contractAddress={CONTRACT_ADDRESS} />
        )}
      </main>

      <footer className="bg-white py-3 mt-auto">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <p>ZepPay © {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={import.meta.env.VITE_ONCHAINKIT_API_KEY || ""}
          chain={chain}
          config={{
            appearance: {
              name: "ZepPay",
              mode: "auto",
              theme: "default",
            },
          }}
        >
          <AppContent />
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
