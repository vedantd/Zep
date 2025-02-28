import React, { useState, useEffect, useCallback } from "react";
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
} from "@coinbase/onchainkit/transaction";
import { useAccount, useReadContract, useBalance } from "wagmi";
import { ethers } from "ethers";
import { ZepPayABI } from "../utils/constants";
import { Avatar, Name, Address } from "@coinbase/onchainkit/identity";
import { publicClient } from "../utils/wagmi";

type SponsorViewProps = {
  contractAddress: string;
};

type Beneficiary = {
  name: string;
  mobileNumber: string;
};

type SponsorshipData = {
  beneficiary: string;
  amount: string;
  category: number;
};

const SponsorView: React.FC<SponsorViewProps> = ({ contractAddress }) => {
  const { address, isConnected } = useAccount();
  const [view, setView] = useState<"list" | "add" | "sponsor">("list");
  const [error, setError] = useState<string | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [newBeneficiary, setNewBeneficiary] = useState<{
    name: string;
    mobileNumber: string;
  }>({ name: "", mobileNumber: "" });
  const [sponsorship, setSponsorship] = useState<SponsorshipData>({
    beneficiary: "",
    amount: "",
    category: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<string | null>(
    null
  );

  // FIXED: Use the correct USDC token address from the contract
  const USDC_CONTRACT_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

  // Get USDC balance with the correct token address
  const { data: usdcBalance } = useBalance({
    address: address,
    token: USDC_CONTRACT_ADDRESS as `0x${string}`, // Correct USDC on Base
  });

  const categories = ["Groceries", "Healthcare", "Education", "Emergency"];

  // Update the read contract call
  const { data: beneficiaryMobiles, isError: beneficiaryError } =
    useReadContract({
      address: contractAddress as `0x${string}`,
      abi: ZepPayABI,
      functionName: "sponsorBeneficiaries",
      args: [address],
    });

  // Add error message logging
  useEffect(() => {
    console.log("Contract Address:", contractAddress);
    console.log("User Address:", address);
    console.log("Beneficiary Mobiles:", beneficiaryMobiles);
    if (beneficiaryError) {
      console.error("Error reading beneficiaries:", beneficiaryError);
    }
  }, [contractAddress, address, beneficiaryMobiles, beneficiaryError]);

  // Update the fetch function to handle array index
  const fetchBeneficiaryDetails = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      const details: Beneficiary[] = [];
      let index = 0;

      while (true) {
        try {
          const mobile = await publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi: ZepPayABI,
            functionName: "sponsorBeneficiaries",
            args: [address, BigInt(index)],
          });

          if (!mobile || mobile === "") break;

          console.log(`Fetching details for mobile: ${mobile}`);

          // Get beneficiary name using getBeneficiaryDetails
          try {
            const beneficiaryName = await publicClient.readContract({
              address: contractAddress as `0x${string}`,
              abi: ZepPayABI,
              functionName: "getBeneficiaryDetails",
              args: [address, mobile],
            });

            console.log(`Name for ${mobile}:`, beneficiaryName);

            details.push({
              name: (beneficiaryName as string) || `Beneficiary ${index + 1}`,
              mobileNumber: mobile as string,
            });
          } catch (nameError) {
            console.error(`Error fetching name for ${mobile}:`, nameError);
            // Add with default name if we couldn't get the real name
            details.push({
              name: `Beneficiary ${index + 1}`,
              mobileNumber: mobile as string,
            });
          }

          index++;
        } catch (err) {
          console.error(`Error fetching beneficiary at index ${index}:`, err);
          // If we get an error, we've likely reached the end of the array
          break;
        }
      }

      console.log("Final details array:", details);
      setBeneficiaries(details);
    } catch (err) {
      console.error("Error in fetchBeneficiaryDetails:", err);
      setError("Failed to load beneficiaries");
    } finally {
      setIsLoading(false);
    }
  }, [address, contractAddress]);

  // Only fetch details when connected and have address
  useEffect(() => {
    if (isConnected && address) {
      fetchBeneficiaryDetails();
    }
  }, [isConnected, address, fetchBeneficiaryDetails]);

  // Handle transaction status updates
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleTransactionStatus = (status: any) => {
    switch (status.statusName) {
      case "buildingTransaction":
        setTransactionStatus("Preparing transaction...");
        break;
      case "transactionIdle":
        setTransactionStatus("Transaction ready to submit");
        break;
      case "transactionPending":
        setTransactionStatus("Transaction sent to network");
        break;
      case "success":
        setTransactionStatus("Transaction successful!");
        setTimeout(() => {
          setView("list");
          setTransactionStatus(null);
        }, 2000);
        break;
      case "error":
        setError(
          `Transaction failed: ${status.statusData?.message || "Unknown error"}`
        );
        setTransactionStatus(null);
        break;
      default:
        setTransactionStatus(status.statusName);
    }
  };

  // Add logging for beneficiary data
  const selectBeneficiaryForSponsorship = (
    mobileNumber: string,
    name: string
  ) => {
    console.log(`Selected beneficiary: ${name} (${mobileNumber})`);
    setSponsorship({
      ...sponsorship,
      beneficiary: mobileNumber,
    });
    setView("sponsor");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">
            Sponsor Dashboard
          </h1>
          {isConnected ? (
            <div className="flex flex-col sm:flex-row sm:items-center mt-2 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="mr-2">Connected as:</span>
                <Avatar address={address} className="h-6 w-6 mr-2" />
                <Name address={address} className="mr-2" />
                <Address address={address} />
              </div>
              {usdcBalance && (
                <div className="mt-2 sm:mt-0 sm:ml-auto bg-blue-50 px-2 py-1 rounded-md text-xs">
                  <span className="font-medium text-blue-800">
                    USDC Balance:
                  </span>{" "}
                  {ethers.utils.formatUnits(usdcBalance.value, 6)}
                </div>
              )}
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-600">
              Connect your wallet to continue
            </p>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-xs text-red-700 underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {transactionStatus && (
          <div className="p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-700">
            <p className="flex items-center">
              <svg
                className="animate-spin h-4 w-4 mr-2"
                viewBox="0 0 24 24"
                fill="none"
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
              {transactionStatus}
            </p>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setView("list")}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              view === "list"
                ? "text-blue-600 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            My Beneficiaries
          </button>
          <button
            onClick={() => setView("add")}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              view === "add"
                ? "text-blue-600 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Add Beneficiary
          </button>
        </div>

        {/* Beneficiary List View */}
        {view === "list" && (
          <div className="p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Your Beneficiaries
            </h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-4">Loading beneficiaries...</div>
            ) : beneficiaries.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                You haven't added any beneficiaries yet.
              </div>
            ) : (
              <div className="space-y-3">
                {beneficiaries.map((beneficiary, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-3 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">
                        {beneficiary.name || `Beneficiary ${index + 1}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {beneficiary.mobileNumber}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        selectBeneficiaryForSponsorship(
                          beneficiary.mobileNumber,
                          beneficiary.name
                        )
                      }
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Send Funds
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={() => setView("add")}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md"
              >
                Add New Beneficiary
              </button>
            </div>
          </div>
        )}

        {/* Add Beneficiary View */}
        {view === "add" && (
          <div className="p-4">
            <div className="flex items-center mb-4">
              <button
                onClick={() => setView("list")}
                className="text-blue-600 hover:text-blue-800 mr-2"
              >
                ← Back
              </button>
              <h2 className="text-lg font-medium text-gray-900">
                Add New Beneficiary
              </h2>
            </div>

            <Transaction
              calls={[
                {
                  address: contractAddress as `0x${string}`,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  abi: ZepPayABI as any,
                  functionName: "addBeneficiary",
                  // FIX: Correct parameter order as per contract (name, mobileNumber)
                  args: [newBeneficiary.name, newBeneficiary.mobileNumber],
                },
              ]}
              onStatus={(status) => {
                handleTransactionStatus(status);
                if (status.statusName === "success") {
                  setView("list");
                  // Add to local list immediately for good UX
                  setBeneficiaries([
                    ...beneficiaries,
                    {
                      name: newBeneficiary.name,
                      mobileNumber: newBeneficiary.mobileNumber,
                    },
                  ]);
                  setNewBeneficiary({ name: "", mobileNumber: "" });
                }
              }}
              onError={(error) => {
                console.error("Add beneficiary error:", error);
                setError(`Failed to add beneficiary: ${error.message}`);
              }}
            >
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Beneficiary Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={newBeneficiary.name}
                    onChange={(e) =>
                      setNewBeneficiary({
                        ...newBeneficiary,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="mobileNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    id="mobileNumber"
                    value={newBeneficiary.mobileNumber}
                    onChange={(e) =>
                      setNewBeneficiary({
                        ...newBeneficiary,
                        mobileNumber: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter mobile number with country code"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Example: +503xxxxxxxx (include country code)
                  </p>
                </div>

                <div className="pt-2">
                  <TransactionButton
                    text="Add Beneficiary"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md"
                  />
                </div>

                <TransactionStatus>
                  <div className="mt-3 bg-gray-50 p-3 rounded-md">
                    <TransactionStatusLabel className="text-sm font-medium" />
                    <TransactionStatusAction className="mt-2 text-sm text-blue-600 hover:text-blue-800" />
                  </div>
                </TransactionStatus>
              </div>
            </Transaction>
          </div>
        )}

        {/* Send Sponsorship View */}
        {view === "sponsor" && (
          <div className="p-4">
            <div className="flex items-center mb-4">
              <button
                onClick={() => setView("list")}
                className="text-blue-600 hover:text-blue-800 mr-2"
              >
                ← Back
              </button>
              <h2 className="text-lg font-medium text-gray-900">
                Send Sponsorship
              </h2>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* Selected Beneficiary Display */}
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <div className="text-sm text-blue-700">Selected Beneficiary</div>
              <div className="font-medium">
                {beneficiaries.find(
                  (b) => b.mobileNumber === sponsorship.beneficiary
                )?.name || "Unknown Beneficiary"}
              </div>
              <div className="text-sm text-gray-500">
                {sponsorship.beneficiary}
              </div>
            </div>

            {/* USDC Balance Display */}
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-700">Your USDC Balance</div>
              <div className="font-medium">
                {usdcBalance
                  ? `${parseFloat(usdcBalance.formatted).toFixed(2)} USDC`
                  : "Loading..."}
              </div>
            </div>

            {/* Sponsorship Form */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (USDC)
              </label>
              <input
                type="number"
                value={sponsorship.amount}
                onChange={(e) =>
                  setSponsorship({ ...sponsorship, amount: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="0.00"
                min="0"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={sponsorship.category}
                onChange={(e) =>
                  setSponsorship({
                    ...sponsorship,
                    category: parseInt(e.target.value),
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {categories.map((category, index) => (
                  <option key={index} value={index}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Transaction Component */}
            <Transaction
              contracts={[
                // First approve USDC
                {
                  address: USDC_CONTRACT_ADDRESS as `0x${string}`,
                  abi: [
                    {
                      name: "approve",
                      type: "function",
                      stateMutability: "nonpayable",
                      inputs: [
                        { name: "spender", type: "address" },
                        { name: "amount", type: "uint256" },
                      ],
                      outputs: [{ type: "bool" }],
                    },
                  ],
                  functionName: "approve",
                  args: [
                    contractAddress as `0x${string}`,
                    // Convert amount to USDC units (6 decimals)
                    sponsorship.amount
                      ? BigInt(parseFloat(sponsorship.amount) * 1000000)
                      : BigInt(0),
                  ],
                },
                // Then create sponsorship
                {
                  address: contractAddress as `0x${string}`,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  abi: ZepPayABI as any,
                  functionName: "createSponsorship",
                  args: [
                    sponsorship.beneficiary,
                    // Convert amount to USDC units (6 decimals)
                    sponsorship.amount
                      ? BigInt(parseFloat(sponsorship.amount) * 1000000)
                      : BigInt(0),
                    BigInt(sponsorship.category),
                  ],
                },
              ]}
              onStatus={(status) => {
                console.log("Transaction status:", status);
                if (status.statusName === "success") {
                  setTransactionStatus("Sponsorship created successfully!");
                  // Reset form after successful transaction
                  setTimeout(() => {
                    setView("list");
                    setSponsorship({
                      beneficiary: "",
                      amount: "",
                      category: 0,
                    });
                    setTransactionStatus(null);
                  }, 3000);
                } else if (status.statusName === "error") {
                  setError(`Transaction failed: ${status.statusData.message}`);
                } else {
                  setTransactionStatus(`Transaction ${status.statusName}...`);
                }
              }}
            >
              <TransactionButton
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md mb-3"
                disabled={
                  !sponsorship.beneficiary ||
                  !sponsorship.amount ||
                  parseFloat(sponsorship.amount) <= 0
                }
              />
              <TransactionStatus>
                <TransactionStatusLabel className="mt-2 text-sm" />
                <TransactionStatusAction className="mt-1 text-sm text-blue-600" />
              </TransactionStatus>
            </Transaction>

            {/* Buy USDC Button */}
            <div className="pt-1">
              <a
                href={`https://pay.coinbase.com/buy/select-asset?projectId=${
                  import.meta.env.VITE_COINBASE_APP_ID || ""
                }&destinationWallets=[{"address":"${
                  address || ""
                }","assets":["USDC"],"blockchains":["base"]}]&defaultNetwork=base${
                  sponsorship.amount
                    ? `&presetCryptoAmount=${sponsorship.amount}`
                    : ""
                }`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md text-center block mb-3"
              >
                Buy USDC
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SponsorView;
