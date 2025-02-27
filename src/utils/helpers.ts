import { ethers } from 'ethers';

// Format an address to display format (0x1234...5678)
export const formatAddress = (address: string | undefined): string => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Format USDC amount (6 decimals)
export const formatUSDC = (amount: string | number): string => {
  const value = typeof amount === 'string' ? amount : amount.toString();
  return ethers.utils.formatUnits(value, 6);
};

// Parse USDC amount to contract format
export const parseUSDC = (amount: string): string => {
  return ethers.utils.parseUnits(amount, 6).toString();
};

// Generate a mock OTP for demo purposes
export const generateMockOtp = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Validate phone number format
export const isValidPhoneNumber = (phone: string): boolean => {
  // Basic validation - should be improved in a real app
  return /^\+[0-9]{10,15}$/.test(phone);
};

// Check if a value is a valid number
export const isValidAmount = (amount: string): boolean => {
  if (!amount) return false;
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};