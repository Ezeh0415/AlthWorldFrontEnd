import React, { useState, useEffect } from "react";
import {
  WalletOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  HistoryOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  PlusCircleOutlined,
  SwapOutlined,
  DollarOutlined,
  ExportOutlined,
  ArrowRightOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import "../styles/Wallet.css";
import Header from "../Commponets/Header";
import ApiService from "../Commponets/ApiService";

const Wallet = () => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [walletData, setWalletData] = useState({
    balance: 0,
    invBalance: 0,
    pending: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalProfits: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [useMockData, setUseMockData] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  // Exchange rates
  const exchangeRates = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    NGN: 1600,
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      setUseMockData(false);

      // Try to fetch from real API
      const data = await ApiService.getDashboardData();
      console.log("Wallet API Response:", data);

      // Transform API data for wallet
      const transformedData = {
        balance: data.wallet?.balance || 0,
        invBalance: data.wallet?.invBalance || 0,
        pending: data.wallet?.pending || 0,
      };

      setWalletData(transformedData);
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error("Wallet API Error:", err);
      setError("Failed to load wallet data");
      setUseMockData(true);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockWalletData = {
      balance: 12548.75 * exchangeRates.NGN,
      invBalance: 80000,
      pending: 2000.0 * exchangeRates.NGN,
      totalDeposits: 18500.5 * exchangeRates.NGN,
      totalWithdrawals: 5954.75 * exchangeRates.NGN,
      totalProfits: 4048.75 * exchangeRates.NGN,
    };

    const mockTransactions = [
      {
        _id: "1",
        type: "deposit",
        amount: 3245.5 * exchangeRates.NGN,
        status: "completed",
        description: "Bank Transfer Deposit",
        createdAt: "2024-01-15T14:30:00Z",
      },
      {
        _id: "2",
        type: "withdrawal",
        amount: -1245.25 * exchangeRates.NGN,
        status: "pending",
        description: "Withdrawal Request",
        createdAt: "2024-01-14T10:15:00Z",
      },
      {
        _id: "3",
        type: "investment",
        amount: -5000.0 * exchangeRates.NGN,
        status: "completed",
        description: "Gold Plan Investment",
        createdAt: "2024-01-13T16:45:00Z",
      },
      {
        _id: "4",
        type: "profit",
        amount: 245.75 * exchangeRates.NGN,
        status: "completed",
        description: "Weekly Profit Earnings",
        createdAt: "2024-01-12T09:20:00Z",
      },
      {
        _id: "5",
        type: "deposit",
        amount: 1000.0 * exchangeRates.NGN,
        status: "processing",
        description: "Crypto Deposit",
        createdAt: "2024-01-11T11:30:00Z",
      },
    ];

    setWalletData(mockWalletData);
    setTransactions(mockTransactions);
  };

  // Format currency based on selected currency
  const formatCurrency = (amountInNGN) => {
    const amountInDollars = amountInNGN / 100;

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amountInDollars);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "deposit":
        return <ArrowDownOutlined className="deposit-icon" />;
      case "withdrawal":
        return <ArrowUpOutlined className="withdrawal-icon" />;
      case "profit":
        return <PlusCircleOutlined className="interest-icon" />;
      case "investment":
        return <SwapOutlined className="transfer-icon" />;
      default:
        return <WalletOutlined className="default-icon" />;
    }
  };

  const getTransactionIconClass = (type) => {
    switch (type) {
      case "deposit":
        return "deposit";
      case "withdrawal":
        return "withdrawal";
      case "profit":
        return "interest";
      case "investment":
        return "transfer";
      default:
        return "default";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
      case "success":
        return (
          <span className="transaction-status status-completed">
            <CheckCircleOutlined />
            Completed
          </span>
        );
      case "pending":
        return (
          <span className="transaction-status status-pending">
            <ClockCircleOutlined />
            Pending
          </span>
        );
      case "processing":
      case "active":
        return (
          <span className="transaction-status status-pending">
            <LoadingOutlined />
            Processing
          </span>
        );
      default:
        return (
          <span className="transaction-status status-pending">
            <ClockCircleOutlined />
            {status || "Unknown"}
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "--";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleDeposit = () => {
    window.location.href = "/deposit";
  };

  const handleWithdraw = () => {
    window.location.href = "/withdraw";
  };

  if (loading) {
    return (
      <div className="wallet-container">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading wallet data...</p>
          <small>Getting your financial information</small>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-container">
      <Header />

      {error && useMockData && (
        <div className="mock-data-banner">
          <ExclamationCircleOutlined style={{ color: "#92400e" }} />
          <span>Showing demo data. Real-time connection failed.</span>
          <button
            className="btn-retry"
            onClick={fetchWalletData}
            title="Retry connection"
          >
            <ReloadOutlined />
          </button>
        </div>
      )}

      <div className="wallet-main">
        {/* Hero Balance Section */}
        <div className="hero-balance-section">
          <div className="hero-balance-card">
            {/* Hero Header */}
            <div className="hero-header">
              <div className="hero-title">
                <div className="hero-icon-container">
                  <WalletOutlined className="hero-icon" />
                </div>
                <div className="hero-text">
                  <h2>Wallet Balance</h2>
                  <p>Your total available funds and investment portfolio</p>
                </div>
              </div>

              <div className="hero-controls">
                <button
                  className="visibility-toggle"
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  aria-label={balanceVisible ? "Hide balance" : "Show balance"}
                  title={balanceVisible ? "Hide balance" : "Show balance"}
                >
                  {balanceVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                </button>

                <div className="currency-selector">
                  {/* <span className="currency-icon">
                    <DollarOutlined />
                  </span> */}
                  {/* <select
                    className="currency-select"
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="NGN">NGN</option>
                  </select> */}
                </div>
              </div>
            </div>

            {/* Balance Display */}
            <div className="balance-display">
              {balanceVisible ? (
                <div className="balance-visible">
                  <div className="balance-amount">
                    {formatCurrency(walletData.balance)}
                  </div>
                </div>
              ) : (
                <div className="balance-hidden">
                  <div className="hidden-balance">●●●●●●●●●●</div>
                  <p>Balance hidden for privacy</p>
                </div>
              )}
            </div>

            {/* Balance Metrics */}
            <div className="balance-metrics">
              <div className="metric-card">
                <div className="metric-header">
                  <div
                    className="metric-icon"
                    style={{
                      background: "rgba(56, 178, 172, 0.1)",
                      color: "#38b2ac",
                    }}
                  >
                    <ArrowDownOutlined />
                  </div>
                  <span className="metric-title">Available</span>
                </div>
                <div className="metric-value available">
                  {formatCurrency(walletData.balance)}
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <div
                    className="metric-icon"
                    style={{
                      background: "rgba(66, 153, 225, 0.1)",
                      color: "#4299e1",
                    }}
                  >
                    <SwapOutlined />
                  </div>
                  <span className="metric-title">Invested</span>
                </div>
                <div className="metric-value invested">
                  {formatCurrency(walletData.invBalance)}
                </div>
                <div className="metric-change positive">
                  +{formatCurrency(walletData.invBalance)}
                  <span>active</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <div
                    className="metric-icon"
                    style={{
                      background: "rgba(237, 137, 54, 0.1)",
                      color: "#ed8936",
                    }}
                  >
                    <ClockCircleOutlined />
                  </div>
                  <span className="metric-title">Pending</span>
                </div>
                <div className="metric-value pending">
                  {formatCurrency(walletData.pending)}
                </div>
              </div>

              
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button className="action-button deposit" onClick={handleDeposit}>
                <div className="action-icon">
                  <ArrowDownOutlined />
                </div>
                <span className="action-title">Deposit</span>
                <span className="action-description">Add funds to wallet</span>
              </button>

              <button
                className="action-button withdraw"
                onClick={handleWithdraw}
              >
                <div className="action-icon">
                  <ArrowUpOutlined />
                </div>
                <span className="action-title">Withdraw</span>
                <span className="action-description">Cash out funds</span>
              </button>

              {/* <button
                className="action-button transfer"
                onClick={handleTransfer}
              >
                <div className="action-icon">
                  <SwapOutlined />
                </div>
                <span className="action-title">Transfer</span>
                <span className="action-description">Send to others</span>
              </button> */}

           
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="wallet-content">
          {/* Transactions Panel */}
          <div className="transactions-panel">
            <div className="panel-header">
              <div className="panel-title">
                <HistoryOutlined className="panel-icon" />
                <h3>Recent Transactions</h3>
                <span className="transaction-count">
                  {transactions.length} transactions
                </span>
              </div>
              <button className="view-all">
                View All
                <ArrowRightOutlined />
              </button>
            </div>

            <div className="transactions-list">
              {transactions.length === 0 ? (
                <div className="empty-state">
                  <WalletOutlined className="empty-icon" />
                  <h4>No transactions yet</h4>
                  <p>Make your first deposit to get started with investments</p>
                  <button className="primary-button" onClick={handleDeposit}>
                    Make First Deposit
                  </button>
                </div>
              ) : (
                transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction._id} className="transaction-item">
                    <div
                      className={`transaction-icon ${getTransactionIconClass(transaction.type)}`}
                    >
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="transaction-details">
                      <h4 className="transaction-description">
                        {transaction.description ||
                          (transaction.type === "deposit"
                            ? "Deposit"
                            : transaction.type === "withdrawal"
                              ? "Withdrawal"
                              : transaction.type === "investment"
                                ? "Investment"
                                : transaction.type === "profit"
                                  ? "Profit Earnings"
                                  : "Transaction")}
                      </h4>
                      <div className="transaction-meta">
                        <p className="transaction-date">
                          {formatDate(transaction.createdAt)}
                        </p>
                        {transaction._id && (
                          <span className="transaction-id">
                            #{transaction._id.slice(-6)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="transaction-amount">
                      <span
                        className={`amount ${
                          transaction.amount >= 0 ? "positive" : "negative"
                        }`}
                      >
                        {transaction.amount >= 0 ? "+" : "-"}
                        {formatCurrency(
                          Math.abs(
                            transaction.requestedAmount ||
                              transaction.creditedAmount ||
                              transaction.amount || 0,
                          ),
                        )}
                      </span>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Summary Panel */}
          <div className="summary-panel">
            <div className="panel-header">
              <h3>Financial Summary</h3>
            </div>

            <div className="summary-stats">
              <div className="summary-stat">
                <span className="stat-label">Total Deposits</span>
                <span className="stat-value positive">
                  {formatCurrency(walletData.totalDeposits || 0)}
                </span>
              </div>

              <div className="summary-stat">
                <span className="stat-label">Total Withdrawals</span>
                <span className="stat-value negative">
                  {formatCurrency(walletData.totalWithdrawals || 0)}
                </span>
              </div>

              {/* <div className="summary-stat">
                <span className="stat-label">Net Profit</span>
                <span className="stat-value positive">
                  {formatCurrency(walletData.totalProfits)}
                </span>
              </div> */}

              <div className="summary-stat">
                <span className="stat-label">Pending Balance</span>
                <span className="stat-value neutral">
                  {formatCurrency(walletData.pending)}
                </span>
              </div>
            </div>

            {/* <div className="quick-insights">
              <h4 className="insights-title">Quick Insights</h4>
              <div className="insight-item">
                <div className="insight-icon positive">
                  <ArrowUpOutlined />
                </div>
                <span className="insight-text">
                  Your net worth increased by 12% this month
                </span>
              </div>
              <div className="insight-item">
                <div className="insight-icon info">
                  <ClockCircleOutlined />
                </div>
                <span className="insight-text">
                  {transactions.filter((t) => t.status === "pending").length}{" "}
                  pending transactions
                </span>
              </div>
              <div className="insight-item">
                <div className="insight-icon warning">
                  <ExclamationCircleOutlined />
                </div>
                <span className="insight-text">
                  Consider diversifying your investment portfolio
                </span>
              </div>
            </div> */}
          </div>
        </div>

        {/* Footer */}
        <div className="wallet-footer">
          <button className="refresh-button" onClick={fetchWalletData}>
            <ReloadOutlined />
            Refresh Data
          </button>
          <div className="last-updated">
            <span className="status-indicator"></span>
            <span>
              {useMockData ? "Demo data" : "Live data"} • Updated just now
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
