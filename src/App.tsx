import { useState, useEffect } from "react";
import { createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { WagmiProvider, useAccount, useConnect } from "wagmi";
import { injected, coinbaseWallet } from "wagmi/connectors";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import HomePage from "./components/HomePage";
import SponsorView from "./components/SponsorView";
import MerchantView from "./components/MerchantView";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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

// Contract address (replace with your deployed contract)
const CONTRACT_ADDRESS = "0x21adB6b3E3d6d2AF60257Aae45A002b15B28d7eE";

// Function to generate Coinbase on-ramp URL
const generateOnRampUrl = (address: string, asset = "ETH", amount = "") => {
  return `https://pay.coinbase.com/buy/select-asset?appId=${
    import.meta.env.VITE_COINBASE_APP_ID
  }&addresses={"${address}":["base-sepolia"]}&defaultAsset=${asset}${
    amount ? `&presetFiatAmount=${amount}` : ""
  }`;
};

function AppContent() {
  const [userType, setUserType] = useState<"none" | "sponsor" | "merchant">(
    "none"
  );
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const [loading, setLoading] = useState(false);
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

  const showNotification = (
    message: string,
    type: "success" | "error" | "info"
  ) => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification((prev) => (prev ? { ...prev, visible: false } : null));
    }, 3000);
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      await connect({ connector: coinbaseConnector });
      showNotification("Wallet connected successfully!", "success");
    } catch (error) {
      showNotification("Failed to connect wallet. Please try again.", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchRole = () => {
    setUserType("none");
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
          <span className="mr-2">
            {notification.type === "success" && (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {notification.type === "error" && (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {notification.type === "info" && (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </span>
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

      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex justify-between h-12">
            <div className="flex">
              <div
                className="flex-shrink-0 flex items-center cursor-pointer"
                onClick={() => setUserType("none")}
              >
                <svg
                  className="h-5 w-5 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h1 className="ml-1 text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
                  ZepPay
                </h1>
              </div>

              {isConnected && userType !== "none" && (
                <div className="hidden md:flex ml-4 items-center space-x-2">
                  <div className="text-xs font-medium text-gray-700 px-2 py-1 rounded-md">
                    {userType === "sponsor"
                      ? "Sponsor Dashboard"
                      : "Merchant Dashboard"}
                  </div>
                  <button
                    onClick={handleSwitchRole}
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    <svg
                      className="h-3 w-3 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m-4 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                    Switch
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {!isConnected ? (
                <button
                  onClick={handleConnect}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm shadow-sm hover:bg-indigo-700 disabled:opacity-70"
                >
                  <div className="flex items-center">
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin h-3 w-3 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-3 w-3 mr-1"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 15V17M6 8.8V15.2C6 15.8244 6 16.1366 6.10923 16.3878C6.20422 16.6083 6.35145 16.8008 6.53957 16.9472C6.75864 17.1146 7.05338 17.1844 7.64286 17.3241L11.2857 18.1517C11.5562 18.2176 11.6915 18.2505 11.8281 18.2642C11.9507 18.2763 12.0493 18.2763 12.1719 18.2642C12.3085 18.2505 12.4438 18.2176 12.7143 18.1517L16.3571 17.3241C16.9466 17.1844 17.2414 17.1146 17.4604 16.9472C17.6486 16.8008 17.7958 16.6083 17.8908 16.3878C18 16.1366 18 15.8244 18 15.2V8.8C18 8.17557 18 7.86335 17.8908 7.61222C17.7958 7.39166 17.6486 7.19919 17.4604 7.05279C17.2414 6.88541 16.9466 6.81558 16.3571 6.67593L12.7143 5.84833C12.4438 5.78239 12.3085 5.74941 12.1719 5.73577C12.0493 5.72371 11.9507 5.72371 11.8281 5.73577C11.6915 5.74941 11.5562 5.78239 11.2857 5.84833L7.64286 6.67593C7.05338 6.81558 6.75864 6.88541 6.53957 7.05279C6.35145 7.19919 6.20422 7.39166 6.10923 7.61222C6 7.86335 6 8.17557 6 8.8Z" />
                        </svg>
                        Connect
                      </>
                    )}
                  </div>
                </button>
              ) : (
                <>
                  <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg flex items-center text-xs font-mono">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1"></div>
                    {address?.slice(0, 4)}...{address?.slice(-4)}
                  </div>
                  <button
                    onClick={() =>
                      window.open(generateOnRampUrl(address || ""), "_blank")
                    }
                    className="bg-green-500 text-white px-2 py-1 rounded-lg text-xs flex items-center"
                  >
                    <svg
                      className="h-3 w-3 mr-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M12 6V18M18 12H6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Add Funds
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-3 px-2 sm:px-4">
        {!isConnected ? (
          <div className="py-4 px-2 sm:py-6 sm:px-4">
            <div className="max-w-lg mx-auto bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-center items-center mb-4">
                <svg
                  className="h-8 w-8 text-indigo-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="ml-2 text-xl font-bold text-gray-900">
                  Welcome to ZepPay
                </h2>
              </div>
              <p className="text-sm text-gray-500 mb-4 text-center">
                Secure money transfers to Latin America & Caribbean
              </p>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-left mb-4 text-sm">
                <h3 className="font-medium text-blue-800 flex items-center text-sm">
                  <svg
                    className="h-4 w-4 mr-1.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Why Choose ZepPay?
                </h3>
                <div className="mt-1.5 grid grid-cols-2 gap-1.5 text-xs text-blue-700">
                  <div className="flex items-start">
                    <svg
                      className="h-3.5 w-3.5 mr-1 text-blue-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Secure blockchain transfers</span>
                  </div>
                  <div className="flex items-start">
                    <svg
                      className="h-3.5 w-3.5 mr-1 text-blue-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Category-based spending</span>
                  </div>
                  <div className="flex items-start">
                    <svg
                      className="h-3.5 w-3.5 mr-1 text-blue-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Lower fees than wires</span>
                  </div>
                  <div className="flex items-start">
                    <svg
                      className="h-3.5 w-3.5 mr-1 text-blue-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Fast settlement times</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleConnect}
                disabled={loading}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-indigo-700 disabled:opacity-70"
              >
                <div className="flex items-center justify-center">
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4 mr-2"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 15V17M6 8.8V15.2C6 15.8244 6 16.1366 6.10923 16.3878C6.20422 16.6083 6.35145 16.8008 6.53957 16.9472C6.75864 17.1146 7.05338 17.1844 7.64286 17.3241L11.2857 18.1517C11.5562 18.2176 11.6915 18.2505 11.8281 18.2642C11.9507 18.2763 12.0493 18.2763 12.1719 18.2642C12.3085 18.2505 12.4438 18.2176 12.7143 18.1517L16.3571 17.3241C16.9466 17.1844 17.2414 17.1146 17.4604 16.9472C17.6486 16.8008 17.7958 16.6083 17.8908 16.3878C18 16.1366 18 15.8244 18 15.2V8.8C18 8.17557 18 7.86335 17.8908 7.61222C17.7958 7.39166 17.6486 7.19919 17.4604 7.05279C17.2414 6.88541 16.9466 6.81558 16.3571 6.67593L12.7143 5.84833C12.4438 5.78239 12.3085 5.74941 12.1719 5.73577C12.0493 5.72371 11.9507 5.72371 11.8281 5.73577C11.6915 5.74941 11.5562 5.78239 11.2857 5.84833L7.64286 6.67593C7.05338 6.81558 6.75864 6.88541 6.53957 7.05279C6.35145 7.19919 6.20422 7.39166 6.10923 7.61222C6 7.86335 6 8.17557 6 8.8Z"
                        />
                      </svg>
                      Connect to Coinbase Wallet
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        ) : userType === "none" ? (
          <HomePage onSelectUserType={setUserType} />
        ) : userType === "sponsor" ? (
          <SponsorView
            contractAddress={CONTRACT_ADDRESS}
            generateOnRampUrl={generateOnRampUrl}
          />
        ) : (
          <MerchantView contractAddress={CONTRACT_ADDRESS} />
        )}
      </main>

      <footer className="bg-white shadow-inner mt-4">
        <div className="max-w-6xl mx-auto py-3 px-4">
          <div className="flex flex-col items-center justify-center md:flex-row md:justify-between text-xs">
            <p className="text-gray-500">
              ZepPay © {new Date().getFullYear()} - Remittance Solutions
            </p>
            <div className="mt-2 md:mt-0 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Privacy</span>
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 15a1 1 0 100-2 1 1 0 000 2zm1-4a1 1 0 01-1 1v1a1 1 0 102 0v-1a2 2 0 10-2-2v1a1 1 0 102 0v-1a2 2 0 00-1-3.732V7a1 1 0 10-2 0v1.268A3.995 3.995 0 008 12a4 4 0 008 0 1 1 0 10-2 0 2 2 0 01-2 2 1 1 0 01-1-1v-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Terms</span>
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm1-13a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L13 11.586V7z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Help</span>
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
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
