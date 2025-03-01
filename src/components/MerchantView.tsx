import React, { useState, useEffect } from "react";
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
} from "@coinbase/onchainkit/transaction";
import { useAccount, useWriteContract } from "wagmi";
import { ethers } from "ethers";
import { ZepPayABI } from "../utils/constants";
import { publicClient } from "../utils/wagmi";

type MerchantViewProps = {
  contractAddress: string;
};

const MerchantView: React.FC<MerchantViewProps> = ({ contractAddress }) => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
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
  const [otpData, setOtpData] = useState<{
    otp: string;
    expiry: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const categories = ["Groceries", "Healthcare", "Education", "Emergency"];

  // Helper function to add a log entry
  const addLog = (message: string) => {
    console.log(message);
    setLogs((prev) => [
      ...prev,
      `${new Date().toTimeString().slice(0, 8)}: ${message}`,
    ]);
  };

  // Check if merchant is registered when component mounts or address changes
  useEffect(() => {
    const checkMerchantRegistration = async () => {
      if (!address) return;

      try {
        const merchant = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: ZepPayABI,
          functionName: "merchants",
          args: [address],
        });

        if (merchant) {
          const merchantArray = merchant as unknown[];
          const isRegisteredValue = merchantArray[2] === true;
          setIsRegistered(isRegisteredValue);
          setView(isRegisteredValue ? "dashboard" : "register");
        } else {
          setIsRegistered(false);
          setView("register");
        }
      } catch (error) {
        console.error("Error checking merchant registration:", error);
        setIsRegistered(false);
        setView("register");
      }
    };

    checkMerchantRegistration();
  }, [address, contractAddress]);

  const handleRequestOtp = async () => {
    if (!paymentInfo.beneficiaryPhone || !paymentInfo.amount) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Generate OTP through contract
      const hash = await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: ZepPayABI,
        functionName: "requestPayment",
        args: [
          paymentInfo.beneficiaryPhone,
          ethers.utils.parseUnits(paymentInfo.amount || "0", 6),
        ],
      });

      // Wait for transaction to be mined
      await publicClient.waitForTransactionReceipt({
        hash,
      });

      try {
        // Get OTP from contract
        const result = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: ZepPayABI,
          functionName: "getOtp",
          args: [paymentInfo.beneficiaryPhone],
        });

        if (result) {
          // Handle different return types
          let otp, expiry;

          if (Array.isArray(result) && result.length >= 2) {
            // If result is [otp, expiry]
            otp = result[0].toString();
            const expiryTimestamp = Number(result[1].toString());
            expiry = new Date(expiryTimestamp * 1000)
              .toTimeString()
              .slice(0, 8);
          } else {
            // If result is just the OTP
            otp = result.toString();
            expiry = new Date(Date.now() + 15000).toTimeString().slice(0, 8);
          }

          setOtpData({ otp, expiry });
          setOtpRequested(true);
          addLog(`OTP retrieved: ${otp}, expires: ${expiry}`);
        } else {
          throw new Error("No OTP returned from contract");
        }
      } catch (readError) {
        console.error("Error reading OTP:", readError);
        setError("Failed to read OTP after generation");
      }
    } catch (error) {
      console.error("Error requesting OTP:", error);
      setError(
        `Failed to request OTP: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-md shadow-sm overflow-hidden">
      <div className="bg-green-600 px-3 py-3">
        <h3 className="text-base font-medium text-white">Merchant Dashboard</h3>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border-b border-red-200 text-red-700 text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-xs underline"
          >
            Dismiss
          </button>
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
                  className={`w-full ${
                    isLoading
                      ? "bg-green-400"
                      : "bg-green-500 hover:bg-green-600"
                  } text-white py-2 px-3 rounded-md text-sm font-medium flex justify-center items-center`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
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
                      Requesting OTP...
                    </>
                  ) : (
                    "Request Payment"
                  )}
                </button>
              </div>
            ) : (
              <>
                {otpData && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                    <p className="text-blue-800 text-sm font-medium">
                      Payment OTP Generated
                    </p>
                    <p className="text-sm mt-1">
                      <span className="font-medium">OTP:</span> {otpData.otp}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Expires at:</span>{" "}
                      {otpData.expiry}
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      In a production app, this OTP would be sent directly to
                      the beneficiary's phone
                    </p>
                  </div>
                )}

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
                    placeholder="Enter OTP"
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
                      addLog("Payment processed successfully!");
                      alert(
                        `Payment of ${paymentInfo.amount} USDC received successfully!`
                      );
                      setPaymentInfo({
                        beneficiaryPhone: "",
                        amount: "",
                        otp: "",
                      });
                      setOtpRequested(false);
                      setOtpData(null);
                    }
                  }}
                  onError={(error) => {
                    console.error("Payment error:", error);
                    setError(`Payment failed: ${error.message}`);
                  }}
                >
                  <div className="pt-2">
                    <TransactionButton
                      text="Process Payment"
                      disabled={!paymentInfo.otp}
                    />
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

      {/* Simplified Debug Log Section */}
      <details className="mt-4 border-t border-gray-200 pt-4">
        <summary className="text-sm font-medium text-gray-700 cursor-pointer">
          Debug Logs (last 10)
        </summary>
        <div className="mt-2 bg-gray-100 p-2 rounded text-xs font-mono overflow-auto max-h-60">
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs available</p>
          ) : (
            logs.slice(-10).map((log, idx) => (
              <div key={idx} className="pb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </details>
    </div>
  );
};

export default MerchantView;
