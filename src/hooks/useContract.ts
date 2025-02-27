// src/hooks/useContract.ts
import { useState, useEffect } from 'react';
import { getContract } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useContract = (address: string, abi: any) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [contract, setContract] = useState<any>(null);
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    if (!address || !abi || !publicClient) return;

    try {
      const contractInstance = getContract({
        address: address as `0x${string}`,
        abi,
        client: publicClient,
      });
      
      setContract(contractInstance);
    } catch (error) {
      console.error('Error initializing contract:', error);
      setContract(null);
    }
  }, [address, abi, publicClient, walletClient]);

  return contract;
};

export default useContract;