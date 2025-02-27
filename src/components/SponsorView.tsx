import React, { useState, useEffect } from "react";
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
} from "@coinbase/onchainkit/transaction";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { ZepPayABI } from "../utils/constants";

type SponsorViewProps = {
  contractAddress: string;
  generateOnRampUrl: (
    address: string,
    asset?: string,
    amount?: string
  ) => string;
};

type Beneficiary = {
  name: string;
  mobileNumber: string;
};

const SponsorView: React.FC<SponsorViewProps> = ({
  contractAddress,
  generateOnRampUrl,
}) => {
  const { address } = useAccount();
  const [view, setView] = useState<"list" | "add" | "sponsor">("list");
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [newBeneficiary, setNewBeneficiary] = useState({
    name: "",
    mobileNumber: "",
  });
  const [sponsorship, setSponsorship] = useState({
    amount: "",
    beneficiary: "",
    category: 0, // Default to Groceries
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = ["Groceries", "Healthcare", "Education", "Emergency"];

  // Fetch beneficiaries
  const fetchBeneficiaries = async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, we would call the contract
      // For the hackathon, we'll simulate some data initially
      setTimeout(() => {
        if (beneficiaries.length === 0) {
          const mockBeneficiaries = [
            { name: "Alice Rodriguez", mobileNumber: "+50370123456" },
            { name: "Carlos Sanchez", mobileNumber: "+50370654321" },
          ];
          setBeneficiaries(mockBeneficiaries);
        }
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching beneficiaries:", error);
      setError("Failed to load beneficiaries. Please try again later.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, [address]);

  const handleAddBeneficiary = () => {
    setView("add");
    setNewBeneficiary({ name: "", mobileNumber: "" });
    setError(null);
  };

  const handleSendMoney = (beneficiary: Beneficiary) => {
    setSponsorship({
      ...sponsorship,
      beneficiary: beneficiary.mobileNumber,
    });
    setView("sponsor");
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* View Switcher - Tabs */}
      <div className="border-b border-gray-200 mb-3">
        <nav className="flex -mb-px">
          <button
            onClick={() => setView("list")}
            className={`py-2 px-4 font-medium text-sm border-b-2 ${
              view === "list"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center">
              <svg
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              My Beneficiaries
            </div>
          </button>
          <button
            onClick={handleAddBeneficiary}
            className={`py-2 px-4 font-medium text-sm border-b-2 ${
              view === "add"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center">
              <svg
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Beneficiary
            </div>
          </button>
        </nav>
      </div>

      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-800 rounded-lg p-2 text-sm">
          <div className="flex">
            <svg
              className="h-4 w-4 text-red-500 mr-2 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {view === "list" && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="flex justify-between items-center p-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Beneficiaries
            </h2>
            <button
              onClick={handleAddBeneficiary}
              className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center"
            >
              <svg
                className="h-3 w-3 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add
            </button>
          </div>

          {isLoading ? (
            <div className="p-4 flex justify-center">
              <div className="flex flex-col items-center">
                <svg
                  className="animate-spin h-6 w-6 text-indigo-600"
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
                <span className="mt-2 text-sm text-gray-500">
                  Loading beneficiaries...
                </span>
              </div>
            </div>
          ) : beneficiaries.length === 0 ? (
            <div className="p-4 text-center">
              <svg
                className="h-8 w-8 text-gray-400 mx-auto mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <p className="text-gray-500 text-base mb-2">
                No beneficiaries yet
              </p>
              <button
                onClick={handleAddBeneficiary}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <svg
                  className="h-3 w-3 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Beneficiary
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {beneficiaries.map((ben, index) => (
                <li
                  key={index}
                  className="p-3 hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-bold">
                        {ben.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {ben.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {ben.mobileNumber}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSendMoney(ben)}
                      className="bg-green-500 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-green-600 flex items-center"
                    >
                      <svg
                        className="h-3 w-3 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      Send Money
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {view === "add" && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Add Beneficiary
            </h2>

            <Transaction
              calls={[
                {
                  address: contractAddress as `0x${string}`,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  abi: ZepPayABI as any,
                  functionName: "addBeneficiary",
                  args: [newBeneficiary.name, newBeneficiary.mobileNumber],
                },
              ]}
              onStatus={(status) => {
                if (status.statusName === "success") {
                  // Add the beneficiary to our local state for immediate feedback
                  setBeneficiaries([...beneficiaries, newBeneficiary]);
                  setNewBeneficiary({ name: "", mobileNumber: "" });
                  setView("list");
                }
              }}
              onError={(error) => {
                setError(`Failed to add beneficiary: ${error.message}`);
              }}
            >
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500"
                    value={newBeneficiary.name}
                    onChange={(e) =>
                      setNewBeneficiary({
                        ...newBeneficiary,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter beneficiary's full name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="mobile"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    id="mobile"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="+123456789"
                    value={newBeneficiary.mobileNumber}
                    onChange={(e) =>
                      setNewBeneficiary({
                        ...newBeneficiary,
                        mobileNumber: e.target.value,
                      })
                    }
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Include country code (e.g., +503 for El Salvador)
                  </p>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setView("list");
                      setError(null);
                    }}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <TransactionButton text="Add Beneficiary" />
                </div>

                <TransactionStatus>
                  <div className="mt-2 p-2 bg-gray-50 rounded-md text-sm">
                    <TransactionStatusLabel />
                    <TransactionStatusAction />
                  </div>
                </TransactionStatus>
              </div>
            </Transaction>
          </div>
        </div>
      )}

      {view === "sponsor" && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center mb-3">
              <button
                onClick={() => setView("list")}
                className="text-indigo-600 hover:text-indigo-800 mr-2"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                Send Money
              </h2>
            </div>

            <Transaction
              calls={[
                {
                  address: contractAddress as `0x${string}`,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  abi: ZepPayABI as any,
                  functionName: "createSponsorship",
                  args: [
                    sponsorship.beneficiary,
                    ethers.utils.parseUnits(sponsorship.amount || "0", 6),
                    sponsorship.category,
                  ],
                },
              ]}
              onStatus={(status) => {
                if (status.statusName === "success") {
                  setView("list");
                  // You would typically show a success notification here
                }
              }}
              onError={(error) => {
                setError(`Transaction failed: ${error.message}`);
              }}
            >
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-bold mr-2">
                      {beneficiaries
                        .find((b) => b.mobileNumber === sponsorship.beneficiary)
                        ?.name.charAt(0)
                        .toUpperCase() || "?"}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">
                        {
                          beneficiaries.find(
                            (b) => b.mobileNumber === sponsorship.beneficiary
                          )?.name
                        }
                      </h3>
                      <p className="text-xs text-gray-500">
                        {sponsorship.beneficiary}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Amount (USDC)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="amount"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 pl-7 border focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="100.00"
                      value={sponsorship.amount}
                      onChange={(e) =>
                        setSponsorship({
                          ...sponsorship,
                          amount: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Spending Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category, index) => (
                      <div
                        key={index}
                        className={`
                          flex items-center p-2 rounded-md border cursor-pointer transition-all duration-200
                          ${
                            sponsorship.category === index
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-gray-300 hover:border-indigo-300"
                          }
                        `}
                        onClick={() =>
                          setSponsorship({ ...sponsorship, category: index })
                        }
                      >
                        <div
                          className={`
                          w-4 h-4 rounded-full flex items-center justify-center mr-2
                          ${
                            sponsorship.category === index
                              ? "bg-indigo-500"
                              : "bg-gray-200"
                          }
                        `}
                        >
                          {sponsorship.category === index && (
                            <svg
                              className="h-2 w-2 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-xs font-medium text-gray-900">
                          {category}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Funds can only be spent in the selected category
                  </p>
                </div>

                {/* Add Coinbase on-ramp button for USDC */}
                <div className="pt-1 pb-2">
                  <p className="text-xs text-gray-600 mb-1">
                    Need USDC to send?
                  </p>
                  <button
                    onClick={() =>
                      window.open(
                        generateOnRampUrl(
                          address || "",
                          "USDC",
                          sponsorship.amount || "10"
                        ),
                        "_blank"
                      )
                    }
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-md transition-colors duration-150 flex items-center justify-center text-sm"
                  >
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Buy USDC with Coinbase
                  </button>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <TransactionButton
                    text={`Send $${sponsorship.amount || "0"} USDC`}
                  />
                </div>

                <TransactionStatus>
                  <div className="mt-2 p-2 bg-gray-50 rounded-md text-sm">
                    <TransactionStatusLabel />
                    <TransactionStatusAction />
                  </div>
                </TransactionStatus>
              </div>
            </Transaction>
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorView;
