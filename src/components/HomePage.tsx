import React from "react";

type HomePageProps = {
  onSelectUserType: (type: "sponsor" | "merchant") => void;
};

const HomePage: React.FC<HomePageProps> = ({ onSelectUserType }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Welcome to ZepPay
        </h2>
        <p className="text-sm text-gray-600 max-w-2xl mx-auto">
          Choose your role to start secure, blockchain-powered remittances
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Sponsor Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-400 transition-all duration-200">
          <div className="p-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path
                    fillRule="evenodd"
                    d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="ml-2 text-lg font-semibold text-gray-900">
                Sponsor
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Send money to beneficiaries with control over how funds can be
              used.
            </p>
            <ul className="text-xs space-y-1 mb-3">
              <li className="flex items-start">
                <svg
                  className="h-4 w-4 text-blue-500 mr-1 mt-0.5"
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
                <span className="text-gray-600">
                  Add multiple beneficiaries
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-4 w-4 text-blue-500 mr-1 mt-0.5"
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
                <span className="text-gray-600">
                  Control spending categories
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-4 w-4 text-blue-500 mr-1 mt-0.5"
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
                <span className="text-gray-600">
                  Track where funds are spent
                </span>
              </li>
            </ul>
            <button
              onClick={() => onSelectUserType("sponsor")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 text-sm rounded-md flex items-center justify-center transition duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path
                  fillRule="evenodd"
                  d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                  clipRule="evenodd"
                />
              </svg>
              Continue as Sponsor
            </button>
          </div>
        </div>

        {/* Merchant Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-green-400 transition-all duration-200">
          <div className="p-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-green-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
              </div>
              <h3 className="ml-2 text-lg font-semibold text-gray-900">
                Merchant
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Accept payments from beneficiaries and grow your business.
            </p>
            <ul className="text-xs space-y-1 mb-3">
              <li className="flex items-start">
                <svg
                  className="h-4 w-4 text-green-500 mr-1 mt-0.5"
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
                <span className="text-gray-600">Accept digital payments</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-4 w-4 text-green-500 mr-1 mt-0.5"
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
                <span className="text-gray-600">Simple OTP verification</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-4 w-4 text-green-500 mr-1 mt-0.5"
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
                <span className="text-gray-600">
                  Fast settlement to your wallet
                </span>
              </li>
            </ul>
            <button
              onClick={() => onSelectUserType("merchant")}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 text-sm rounded-md flex items-center justify-center transition duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              Continue as Merchant
            </button>
          </div>
        </div>
      </div>

      {/* How it works section */}
      <div className="mt-4 bg-white rounded-lg shadow-sm p-3 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
          <svg
            className="h-4 w-4 mr-1 text-indigo-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          How ZepPay Works
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2">
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-1">
              <span className="text-indigo-600 font-semibold text-xs">1</span>
            </div>
            <h4 className="font-medium text-gray-900 text-xs mb-1">
              Connect Wallet
            </h4>
            <p className="text-xs text-gray-600">
              Securely connect your Coinbase wallet
            </p>
          </div>
          <div className="p-2">
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-1">
              <span className="text-indigo-600 font-semibold text-xs">2</span>
            </div>
            <h4 className="font-medium text-gray-900 text-xs mb-1">
              Choose Role
            </h4>
            <p className="text-xs text-gray-600">Select sender or receiver</p>
          </div>
          <div className="p-2">
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-1">
              <span className="text-indigo-600 font-semibold text-xs">3</span>
            </div>
            <h4 className="font-medium text-gray-900 text-xs mb-1">
              Start Transacting
            </h4>
            <p className="text-xs text-gray-600">
              Send or receive payments securely
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
