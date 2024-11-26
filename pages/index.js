import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";


export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [deposits, setDeposits] = useState([]); // State for deposits
  const [withdrawals, setWithdrawals] = useState([]); // State for withdrawals
  const [loading, setLoading] = useState(false); // Loading state for transactions
  const [showDeposits, setShowDeposits] = useState(false); // State to show/hide deposits
  const [showWithdrawals, setShowWithdrawals] = useState(false); // State to show/hide withdrawals

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // Once wallet is set, get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const balanceInWei = await atm.getBalance(); // Get balance as BigNumber
      const balanceInEth = ethers.utils.formatEther(balanceInWei); // Convert to Ether
      setBalance(balanceInEth); // Store as string
    }
  };

  const fetchRecords = async () => {
    if (atm) {
      setLoading(true);
      await getDeposits(); // Fetch deposit records
      await getWithdrawals(); // Fetch withdrawal records
      setLoading(false);
    }
  };

  const getDeposits = async () => {
    if (atm) {
      const depositRecords = await atm.getDeposits();
      const formattedDeposits = depositRecords.map(record => ({
        amount: ethers.utils.formatEther(record.amount),
        timestamp: record.timestamp,
      }));
      setDeposits(formattedDeposits);
    }
  };

  const getWithdrawals = async () => {
    if (atm) {
      const withdrawalRecords = await atm.getWithdrawals();
      const formattedWithdrawals = withdrawalRecords.map(record => ({
        amount: ethers.utils.formatEther(record.amount),
        timestamp: record.timestamp,
      }));
      setWithdrawals(formattedWithdrawals);
    }
  };

  const deposit = async () => {
    if (atm && !loading) {
      setLoading(true);
      try {
        const depositAmount = ethers.utils.parseEther("1");  // Convert 1 ETH to wei
        let tx = await atm.deposit(depositAmount);
        await tx.wait();
        getBalance();
        fetchRecords(); // Update records after deposit
        triggerConfetti(); // Trigger confetti after deposit
      } catch (error) {
        console.error("Error during deposit:", error);
        alert("Transaction failed");
      }
      setLoading(false);
    }
  };

  const withdraw = async () => {
    if (atm && !loading) {
      setLoading(true);
      try {
        const withdrawAmount = ethers.utils.parseEther("1");  // Convert 1 ETH to wei
        let tx = await atm.withdraw(withdrawAmount);
        await tx.wait();
        getBalance();
        fetchRecords(); // Update records after withdrawal
        triggerConfetti(); // Trigger confetti after withdrawal
      } catch (error) {
        console.error("Error during withdrawal:", error);
        alert("Transaction failed");
      }
      setLoading(false);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100, // Number of confetti pieces
      spread: 70,         // Spread angle of the confetti
      origin: { y: 0.6 }, // Position of the confetti (60% from the top)
    });
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    if (!account) {
      return (
        <button onClick={connectAccount} style={styles.connectButton}>Please connect your Metamask wallet</button>
      );
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div style={styles.userInfoContainer}>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance} ETH</p>
        <div style={styles.actionButtonsContainer}>
          <button onClick={deposit} disabled={loading} style={styles.actionButton}>Deposit 1 ETH</button>
          <button onClick={withdraw} disabled={loading} style={styles.actionButton}>Withdraw 1 ETH</button>
        </div>

        {/* Button to toggle deposit history visibility */}
        <button onClick={() => setShowDeposits(!showDeposits)} style={styles.toggleButton}>
          {showDeposits ? "Hide Deposit History" : "Show Deposit History"}
        </button>

        {/* Deposit History */}
        {showDeposits && (
          <div style={styles.historyContainer}>
            <h3>Deposit History</h3>
            {deposits.length > 0 ? (
              <ul>
                {deposits.map((deposit, index) => (
                  <li key={index}>
                    Amount: {deposit.amount} ETH at{" "}
                    {new Date(deposit.timestamp * 1000).toLocaleString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No deposits yet.</p>
            )}
            <button onClick={deleteDeposits} style={styles.deleteButton}>Delete Deposit History</button>
          </div>
        )}

        {/* Button to toggle withdrawal history visibility */}
        <button onClick={() => setShowWithdrawals(!showWithdrawals)} style={styles.toggleButton}>
          {showWithdrawals ? "Hide Withdrawal History" : "Show Withdrawal History"}
        </button>

        {/* Withdrawal History */}
        {showWithdrawals && (
          <div style={styles.historyContainer}>
            <h3>Withdrawal History</h3>
            {withdrawals.length > 0 ? (
              <ul>
                {withdrawals.map((withdrawal, index) => (
                  <li key={index}>
                    Amount: {withdrawal.amount} ETH at{" "}
                    {new Date(withdrawal.timestamp * 1000).toLocaleString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No withdrawals yet.</p>
            )}
            <button onClick={deleteWithdrawals} style={styles.deleteButton}>Delete Withdrawal History</button>
          </div>
        )}
      </div>
    );
  };

  const deleteDeposits = () => {
    setDeposits([]); // Clear deposit history
  };

  const deleteWithdrawals = () => {
    setWithdrawals([]); // Clear withdrawal history
  };

  useEffect(() => {
    getWallet();
  }, []);

  useEffect(() => {
    if (atm) fetchRecords(); // Automatically fetch records when contract is initialized
  }, [atm]);

  return (
    <main>
      <header>
        <h1>FEU TECH</h1>
        <h1>Ethereum Wallet</h1>
      </header>
      {initUser()}
      <style jsx>{`
        /* Full page background color */
        body {
          margin: 0;
          height: 100vh; /* Full height of the viewport */
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #ffc20e; /* Yellow background */
          color: black; /* Text color */
          font-family: Arial, sans-serif; /* Clean font for text */
        }

        /* Centered 4:3 aspect ratio container */
        main {
          width: 100vw; /* Full width of the screen */
          height: 100vh; /* Full height of the screen */
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: #ffc20e; /* Yellow background */
          border-radius: 0px; /* No rounded corners */
          box-shadow: none; /* No shadow for full screen look */
          padding: 0; /* No padding for full screen */
        }

        /* Ensure header text is centered */
        header h1 {
          margin: 10px 0;
          font-size: 2.5rem;
          text-align: center;
        }
      `}</style>
    </main>
  );
}

// Style definitions
const styles = {
  actionButton: {
    backgroundColor: '#009900',  // FEU Tech Green
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    cursor: 'pointer',
    margin: '10px',
    borderRadius: '5px',
  },
  connectButton: {
    backgroundColor: '#ffc20e', // FEU Tech Yellow
    color: 'black',
    padding: '10px 20px',
    border: 'none',
    cursor: 'pointer',
    margin: '10px',
    borderRadius: '5px',
  },
  toggleButton: {
    backgroundColor: '#818181', // Gray
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    cursor: 'pointer',
    margin: '10px',
    borderRadius: '5px',
  },
  deleteButton: {
    backgroundColor: '#ff4d4d', // Red button for delete
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    cursor: 'pointer',
    marginTop: '10px',
    borderRadius: '5px',
  },
  userInfoContainer: {
    textAlign: 'center', // Center account and balance
  },
  actionButtonsContainer: {
    display: 'flex',
    justifyContent: 'center', // Center deposit/withdraw buttons
    flexDirection: 'column',
    gap: '10px',
  },
  historyContainer: {
    textAlign: 'center', // Center history content
    marginTop: '20px',
  }
};
