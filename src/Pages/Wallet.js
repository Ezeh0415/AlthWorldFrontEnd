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

  // Mock exchange rates
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
        totalDeposits: data.stats?.totalDeposits || 0,
        totalWithdrawals: data.stats?.totalWithdrawals || 0,
        totalProfits: data.profits || 0,
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amountInDollars);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "deposit":
        return <ArrowDownOutlined className="deposit-icon" />;
      case "withdrawal":
        return <ArrowUpOutlined className="withdrawal-icon" />;
      case "profit":
        return <PlusCircleOutlined className="profit-icon" />;
      case "investment":
        return <SwapOutlined className="investment-icon" />;
      default:
        return <WalletOutlined className="default-icon" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
      case "success":
        return (
          <span className="status-badge completed">
            <CheckCircleOutlined />
            Completed
          </span>
        );
      case "pending":
        return (
          <span className="status-badge pending">
            <ClockCircleOutlined />
            Pending
          </span>
        );
      case "processing":
      case "active":
        return (
          <span className="status-badge processing">
            <LoadingOutlined />
            Processing
          </span>
        );
      default:
        return (
          <span className="status-badge unknown">
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

  const handleExportHistory = () => {
    // Implement export functionality
    console.log("Export transaction history");
  };

  if (loading) {
    return (
      <div className="wallet-container">
        <Header />
        <div className="loading-container">
          <LoadingOutlined style={{ fontSize: 48, color: "#3b82f6" }} spin />
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
          <ExclamationCircleOutlined style={{ color: "#f59e0b" }} />
          <span>Showing demo data</span>
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
        {/* Hero Balance Card */}
        <div className="wallet-hero-section">
          <div className="hero-balance-card">
            <div className="hero-header">
              <div className="hero-title">
                <WalletOutlined className="hero-icon" />
                <div>
                  <h3>Total Wallet Balance</h3>
                  <p>Your available funds</p>
                </div>
              </div>
              <div className="hero-actions">
                <button
                  className="visibility-toggle hero-toggle"
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  aria-label={balanceVisible ? "Hide balance" : "Show balance"}
                >
                  {balanceVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                </button>
                <div className="currency-selector hero-selector">
                  {/* <select
                    className="currency-select hero-select"
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                  >
                    {currencyOptions.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select> */}
                </div>
              </div>
            </div>

            <div className="hero-balance-content">
              {balanceVisible ? (
                <>
                  <div className="hero-amount">
                    {formatCurrency(walletData.balance)}
                  </div>
                  <div className="hero-details">
                    <div className="detail-item">
                      <span className="detail-label">Available:</span>
                      <span className="detail-value available">
                        {formatCurrency(walletData.balance)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Pending:</span>
                      <span className="detail-value pending">
                        {formatCurrency(walletData.pending)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Invested:</span>
                      <span className="detail-value invested">
                        {formatCurrency(walletData.invBalance)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="balance-hidden">
                  <div className="hidden-amount">●●●●●●●●</div>
                  <small>Balance hidden</small>
                </div>
              )}
            </div>

            <div className="hero-action-buttons">
              <button
                className="action-btn deposit-hero"
                onClick={handleDeposit}
              >
                <ArrowDownOutlined />
                <div>
                  <span className="action-title">Deposit</span>
                  <span className="action-subtitle">Add funds</span>
                </div>
              </button>
              <button
                className="action-btn withdraw-hero"
                onClick={handleWithdraw}
              >
                <ArrowUpOutlined />
                <div>
                  <span className="action-title">Withdraw</span>
                  <span className="action-subtitle">Cash out</span>
                </div>
              </button>
              <button
                className="action-btn export-hero"
                onClick={handleExportHistory}
              >
                <HistoryOutlined />
                <div>
                  <span className="action-title">Export</span>
                  <span className="action-subtitle">Get history</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="wallet-content-grid">
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
              <button className="btn-view-all">
                View All
                <ArrowUpOutlined
                  style={{ transform: "rotate(45deg)", marginLeft: "4px" }}
                />
              </button>
            </div>

            <div className="transactions-list">
              {transactions.length === 0 ? (
                <div className="empty-transactions">
                  <WalletOutlined className="empty-icon" />
                  <h4>No transactions yet</h4>
                  <p>Make your first deposit to get started</p>
                  <button className="btn-deposit-cta" onClick={handleDeposit}>
                    Make First Deposit
                  </button>
                </div>
              ) : (
                transactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction._id}
                    className="transaction-item-modern"
                  >
                    <div className="transaction-icon-container">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="transaction-content">
                      <div className="transaction-info">
                        <h4 className="transaction-title">
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
                        <p className="transaction-date">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                      <div className="transaction-amount-info">
                        <span
                          className={`amount ${
                            transaction.amount >= 0 ? "positive" : "negative"
                          }`}
                        >
                          {transaction.amount >= 0 ? "+" : "-"}
                          {formatCurrency(
                            Math.abs(
                              transaction.requestedAmount ||
                                transaction.creditedAmount
                            )
                          )}
                        </span>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Balance Summary Panel */}
          <div className="summary-panel">
            <div className="panel-header">
              <h3>Balance Summary</h3>
            </div>

            <div className="summary-grid">
              <div className="summary-card">
                <div className="summary-icon total-deposits">
                  <ArrowDownOutlined />
                </div>
                <div className="summary-content">
                  <span className="summary-label">Total Deposits</span>
                  <span className="summary-value positive">
                    {formatCurrency(walletData.totalDeposits)}
                  </span>
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-icon total-withdrawals">
                  <ArrowUpOutlined />
                </div>
                <div className="summary-content">
                  <span className="summary-label">Total Withdrawals</span>
                  <span className="summary-value negative">
                    {formatCurrency(walletData.totalWithdrawals)}
                  </span>
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-icon total-profits">
                  <PlusCircleOutlined />
                </div>
                <div className="summary-content">
                  <span className="summary-label">Total Profits</span>
                  <span className="summary-value positive">
                    {formatCurrency(walletData.totalProfits)}
                  </span>
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-icon total-pending">
                  <ClockCircleOutlined />
                </div>
                <div className="summary-content">
                  <span className="summary-label">Pending Balance</span>
                  <span className="summary-value pending">
                    {formatCurrency(walletData.pending)}
                  </span>
                </div>
              </div>
            </div>

            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Available Balance</span>
                <span className="stat-value available">
                  {formatCurrency(walletData.balance)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Invested Amount</span>
                <span className="stat-value invested">
                  {formatCurrency(walletData.invBalance)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Net Worth</span>
                <span className="stat-value net-worth">
                  {formatCurrency(walletData.balance + walletData.invBalance)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="wallet-footer">
          <button className="btn-refresh" onClick={fetchWalletData}>
            <ReloadOutlined />
            Refresh Data
          </button>
          {useMockData && (
            <div className="data-status">
              <span className="status-indicator"></span>
              <span>Demo data • Refreshed just now</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
