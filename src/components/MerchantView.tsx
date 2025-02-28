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

type MerchantViewProps = {
  contractAddress: string;
};

const MerchantView: React.FC<MerchantViewProps> = ({ contractAddress }) => {
  const { address } = useAccount();
  const [, setIsRegistered] = useState(false);
  const [view, setView] = useState<"register" | "dashboard">("register");
  const [merchantInfo, setMerchantInfo] = useState({
    businessName: "",
    category: 0, // Default to Groceries
  });
  const [paymentInfo, setPaymentInfo] = useState({
    beneficiaryPhone: "",
    amount: "",
    otp: "",
  });
  const [otpRequested, setOtpRequested] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = ["Groceries", "Healthcare", "Education", "Emergency"];

  useEffect(() => {
    // Check if merchant is registered
    // For the hackathon, we'll simulate unregistered at first
    setIsRegistered(false);
    setView("register");
  }, [address]);

  const handleRequestOtp = async () => {
    if (!paymentInfo.beneficiaryPhone || !paymentInfo.amount) {
      setError("Please fill in all fields");
      return;
    }

    // In a real app, this would call the contract to generate an OTP
    // For the hackathon, we'll simulate an OTP
    const simulatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

    setOtpRequested(true);
    setError(null);

    // For demo purposes - in a real app, this would be sent to the beneficiary's phone
    alert(`Demo OTP: ${simulatedOtp}`);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-md shadow-sm overflow-hidden">
      <div className="bg-green-600 px-3 py-3">
        <h3 className="text-base font-medium text-white">Merchant Dashboard</h3>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border-b border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {view === "register" && (
        <div className="p-4">
          <h2 className="text-base font-medium text-gray-900 mb-3">
            Register Your Business
          </h2>

          <Transaction
            calls={[
              {
                address: contractAddress as `0x${string}`,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                abi: ZepPayABI as any,
                functionName: "registerMerchant",
                args: [merchantInfo.businessName, merchantInfo.category],
              },
            ]}
            onStatus={(status) => {
              if (status.statusName === "success") {
                setIsRegistered(true);
                setView("dashboard");
              }
            }}
            onError={(error) => {
              console.error("Registration error:", error);
              setError(`Registration failed: ${error.message}`);
            }}
          >
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="businessName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Business Name
                </label>
                <input
                  type="text"
                  id="businessName"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                  value={merchantInfo.businessName}
                  onChange={(e) =>
                    setMerchantInfo({
                      ...merchantInfo,
                      businessName: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Business Category
                </label>
                <select
                  id="category"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                  value={merchantInfo.category}
                  onChange={(e) =>
                    setMerchantInfo({
                      ...merchantInfo,
                      category: Number(e.target.value),
                    })
                  }
                >
                  {categories.map((cat, index) => (
                    <option key={index} value={index}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <TransactionButton text="Register Business" />
              </div>

              <TransactionStatus>
                <div className="bg-gray-50 p-2 rounded-md text-sm">
                  <TransactionStatusLabel />
                  <TransactionStatusAction />
                </div>
              </TransactionStatus>
            </div>
          </Transaction>
        </div>
      )}

      {view === "dashboard" && (
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-medium text-gray-900">
              Accept Payment
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <label
                htmlFor="beneficiaryPhone"
                className="block text-sm font-medium text-gray-700"
              >
                Beneficiary Phone Number
              </label>
              <input
                type="text"
                id="beneficiaryPhone"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                placeholder="+123456789"
                value={paymentInfo.beneficiaryPhone}
                onChange={(e) =>
                  setPaymentInfo({
                    ...paymentInfo,
                    beneficiaryPhone: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label
                htmlFor="paymentAmount"
                className="block text-sm font-medium text-gray-700"
              >
                Amount (USDC)
              </label>
              <input
                type="number"
                id="paymentAmount"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                placeholder="10.00"
                value={paymentInfo.amount}
                onChange={(e) =>
                  setPaymentInfo({ ...paymentInfo, amount: e.target.value })
                }
              />
            </div>

            {!otpRequested ? (
              <div className="pt-2">
                <button
                  onClick={handleRequestOtp}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-md text-sm font-medium"
                >
                  Request Payment
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Enter OTP from Customer
                  </label>
                  <input
                    type="text"
                    id="otp"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                    placeholder="1234"
                    value={paymentInfo.otp}
                    onChange={(e) =>
                      setPaymentInfo({ ...paymentInfo, otp: e.target.value })
                    }
                  />
                </div>

                <Transaction
                  calls={[
                    {
                      address: contractAddress as `0x${string}`,
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      abi: ZepPayABI as any,
                      functionName: "processPayment",
                      args: [
                        paymentInfo.beneficiaryPhone,
                        ethers.utils.parseUnits(paymentInfo.amount || "0", 6),
                        paymentInfo.otp,
                      ],
                    },
                  ]}
                  onStatus={(status) => {
                    if (status.statusName === "success") {
                      alert(
                        `Payment of ${paymentInfo.amount} USDC received successfully!`
                      );
                      setPaymentInfo({
                        beneficiaryPhone: "",
                        amount: "",
                        otp: "",
                      });
                      setOtpRequested(false);
                    }
                  }}
                  onError={(error) => {
                    console.error("Payment error:", error);
                    setError(`Payment failed: ${error.message}`);
                  }}
                >
                  <div className="pt-2">
                    <TransactionButton text="Process Payment" />
                  </div>

                  <TransactionStatus>
                    <div className="mt-2 bg-gray-50 p-2 rounded-md text-sm">
                      <TransactionStatusLabel />
                      <TransactionStatusAction />
                    </div>
                  </TransactionStatus>
                </Transaction>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantView;
