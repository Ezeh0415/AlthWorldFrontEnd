import React, { useEffect, useState } from "react";
import {
  CopyOutlined,
  CheckOutlined,
  ArrowLeftOutlined,
  SecurityScanOutlined,
  LoadingOutlined,
  WalletOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  BankOutlined,
  CreditCardOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import "../styles/Withdraw.css";
import { Link } from "react-router-dom";
import ApiService from "../Commponets/ApiService";
import ApiServices from "../Commponets/ApiService";

const Withdraw = () => {
  const [stage, setStage] = useState("input"); // 'input', 'wallet', 'confirm', 'success'
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [walletData, setWalletData] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [newWalletData, setNewWalletData] = useState({
    name: "",
    address: "",
    network: "BTC",
  });
  const [userWallets, setUserWallets] = useState([]); // User's saved wallets
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [copied, setCopied] = useState(false);
  const [userBalance, setUserBalance] = useState({
    total: 0,
    available: 0,
    invested: 0,
    pending: 0,
  });
  const [editingWalletId, setEditingWalletId] = useState(null);

  // Format amount input
  const formatAmount = (value) => {
    return value.replace(/[^0-9.]/g, "");
  };

  // Fetch wallet types and user wallets
  useEffect(() => {
    fetchWalletTypes();
    fetchUserData();
    fetchUserWallets();
  }, []);

  const fetchWalletTypes = async () => {
    try {
      setIsFetching(true);
      const data = await ApiService.getWallets();

      if (data.data && Array.isArray(data.data)) {
        setWalletData(data.data);
        console.log(data.data);
      } else {
        setWalletData([]);
      }
    } catch (err) {
      console.error("Error fetching wallet types:", err);
      setWalletData([]);
      setError("Failed to load wallet types. Please try again.");
    } finally {
      setIsFetching(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const data = await ApiService.getDashboardData();

      if (data?.wallet) {
        const wallet = data.wallet;
        const availableBalance = wallet.balance || 0;
        const investedBalance = wallet.invBalance || 0;
        const pendingAmount = Math.abs(wallet.pending) || 0;
        const totalBalance = availableBalance + investedBalance + pendingAmount;

        setUserBalance({
          total: totalBalance,
          available: availableBalance,
          invested: investedBalance,
          pending: pendingAmount,
        });
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load balance information");
    }
  };

  const fetchUserWallets = async () => {
    try {
      // This would be a new API endpoint for user's saved wallets
      // For now, we'll check localStorage
      const savedWallets = JSON.parse(
        localStorage.getItem("userWallets") || "[]",
      );
      setUserWallets(savedWallets);
    } catch (err) {
      console.error("Error fetching user wallets:", err);
      setUserWallets([]);
    }
  };

  // Save user wallets to localStorage (temporary solution)
  const saveUserWallets = (wallets) => {
    localStorage.setItem("userWallets", JSON.stringify(wallets));
    setUserWallets(wallets);
  };

  // Format currency
  const formatCurrency = (amount) => {
    const amountInDollars = amount / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amountInDollars);
  };

  // Validate amount
  const validateAmount = () => {
    if (!amount) return "Please enter an amount";
    const numValue = parseFloat(amount);
    if (isNaN(numValue)) return "Please enter a valid amount";
    if (numValue <= 0) return "Amount must be greater than 0";
    if (numValue < 10) return "Minimum withdrawal is $10";

    const availableInDollars = userBalance.available / 100;
    if (numValue > availableInDollars) {
      return `Insufficient available balance. Available: ${formatCurrency(userBalance.available)}`;
    }
    return "";
  };

  // Get wallet options from wallet data
  const getWalletOptions = () => {
    if (!walletData || walletData.length === 0) return [];

    // Create unique wallet types
    const uniqueWallets = {};
    walletData.forEach((wallet) => {
      const network =
        wallet.network || wallet.type || wallet.cryptoName || "unknown";
      const walletName = getNetworkDisplayName(wallet);

      if (!uniqueWallets[network]) {
        uniqueWallets[network] = {
          id: network,
          name: walletName,
          icon: getNetworkIcon(network),
          color: getNetworkColor(network),
          minAmount: wallet.minAmount || 10,
        };
      }
    });

    return Object.values(uniqueWallets);
  };

  // Get network icon based on network
  const getNetworkIcon = (network) => {
    const networkLower = (network || "").toLowerCase();

    if (networkLower.includes("bitcoin") || networkLower.includes("btc"))
      return "₿";
    if (networkLower.includes("ethereum") || networkLower.includes("eth"))
      return "Ξ";
    if (networkLower.includes("usdt")) return "₮";
    if (networkLower.includes("bnb")) return "ⓑ";
    if (networkLower.includes("solana") || networkLower.includes("sol"))
      return "◎";
    if (networkLower.includes("ripple") || networkLower.includes("xrp"))
      return "✕";
    if (networkLower.includes("litecoin") || networkLower.includes("ltc"))
      return "Ł";
    if (networkLower.includes("cardano") || networkLower.includes("ada"))
      return "₳";
    if (networkLower.includes("doge")) return "Ð";
    if (networkLower.includes("bank")) return <BankOutlined />;
    if (networkLower.includes("card")) return <CreditCardOutlined />;

    return "💳";
  };

  // Get network color
  const getNetworkColor = (network) => {
    const networkLower = (network || "").toLowerCase();

    if (networkLower.includes("bitcoin") || networkLower.includes("btc"))
      return "#F7931A";
    if (networkLower.includes("ethereum") || networkLower.includes("eth"))
      return "#627EEA";
    if (networkLower.includes("usdt")) return "#26A17B";
    if (networkLower.includes("bnb")) return "#F0B90B";
    if (networkLower.includes("solana") || networkLower.includes("sol"))
      return "#00FFA3";
    if (networkLower.includes("ripple") || networkLower.includes("xrp"))
      return "#23292F";
    if (networkLower.includes("litecoin") || networkLower.includes("ltc"))
      return "#BFBBBB";
    if (networkLower.includes("cardano") || networkLower.includes("ada"))
      return "#0033AD";
    if (networkLower.includes("doge")) return "#C2A633";
    if (networkLower.includes("bank")) return "#3B82F6";
    if (networkLower.includes("card")) return "#8B5CF6";

    return "#6B7280";
  };

  // Get network display name
  const getNetworkDisplayName = (wallet) => {
    const network = wallet.network || wallet.type || wallet.cryptoName || "";

    if (!network) return "Unknown Network";

    const networkLower = network.toLowerCase();

    if (networkLower.includes("bitcoin") || networkLower.includes("btc")) {
      return "Bitcoin (BTC)";
    }
    if (networkLower.includes("ethereum") || networkLower.includes("eth")) {
      return "Ethereum (ETH)";
    }
    if (
      networkLower.includes("usdt_erc20") ||
      (networkLower.includes("usdt") && networkLower.includes("erc20"))
    ) {
      return "USDT (ERC20)";
    }
    if (
      networkLower.includes("usdt_trc20") ||
      (networkLower.includes("usdt") && networkLower.includes("trc20"))
    ) {
      return "USDT (TRC20)";
    }
    if (networkLower.includes("bnb")) {
      return "Binance Coin (BNB)";
    }
    if (networkLower.includes("solana") || networkLower.includes("sol")) {
      return "Solana (SOL)";
    }

    return network.toUpperCase();
  };

  // Handle continue to wallet selection
  const handleContinue = () => {
    const validationError = validateAmount();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Check if user has saved wallets
    if (userWallets.length === 0) {
      setError("No withdrawal wallets found. Please add a wallet first.");
      return;
    }

    setStage("wallet");
    setError("");
  };

  // Handle add new wallet
  const handleAddWallet = () => {
    if (!newWalletData.name.trim()) {
      setError("Please enter a wallet name");
      return;
    }
    if (!newWalletData.address.trim()) {
      setError("Please enter a wallet address");
      return;
    }
    if (!newWalletData.network) {
      setError("Please select a network");
      return;
    }

    try {
      if (editingWalletId) {
        // Update existing wallet
        const updatedWallets = userWallets.map((wallet) =>
          wallet.id === editingWalletId
            ? { ...newWalletData, id: editingWalletId }
            : wallet,
        );
        saveUserWallets(updatedWallets);
        setSuccessMessage("Wallet updated successfully!");
        setEditingWalletId(null);
      } else {
        // Add new wallet
        const newWallet = {
          ...newWalletData,
          id: Date.now().toString(), // Simple ID generation
          createdAt: new Date().toISOString(),
        };
        const updatedWallets = [...userWallets, newWallet];
        saveUserWallets(updatedWallets);
        setSuccessMessage("Wallet added successfully!");
      }

      setNewWalletData({
        name: "",
        address: "",
        network: "BTC",
      });
      setShowAddWallet(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to save wallet. Please try again.");
    }
  };

  // Handle edit wallet
  const handleEditWallet = (wallet) => {
    setNewWalletData({
      name: wallet.name,
      address: wallet.address,
      network: wallet.network,
    });
    setEditingWalletId(wallet.id);
    setShowAddWallet(true);
  };

  // Handle delete wallet
  const handleDeleteWallet = (walletId) => {
    if (!window.confirm("Are you sure you want to delete this wallet?")) return;

    const updatedWallets = userWallets.filter(
      (wallet) => wallet.id !== walletId,
    );
    saveUserWallets(updatedWallets);
    setSuccessMessage("Wallet deleted successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Handle wallet selection
  const handleSelectWallet = (wallet) => {
    setSelectedWallet(wallet);
    setStage("confirm");
  };

  // Handle withdraw confirmation
  const handleConfirmWithdraw = async () => {
    if (!selectedWallet) {
      setError("Please select a wallet");
      return;
    }

    try {
      setLoading(true);

      //   const amountInCents = parseFloat(amount);

      // const withdrawDatas = {
      //   amount: amount,
      //   currency: "USD",
      //   walletAddress: selectedWallet.address,
      //   network: selectedWallet.network,
      //   withdrawalMethod: "crypto",
      // };

      const withdrawData = {
        amount: amount,
        paymentType: selectedWallet.network,
        walletAddress: selectedWallet.address,
      };

      const response = await ApiServices.Withdraw(withdrawData);

      if (response.success || response._id) {
        setStage("success");
        await fetchUserData(); // Refresh balance
        setSuccessMessage("Withdrawal request submitted successfully!");
      } else {
        setError(response.message || "Withdrawal request failed");
      }
    } catch (err) {
      console.error("Withdrawal error:", err);
      setError(err.message || "An error occurred during withdrawal");
    } finally {
      setLoading(false);
    }
  };

  // Handle copy to clipboard
  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle back navigation
  const handleBack = () => {
    if (stage === "wallet") {
      setStage("input");
      setSelectedWallet(null);
    } else if (stage === "confirm") {
      setStage("wallet");
    } else if (stage === "success") {
      setStage("input");
      setAmount("");
      setSelectedWallet(null);
      setSuccessMessage("");
    }
  };

  // Calculate fee and net amount
  const calculateWithdrawalDetails = () => {
    const amountNum = parseFloat(amount) || 0;
    const feePercentage = 0.0005; // 0.05% fee (changed from 2%)
    const minFee = 5; // Minimum $5 fee
    const maxFee = 1000; // Maximum $50 fee

    // Calculate fee as 0.05% of the withdrawal amount
    let fee = amountNum * feePercentage;

    // Apply minimum and maximum fee limits
    fee = Math.max(minFee, Math.min(fee, maxFee));

    // Calculate net amount after deducting fee
    const netAmount = amountNum - fee;

    return { fee, netAmount };
  };

  // Get wallet display name
  const getWalletDisplayName = (wallet) => {
    return (
      wallet.name ||
      `${getNetworkDisplayName({ network: wallet.network })} Wallet`
    );
  };

  // Wallet card component
  const WalletCard = ({ wallet }) => {
    const networkIcon = getNetworkIcon(wallet.network);
    const networkColor = getNetworkColor(wallet.network);
    const displayName = getWalletDisplayName(wallet);
    const networkName = getNetworkDisplayName({ network: wallet.network });

    return (
      <div className="wallet-card" onClick={() => handleSelectWallet(wallet)}>
        <div className="wallet-card-header">
          <div
            className="wallet-icon"
            style={{
              backgroundColor: `${networkColor}20`,
              color: networkColor,
            }}
          >
            {networkIcon}
          </div>
          <div className="wallet-info">
            <h4 className="wallet-name">{displayName}</h4>
            <p className="wallet-network">{networkName}</p>
          </div>
          <div className="wallet-actions">
            <button
              className="wallet-action-btn edit"
              onClick={(e) => {
                e.stopPropagation();
                handleEditWallet(wallet);
              }}
              title="Edit wallet"
            >
              <EditOutlined />
            </button>
            <button
              className="wallet-action-btn delete"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteWallet(wallet.id);
              }}
              title="Delete wallet"
            >
              <DeleteOutlined />
            </button>
          </div>
        </div>

        <div className="wallet-card-body">
          <div className="wallet-address-container">
            <span className="wallet-address-label">Your Address:</span>
            <div className="wallet-address">
              <code>{wallet.address.substring(0, 24)}...</code>
              <button
                className="copy-address-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(wallet.address);
                }}
                title="Copy address"
              >
                <CopyOutlined />
              </button>
            </div>
          </div>
        </div>

        <div className="wallet-card-footer">
          <button
            className="wallet-select-btn"
            onClick={() => handleSelectWallet(wallet)}
          >
            Use This Wallet
          </button>
        </div>
      </div>
    );
  };

  // Wallet options for adding new wallet
  const walletOptions = getWalletOptions();

  return (
    <div className="withdraw-container">
      {/* Header */}
      <div className="withdraw-header">
        <Link to={"/"} className="back-button" onClick={handleBack}>
          <ArrowLeftOutlined />
          Back
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <ExclamationCircleOutlined />
          <span>{error}</span>
          <button onClick={() => setError("")} className="error-close">
            ×
          </button>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="success-message">
          <CheckOutlined />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Loading State */}
      {isFetching && walletData.length === 0 && (
        <div className="loading-container">
          <LoadingOutlined className="loading-spinner" />
          <p>Loading wallet options...</p>
        </div>
      )}

      {/* Add Wallet Modal */}
      {showAddWallet && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingWalletId ? "Edit Wallet" : "Add New Wallet"}</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowAddWallet(false);
                  setEditingWalletId(null);
                  setNewWalletData({
                    name: "",
                    address: "",
                    network: "BTC",
                  });
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Wallet Name</label>
                <input
                  type="text"
                  value={newWalletData.name}
                  onChange={(e) =>
                    setNewWalletData({ ...newWalletData, name: e.target.value })
                  }
                  placeholder="e.g., My Bitcoin Wallet, Main Ethereum"
                  className="form-input"
                />
                <small>Give your wallet a recognizable name</small>
              </div>

              <div className="form-group">
                <label>Select Network</label>
                <div className="network-options">
                  {walletOptions.map((option) => (
                    <div
                      key={option.id}
                      className={`network-option ${
                        newWalletData.network === option.id ? "selected" : ""
                      }`}
                      onClick={() =>
                        setNewWalletData({
                          ...newWalletData,
                          network: option.id,
                        })
                      }
                      style={{
                        borderColor:
                          newWalletData.network === option.id
                            ? option.color
                            : "#e2e8f0",
                        backgroundColor:
                          newWalletData.network === option.id
                            ? `${option.color}10`
                            : "white",
                      }}
                    >
                      <div
                        className="network-icon"
                        style={{ color: option.color }}
                      >
                        {option.icon}
                      </div>
                      <span className="network-name">{option.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Wallet Address</label>
                <textarea
                  value={newWalletData.address}
                  onChange={(e) =>
                    setNewWalletData({
                      ...newWalletData,
                      address: e.target.value,
                    })
                  }
                  placeholder="Paste your wallet address here"
                  className="form-textarea"
                  rows="3"
                />
                <small>
                  Make sure the address is correct for the selected network
                </small>
              </div>

              <div className="modal-actions">
                <button
                  className="btn-outline"
                  onClick={() => {
                    setShowAddWallet(false);
                    setEditingWalletId(null);
                    setNewWalletData({
                      name: "",
                      address: "",
                      network: "BTC",
                    });
                  }}
                >
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleAddWallet}>
                  <SaveOutlined />
                  {editingWalletId ? "Update Wallet" : "Save Wallet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input Stage */}
      {!isFetching && stage === "input" && (
        <div className="withdraw-card">
          {/* Balance Overview */}
          <div className="balance-section">
            <h2 className="section-title">
              <WalletOutlined className="section-icon" />
              Your Balance
            </h2>
            <div className="balance-display">
              <div className="balance-total">
                <span className="balance-label">Total Balance:</span>
                <span className="balance-amount">
                  {formatCurrency(userBalance.total)}
                </span>
              </div>
              <div className="balance-details">
                <div className="balance-detail">
                  <span className="detail-label">Available:</span>
                  <span className="detail-amount available">
                    {formatCurrency(userBalance.available)}
                  </span>
                </div>
                <div className="balance-detail">
                  <span className="detail-label">Invested:</span>
                  <span className="detail-amount invested">
                    {formatCurrency(userBalance.invested)}
                  </span>
                </div>
                {userBalance.pending > 0 && (
                  <div className="balance-detail">
                    <span className="detail-label">Pending:</span>
                    <span className="detail-amount pending">
                      {formatCurrency(userBalance.pending)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="amount-section">
            <h2 className="section-title">
              <DollarOutlined className="section-icon" />
              Withdrawal Amount
            </h2>
            <div className="amount-input-container">
              <span className="currency-symbol">$</span>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(formatAmount(e.target.value))}
                placeholder="0.00"
                className="amount-input"
              />
            </div>
            <div className="amount-hints">
              <span className="amount-min">Min: $10</span>
              <button
                className="btn-text"
                onClick={() =>
                  setAmount((userBalance.available / 100).toString())
                }
              >
                Withdraw All
              </button>
            </div>
          </div>

          {/* Continue Button */}
          <button
            className="continue-button"
            onClick={handleContinue}
            disabled={loading || !amount || userWallets.length === 0}
          >
            {loading ? (
              <>
                <LoadingOutlined className="loading-icon" />
                Processing...
              </>
            ) : (
              "Continue to Withdraw"
            )}
          </button>

          {/* Manage Wallets Section */}
          <div className="manage-wallets-section">
            <div className="section-header">
              <h3>Your Saved Wallets</h3>
              <button
                className="btn-text"
                onClick={() => setShowAddWallet(true)}
              >
                <PlusOutlined />
                Add New Wallet
              </button>
            </div>

            {userWallets.length > 0 ? (
              <div className="wallets-preview">
                {userWallets.slice(0, 2).map((wallet) => (
                  <div key={wallet.id} className="wallet-preview">
                    <div
                      className="wallet-preview-icon"
                      style={{
                        backgroundColor: `${getNetworkColor(wallet.network)}20`,
                        color: getNetworkColor(wallet.network),
                      }}
                    >
                      {getNetworkIcon(wallet.network)}
                    </div>
                    <div className="wallet-preview-info">
                      <span className="wallet-preview-name">{wallet.name}</span>
                      <span className="wallet-preview-address">
                        {wallet.address.substring(0, 12)}...
                      </span>
                    </div>
                  </div>
                ))}
                {userWallets.length > 2 && (
                  <div className="more-wallets">
                    +{userWallets.length - 2} more wallets
                  </div>
                )}
              </div>
            ) : (
              <div className="no-wallets-preview">
                <WalletOutlined />
                <p>No wallets added yet</p>
                <button
                  className="btn-primary small"
                  onClick={() => setShowAddWallet(true)}
                >
                  <PlusOutlined />
                  Add Your First Wallet
                </button>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="info-box">
            <SecurityScanOutlined className="info-icon" />
            <div className="info-content">
              <p>• Withdrawals are processed within 24-48 hours</p>
              <p>• Minimum withdrawal amount is $10</p>
              <p>• Transaction fees apply (2% or $5 minimum)</p>
              <p>• Ensure wallet address is correct before submitting</p>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Selection Stage */}
      {!isFetching && stage === "wallet" && (
        <div className="withdraw-card">
          {/* Back Button */}
          <button className="back-action-button" onClick={handleBack}>
            <ArrowLeftOutlined />
            Back to Amount
          </button>

          {/* Header */}
          <div className="wallet-selection-header">
            <div className="header-content">
              <h2>Select Withdrawal Wallet</h2>
              <p>Choose a wallet to receive your withdrawal of ${amount}</p>
            </div>
            <button
              className="btn-primary"
              onClick={() => setShowAddWallet(true)}
            >
              <PlusOutlined />
              Add New Wallet
            </button>
          </div>

          {/* Wallets Grid */}
          {userWallets.length > 0 ? (
            <div className="wallets-grid">
              {userWallets.map((wallet) => (
                <WalletCard key={wallet.id} wallet={wallet} />
              ))}
            </div>
          ) : (
            <div className="no-wallets">
              <WalletOutlined className="no-wallets-icon" />
              <h3>No Wallets Found</h3>
              <p>You haven't added any withdrawal wallets yet.</p>
              <button
                className="btn-primary"
                onClick={() => setShowAddWallet(true)}
              >
                <PlusOutlined />
                Add Your First Wallet
              </button>
            </div>
          )}

          {/* Wallet Instructions */}
          <div className="wallet-instructions">
            <h4>Important:</h4>
            <ul>
              <li>Select the wallet where you want to receive funds</li>
              <li>Ensure the wallet supports the selected cryptocurrency</li>
              <li>Double-check the wallet address before confirming</li>
              <li>You can edit or delete wallets anytime</li>
            </ul>
          </div>
        </div>
      )}

      {/* Confirmation Stage */}
      {!isFetching && stage === "confirm" && selectedWallet && (
        <div className="withdraw-card">
          {/* Back Button */}
          <button className="back-action-button" onClick={handleBack}>
            <ArrowLeftOutlined />
            Back to Wallet Selection
          </button>

          {/* Confirmation Header */}
          <div className="confirmation-header">
            <h2>Confirm Withdrawal</h2>
            <p>Please review your withdrawal details</p>
          </div>

          {/* Withdrawal Details */}
          <div className="withdrawal-details">
            <div className="detail-row">
              <span className="detail-label">Amount:</span>
              <span className="detail-value">
                ${parseFloat(amount).toFixed(2)}
              </span>
            </div>

            {(() => {
              const { fee, netAmount } = calculateWithdrawalDetails();
              return (
                <>
                  <div className="detail-row">
                    <span className="detail-label">Transaction Fee:</span>
                    <span className="detail-value fee">-${fee.toFixed(2)}</span>
                  </div>
                  <div className="detail-row total">
                    <span className="detail-label">You'll Receive:</span>
                    <span className="detail-value total-amount">
                      ${netAmount.toFixed(2)}
                    </span>
                  </div>
                </>
              );
            })()}

            <div className="detail-row">
              <span className="detail-label">Wallet Name:</span>
              <span className="detail-value">{selectedWallet.name}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Network:</span>
              <span className="detail-value network">
                <span
                  className="network-badge"
                  style={{
                    backgroundColor: `${getNetworkColor(selectedWallet.network)}20`,
                    color: getNetworkColor(selectedWallet.network),
                  }}
                >
                  {getNetworkIcon(selectedWallet.network)}
                  {getNetworkDisplayName({ network: selectedWallet.network })}
                </span>
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Wallet Address:</span>
              <div className="wallet-address-display">
                <code>{selectedWallet.address}</code>
                <button
                  className="copy-btn"
                  onClick={() => handleCopy(selectedWallet.address)}
                  title="Copy address"
                >
                  {copied ? <CheckOutlined /> : <CopyOutlined />}
                </button>
              </div>
            </div>
          </div>

          {/* Estimated Time */}
          <div className="estimated-time">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="clock-icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <span>Estimated processing time: 24-48 hours</span>
          </div>

          {/* Confirm Button */}
          <button
            className="confirm-button"
            onClick={handleConfirmWithdraw}
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingOutlined className="loading-icon" />
                Processing Withdrawal...
              </>
            ) : (
              "Confirm Withdrawal"
            )}
          </button>

          {/* Warning */}
          <div className="warning-box">
            <ExclamationCircleOutlined />
            <div className="warning-content">
              <p>
                <strong>Warning:</strong> Withdrawals cannot be canceled once
                submitted.
              </p>
              <p>Please double-check all details before confirming.</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Stage */}
      {!isFetching && stage === "success" && (
        <div className="withdraw-card success-card">
          {/* Success Icon */}
          <div className="success-icon">
            <CheckOutlined />
          </div>

          {/* Success Message */}
          <div className="success-content">
            <h2>Withdrawal Request Submitted!</h2>
            <p className="success-amount">${parseFloat(amount).toFixed(2)}</p>
            <p className="success-details">
              Your withdrawal request has been received and is being processed.
            </p>
          </div>

          {/* Transaction Details */}
          <div className="transaction-details">
            <div className="transaction-row">
              <span>Wallet Name:</span>
              <strong>{selectedWallet?.name}</strong>
            </div>
            <div className="transaction-row">
              <span>Network:</span>
              <strong>
                {getNetworkDisplayName({ network: selectedWallet?.network })}
              </strong>
            </div>
            <div className="transaction-row">
              <span>Wallet Address:</span>
              <code className="wallet-address-code">
                {selectedWallet?.address.substring(0, 20)}...
              </code>
            </div>
            <div className="transaction-row">
              <span>Estimated Completion:</span>
              <strong>24-48 hours</strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="success-actions">
            <button className="btn-primary" onClick={() => setStage("input")}>
              Make Another Withdrawal
            </button>
            <Link to="/transactions" className="btn-outline">
              View Transaction History
            </Link>
          </div>

          {/* Support Info */}
          <div className="support-info">
            <p>
              Need help? Contact our support team if you have any questions
              about your withdrawal.
            </p>
          </div>
        </div>
      )}

      {/* Copy Notification */}
      {copied && <div className="copy-notification">Copied to clipboard!</div>}
    </div>
  );
};

export default Withdraw;
