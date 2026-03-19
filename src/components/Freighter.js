import { useState } from "react";
import { isConnected, setAllowed, getAddress, signTransaction } from "@stellar/freighter-api";
import * as StellarSdk from "@stellar/stellar-sdk";

// ====== WALLET FUNCTIONS ======

export const checkConnection = async () => {
  const result = await isConnected();
  if (result.error || !result.isConnected) {
    throw new Error("Freighter wallet not installed or unreachable. Ensure the extension is enabled.");
  }

  const allowedResult = await setAllowed();
  if (allowedResult.error || !allowedResult.isAllowed) {
    throw new Error(typeof allowedResult.error === "string" ? allowedResult.error : "Connection request rejected.");
  }

  return true;
};

export const retrievePublicKey = async () => {
  const { address, error } = await getAddress();
  if (error) {
    throw new Error(error);
  }
  return address || "";
};

export const getBalance = async () => {
  return "100.00"; // Mocked balance for now
};

export const sendXLM = async (senderPublicKey, recipient, amount) => {
  const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");

  // 1. Load the sender's account to get the current sequence number
  let account;
  try {
    account = await server.loadAccount(senderPublicKey);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      // Automatic Friendbot funding for testnet if account doesn't exist
      await fetch(`https://friendbot.stellar.org?addr=${senderPublicKey}`);
      account = await server.loadAccount(senderPublicKey);
    } else {
      throw err;
    }
  }

  // 2. Build the transaction
  const txBuilder = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  });

  // Check if destination exists
  let destExists = true;
  try {
    await server.loadAccount(recipient);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      destExists = false;
    }
  }

  if (destExists) {
    txBuilder.addOperation(
      StellarSdk.Operation.payment({
        destination: recipient,
        asset: StellarSdk.Asset.native(),
        amount: amount.toString(),
      })
    );
  } else {
    txBuilder.addOperation(
      StellarSdk.Operation.createAccount({
        destination: recipient,
        startingBalance: amount.toString(),
      })
    );
  }

  // set the timeout
  const tx = txBuilder.setTimeout(30).build();

  // 3. Sign the transaction using Freighter
  const signatureResult = await signTransaction(tx.toXDR(), {
    network: "TESTNET",
    networkPassphrase: StellarSdk.Networks.TESTNET,
  });

  if (signatureResult.error) {
    throw new Error(typeof signatureResult.error === 'string' ? signatureResult.error : signatureResult.error.message || "User declined the transaction");
  }

  // 4. Submit the transaction to the network
  const signedTx = StellarSdk.TransactionBuilder.fromXDR(
    signatureResult.signedTxXdr,
    StellarSdk.Networks.TESTNET
  );

  const result = await server.submitTransaction(signedTx);
  return result;
};

// ====== UI COMPONENT ======

function Freighter() {
  const [connected, setConnected] = useState(false);
  const [balance, setBalance] = useState("0.00");
  const [publicKey, setPublicKey] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const connectWallet = async () => {
    try {
      await checkConnection();
      const pk = await retrievePublicKey();
      setPublicKey(pk);

      const bal = await getBalance();
      setBalance(bal);
      setConnected(true);
    } catch (error) {
      console.error("Connection Error:", error);
      const msg = typeof error === "string" ? error : (error.message || "Unable to connect to Freighter.");
      alert(msg);
    }
  };

  const sendTransaction = async () => {
    if (!recipient || !amount) {
      alert("Please provide both recipient and amount.");
      return;
    }
    try {
      await sendXLM(publicKey, recipient, amount);
      alert("Transaction Sent Successfully 🚀");
    } catch (error) {
      console.error("Transaction Error:", error);
      let errorMessage = "Transaction failed!";

      if (typeof error === "string") {
        errorMessage = error;
      } else if (error.response?.data?.extras?.result_codes) {
        // Horizon error formats
        const codes = error.response.data.extras.result_codes;
        errorMessage = `Transaction Failed: ${codes.transaction} ${codes.operations ? ' - Ops: ' + codes.operations.join(', ') : ''}`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    }
  };

  return (
    <div className="glass-card">
      {!connected ? (
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center p-3 animate-float">
              <svg className="w-full h-full text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">
                Connect Wallet
              </h2>
              <p className="text-slate-400 font-medium">
                Link your Freighter extension to interact with the Stellar testnet.
              </p>
            </div>
          </div>

          <button
            onClick={connectWallet}
            className="btn-primary w-full shadow-blue-500/40"
          >
            Connect Freighter
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          <div className="text-center space-y-2 p-6 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full"></div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Balance</h2>
            <p className="text-5xl font-extrabold text-white tracking-tighter">
              {balance} <span className="text-2xl text-slate-400 font-medium tracking-normal">XLM</span>
            </p>
            <div className="inline-flex items-center space-x-2 bg-slate-900/50 border border-slate-700/50 rounded-full px-4 py-1.5 mt-4 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></div>
              <p className="text-xs text-slate-300 font-mono tracking-wider">
                {publicKey.slice(0, 6)}...{publicKey.slice(-4)}
              </p>
            </div>
          </div>

          <div className="space-y-5 pt-2">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 tracking-wide">Recipient Address</label>
                <input
                  type="text"
                  placeholder="G..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="input-field font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 tracking-wide">Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input-field pr-16 text-lg font-medium"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    XLM
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={sendTransaction}
              className="btn-primary w-full mt-6 shadow-indigo-500/40"
            >
              Send Tokens
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Freighter;