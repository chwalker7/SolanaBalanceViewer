import React, { useState } from 'react';
import './App.css';
import WalletConnection from './components/WalletConnection';
import StarryBackground from './components/StarryBackground';

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletInfo, setWalletInfo] = useState(null);

  return (
    <div className="App">
      <StarryBackground />
      <div className="content">
        <h1>Solana Balance Viewer</h1>
        <WalletConnection
          setWalletConnected={setWalletConnected}
          setWalletInfo={setWalletInfo}
        />
        {walletConnected && walletInfo && (
          <div className="wallet-info">
            <h2>Wallet Information</h2>
            <p>Address: {walletInfo.address}</p>
            <h3>SOL Balances:</h3>
            <ul>
              {walletInfo.networkBalances.map(({ network, balance }) => (
                <li key={network}>
                  {network}: {balance === 'Error' ? 'Unable to fetch balance' : `${balance} SOL`}
                </li>
              ))}
            </ul>
            <p>NFTs Held: {walletInfo.nftCount === 'Error' ? 'Unable to fetch NFT count' : walletInfo.nftCount}</p>
            <p>Tokens Held: {walletInfo.tokenCount === 'Error' ? 'Unable to fetch token count' : walletInfo.tokenCount}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
