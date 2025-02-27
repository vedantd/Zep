import { useEffect, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { ethers } from 'ethers';

export const useWallet = () => {
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({
    address,
  });
  const [formattedBalance, setFormattedBalance] = useState<string>('0');

  useEffect(() => {
    if (balanceData) {
      setFormattedBalance(ethers.utils.formatEther(balanceData.value));
    }
  }, [balanceData]);

  return {
    address,
    isConnected,
    balance: formattedBalance,
    balanceFormatted: balanceData ? `${formattedBalance} ${balanceData.symbol}` : '0 ETH',
  };
};

export default useWallet;