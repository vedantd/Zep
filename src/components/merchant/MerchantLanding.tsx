import React, { useEffect, useState } from 'react';
import { Wallet, ConnectWallet, WalletDropdown, WalletDropdownDisconnect } from "@coinbase/onchainkit/wallet";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { ZepPayABI } from "../../utils/constants";

const CONTRACT_ADDRESS = "0x21adB6b3E3d6d2AF60257Aae45A002b15B28d7eE";

const MerchantLanding: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [isMerchant, setIsMerchant] = useState(false);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      checkMerchantRegistration().then((registered) => {
        setIsMerchant(registered);
        if (registered) {
          fetchMerchantDetails();
        }
      });
    }
  }, [isConnected, address]);

  const checkMerchantRegistration = async () => {
    // Logic to interact with the smart contract and check if the address is a registered merchant
    return true; // Placeholder for demonstration
  };

  const fetchMerchantDetails = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ZepPayABI, provider);
      const merchant = await contract.merchants(address);
      setBusinessName(merchant.businessName);
      setCategory(merchant.category);
    } catch (error) {
      console.error("Error fetching merchant details:", error);
    }
  };

  return (
    <div className="merchant-landing min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-12">
            <div className="flex items-center">
              <h1 className="text-base font-bold text-gray-900">Merchant Dashboard</h1>
            </div>
            <div className="flex items-center">
              <Wallet>
                <ConnectWallet className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700" />
                {isConnected && (
                  <WalletDropdown>
                    <WalletDropdownDisconnect />
                  </WalletDropdown>
                )}
              </Wallet>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 px-4 flex-grow">
        {!isConnected ? (
          <div className="py-4">
            <div className="max-w-md mx-auto bg-white p-6 rounded-md shadow-sm">
              <h2 className="text-lg font-medium text-gray-900 mb-4 text-center">
                Connect your wallet to access merchant features
              </h2>
              <ConnectWallet
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                text="Connect Wallet"
              />
            </div>
          </div>
        ) : isMerchant ? (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4 text-center">
              Welcome, Merchant!
            </h2>
            <p className="text-center text-gray-700">
              Business Name: {businessName}
            </p>
            <p className="text-center text-gray-700">
              Category: {category}
            </p>
            {/* Additional merchant functionalities can be added here */}
          </div>
        ) : (
          <div className="text-center text-red-500">
            You are not registered as a merchant.
          </div>
        )}
      </main>

      <footer className="bg-white py-3 mt-auto">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <p>Merchant Dashboard © {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MerchantLanding;