import React from "react";
import "./HomePage.css";
type HomePageProps = {
  onSelectUserType: (type: "sponsor" | "merchant") => void;
};

const HomePage: React.FC<HomePageProps> = ({ onSelectUserType }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4 text-center">
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          Select your role
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Sponsor Card */}
        <button
          className="bg-white rounded-md shadow-sm border border-gray-200 hover:border-blue-400 hover:shadow transition-all duration-200 text-left p-0 overflow-hidden"
          onClick={() => onSelectUserType("sponsor")}
        >
          <div className="p-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <svg
                  className="h-4 w-4 text-blue-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-gray-900">Sponsor</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Send money to beneficiaries with spending controls
            </p>
            <ul className="text-xs space-y-1 text-gray-600">
              <li className="flex items-start">
                <svg
                  className="h-3 w-3 text-blue-500 mr-1 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Add multiple beneficiaries</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-3 w-3 text-blue-500 mr-1 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Control spending categories</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-3 w-3 text-blue-500 mr-1 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Track where funds are spent</span>
              </li>
            </ul>
            <div className="mt-3 pt-3 border-t border-gray-100 text-right">
              <span className="text-xs text-blue-600 font-medium">
                Continue as Sponsor →
              </span>
            </div>
          </div>
        </button>

        {/* Merchant Card */}
        <button
          className="bg-white rounded-md shadow-sm border border-gray-200 hover:border-green-400 hover:shadow transition-all duration-200 text-left p-0 overflow-hidden"
          onClick={() => onSelectUserType("merchant")}
        >
          <div className="p-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                <svg
                  className="h-4 w-4 text-green-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-gray-900">Merchant</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Accept payments from beneficiaries
            </p>
            <ul className="text-xs space-y-1 text-gray-600">
              <li className="flex items-start">
                <svg
                  className="h-3 w-3 text-green-500 mr-1 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Accept digital payments</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-3 w-3 text-green-500 mr-1 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Simple OTP verification</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-3 w-3 text-green-500 mr-1 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Fast settlement to wallet</span>
              </li>
            </ul>
            <div className="mt-3 pt-3 border-t border-gray-100 text-right">
              <span className="text-xs text-green-600 font-medium">
                Continue as Merchant →
              </span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default HomePage;
