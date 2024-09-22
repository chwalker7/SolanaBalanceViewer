import React, { useState } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';

const NETWORKS = [
  { name: 'mainnet', url: 'https://solana-mainnet.rpc.extrnode.com' },
  { name: 'testnet', url: clusterApiUrl('testnet') },
  { name: 'devnet', url: clusterApiUrl('devnet') }
];

const WalletConnection = ({ setWalletConnected, setWalletInfo }) => {
  const [connecting, setConnecting] = useState(false);

  const getNetworkBalance = async (connection, publicKey) => {
    try {
      const balance = await connection.getBalance(new PublicKey(publicKey));
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error(`Error fetching balance for ${connection.rpcEndpoint}:`, error);
      return null;
    }
  };

  const connectWallet = async () => {
    if (typeof window.solana !== 'undefined' && window.solana.isPhantom) {
      try {
        setConnecting(true);
        const response = await window.solana.connect();
        const publicKey = response.publicKey.toString();

        const networkBalances = await Promise.all(
          NETWORKS.map(async ({ name, url }) => {
            const connection = new Connection(url);
            const balance = await getNetworkBalance(connection, publicKey);
            return { network: name, balance: balance !== null ? balance.toFixed(4) : 'Error' };
          })
        );

        // Use mainnet connection for token and NFT counts
        const mainnetConnection = new Connection(NETWORKS[0].url);
        let nftCount = 0;
        let tokenCount = 0;

        try {
          const tokenAccounts = await mainnetConnection.getParsedTokenAccountsByOwner(new PublicKey(publicKey), {
            programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
          });

          nftCount = tokenAccounts.value.filter(account => 
            account.account.data.parsed.info.tokenAmount.amount === '1' && 
            account.account.data.parsed.info.tokenAmount.decimals === 0
          ).length;

          tokenCount = tokenAccounts.value.length - nftCount;
        } catch (error) {
          console.error('Error fetching token accounts:', error);
          nftCount = 'Error';
          tokenCount = 'Error';
        }

        setWalletInfo({
          address: publicKey,
          networkBalances,
          nftCount,
          tokenCount,
        });

        setWalletConnected(true);
      } catch (err) {
        console.error('Error connecting wallet:', err);
        alert('Failed to connect wallet. Please try again.');
      } finally {
        setConnecting(false);
      }
    } else {
      alert('Phantom wallet not found. Please install the Phantom wallet extension.');
    }
  };

  return (
    <button onClick={connectWallet} disabled={connecting}>
      {connecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
};

export default WalletConnection;