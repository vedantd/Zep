import React, { useState, useEffect, useCallback } from "react";
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
} from "@coinbase/onchainkit/transaction";
import { FundButton } from "@coinbase/onchainkit/fund";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { ZepPayABI } from "../utils/constants";

type SponsorViewProps = {
  contractAddress: string;
};

type Beneficiary = {
  name: string;
  mobileNumber: string;
};

const SponsorView: React.FC<SponsorViewProps> = ({ contractAddress }) => {
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
  const [error, setError] = useState<string | null>(null);

  const categories = ["Groceries", "Healthcare", "Education", "Emergency"];

  // Mock data for demonstration
  const fetchBeneficiaries = useCallback(async () => {
    if (!address) return;

    try {
      // Simulate API call with mock data
      // In a real app, this would call the contract
      setTimeout(() => {
        const mockBeneficiaries = [
          { name: "Alice Rodriguez", mobileNumber: "+50370123456" },
          { name: "Carlos Sanchez", mobileNumber: "+50370654321" },
        ];
        setBeneficiaries(mockBeneficiaries);
      }, 500);
    } catch (error) {
      console.error("Error fetching beneficiaries:", error);
      setError("Failed to load beneficiaries. Please try again later.");
    }
  }, [address]);

  useEffect(() => {
    fetchBeneficiaries();
  }, [address, fetchBeneficiaries]);

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
    <div className="max-w-2xl mx-auto">
      {/* View Switcher - Tabs */}
      <div className="border-b border-gray-200 mb-3">
        <nav className="flex">
          <button
            onClick={() => setView("list")}
            className={`py-2 px-3 font-medium text-sm border-b-2 ${
              view === "list"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Beneficiaries
          </button>
          <button
            onClick={handleAddBeneficiary}
            className={`py-2 px-3 font-medium text-sm border-b-2 ${
              view === "add"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Add Beneficiary
          </button>
        </nav>
      </div>

      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-800 rounded-md p-2 text-sm">
          {error}
        </div>
      )}

      {view === "list" && (
        <div className="bg-white shadow-sm rounded-md overflow-hidden">
          <div className="flex justify-between items-center p-3 border-b border-gray-200">
            <h2 className="text-base font-medium text-gray-900">
              Beneficiaries
            </h2>
            <button
              onClick={handleAddBeneficiary}
              className="bg-blue-600 text-white px-2 py-1 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Add
            </button>
          </div>

          {beneficiaries.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-gray-500 text-sm mb-2">No beneficiaries yet</p>
              <button
                onClick={handleAddBeneficiary}
                className="px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
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
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {ben.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {ben.mobileNumber}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSendMoney(ben)}
                      className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-medium hover:bg-blue-600"
                    >
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
        <div className="bg-white shadow-sm rounded-md overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <h2 className="text-base font-medium text-gray-900 mb-2">
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                    value={newBeneficiary.name}
                    onChange={(e) =>
                      setNewBeneficiary({
                        ...newBeneficiary,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter beneficiary's name"
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                    placeholder="+123456789"
                    value={newBeneficiary.mobileNumber}
                    onChange={(e) =>
                      setNewBeneficiary({
                        ...newBeneficiary,
                        mobileNumber: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setView("list");
                      setError(null);
                    }}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm"
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
        <div className="bg-white shadow-sm rounded-md overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center mb-3">
              <button
                onClick={() => setView("list")}
                className="text-blue-600 hover:text-blue-800 mr-2"
              >
                ← Back
              </button>
              <h2 className="text-base font-medium text-gray-900">
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
                }
              }}
              onError={(error) => {
                console.error("Sponsorship error:", error);
                setError(`Transaction failed: ${error.message}`);
              }}
            >
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-md p-3">
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
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 pl-7 border"
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
                          flex items-center p-2 rounded-md border cursor-pointer
                          ${
                            sponsorship.category === index
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-300 hover:border-blue-300"
                          }
                        `}
                        onClick={() =>
                          setSponsorship({ ...sponsorship, category: index })
                        }
                      >
                        <span className="text-xs font-medium text-gray-900">
                          {category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Use FundButton from OnchainKit for funding */}
                <div className="pt-1">
                  <FundButton
                    text="Buy USDC"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md text-center"
                    openIn="popup"
                    popupSize="lg"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm"
                  >
                    Cancel
                  </button>
                  <TransactionButton
                    text={`Send $${sponsorship.amount || "0"} USDC`}
                  />
                </div>

                <TransactionStatus>
                  <TransactionStatusLabel />
                  <TransactionStatusAction />
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
