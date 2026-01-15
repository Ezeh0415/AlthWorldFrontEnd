import React, { useState, useEffect } from "react";
import {
  RiseOutlined as TrendingUp,
  WalletOutlined as Wallet,
  PieChartOutlined as PieChart,
  SafetyCertificateOutlined as ShieldCheck,
  ArrowUpOutlined as ArrowUpRight,
  ArrowDownOutlined as ArrowDownRight,
  MoreOutlined as MoreVertical,
  FilterOutlined as Filter,
  LoadingOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  CreditCardOutlined,
  HistoryOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import "../styles/Dashboard.css";
import Header from "../Commponets/Header";
import Footer from "../Commponets/Footer";
import { useNavigate } from "react-router-dom";
import ApiService from "../Commponets/ApiService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    wallet: { balance: 0, invBalance: 0, pending: 0 },
    investments: [],
    transactions: [],
    profits: 0,
    accountStatus: { isVerified: false },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useMockData, setUseMockData] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [stats, setStats] = useState({
    totalGrowth: 0,
    monthlyGrowth: 0,
    activeInvestments: 0,
    completedInvestments: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      setUseMockData(false);

      const data = await ApiService.getDashboardData();
      console.log("API Response:", data);

      // Transform API data to match our component structure
      const transformedData = transformApiData(data);
      setDashboardData(transformedData);

      // Calculate derived stats
      calculateStats(transformedData);
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message || "Failed to load dashboard data");
      // Fallback to mock data
      const mockData = generateMockData();
      setDashboardData(mockData);
      setStats({
        totalGrowth: 18.5,
        monthlyGrowth: 3.2,
        activeInvestments: 2,
        completedInvestments: 0,
      });
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const transformApiData = (apiData) => {
    return {
      wallet: apiData.wallet || { balance: 0, invBalance: 0, pending: 0 },
      investments: apiData.investments || [],
      transactions: apiData.transactions || [],
      profits: apiData.profits || 0,
      accountStatus: {
        isVerified: apiData.accountStatus?._id ? true : false,
        ...apiData.accountStatus,
      },
    };
  };

  const calculateStats = (data) => {
    const activeInvestments = data.investments.filter(
      (inv) => inv.status === "active" || inv.status === "running"
    ).length;

    const completedInvestments = data.investments.filter(
      (inv) => inv.status === "completed" || inv.status === "ended"
    ).length;

    // Calculate total investments
    const totalInvestments = data.investments.reduce(
      (sum, inv) => sum + (inv.amount || inv.investedAmount || 0),
      0
    );

    // Mock growth calculations (replace with real calculations when available)
    const totalGrowth = totalInvestments > 0 ? 12.5 : 0;
    const monthlyGrowth = totalInvestments > 0 ? 2.8 : 0;

    setStats({
      totalGrowth,
      monthlyGrowth,
      activeInvestments,
      completedInvestments,
    });
  };

  const generateMockData = () => {
    return {
      wallet: {
        balance: 78500,
        invBalance: 80000,
        pending: 15000,
      },
      investments: [
        {
          _id: "inv1",
          plan: "Starter Plan",
          amount: 30000,
          status: "active",
          roi: 15,
        },
        {
          _id: "inv2",
          plan: "Premium Plan",
          amount: 50000,
          status: "active",
          roi: 25,
        },
      ],
      transactions: [
        {
          _id: "1",
          type: "deposit",
          amount: 50000,
          status: "success",
          createdAt: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          description: "Bank Transfer",
        },
        {
          _id: "2",
          type: "investment",
          amount: 30000,
          status: "active",
          createdAt: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
          description: "Starter Plan Investment",
        },
      ],
      profits: 24500,
      accountStatus: { isVerified: true },
    };
  };

  const formatCurrency = (amount) => {
    if (!showBalance) {
      return "$••••••";
    }

    const amountInDollars = amount / 100;

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amountInDollars);
  };

  const formatCompactCurrency = (amount) => {
    const amountInDollars = amount / 100;

    if (amountInDollars >= 1000000) {
      return `$${(amountInDollars / 1000000).toFixed(1)}M`;
    }
    // if (amountInDollars >= 1000) {
    //   return `$${(amountInDollars / 1000).toFixed(1)}K`;
    // }
    return `$${amountInDollars.toFixed(0)}`;
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

  const getTransactionIcon = (type) => {
    const icons = {
      deposit: <ArrowDownRight style={{ color: "#22c55e" }} />,
      withdrawal: <ArrowUpRight style={{ color: "#ef4444" }} />,
      investment: <TrendingUp style={{ color: "#3b82f6" }} />,
      profit: <PieChart style={{ color: "#10b981" }} />,
      referral: <RocketOutlined style={{ color: "#8b5cf6" }} />,
    };
    return icons[type] || <HistoryOutlined style={{ color: "#6b7280" }} />;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      success: { text: "Success", color: "#10b981", bg: "#d1fae5" },
      active: { text: "Active", color: "#3b82f6", bg: "#dbeafe" },
      processing: { text: "Processing", color: "#f59e0b", bg: "#fef3c7" },
      pending: { text: "Pending", color: "#f59e0b", bg: "#fef3c7" },
      failed: { text: "Failed", color: "#ef4444", bg: "#fee2e2" },
      completed: { text: "Completed", color: "#10b981", bg: "#d1fae5" },
    };

    const config = statusConfig[status] || {
      text: status,
      color: "#6b7280",
      bg: "#f1f5f9",
    };

    return (
      <span
        className="status-badge"
        style={{
          backgroundColor: config.bg,
          color: config.color,
          padding: "2px 8px",
          borderRadius: "12px",
          fontSize: "0.7rem",
          fontWeight: "600",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        {config.text}
      </span>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");
    localStorage.removeItem("loginTimestamp");
    localStorage.removeItem("rememberedUsername");
    navigate("/login");
  };

  const handleQuickAction = (action) => {
    const routes = {
      deposit: "/deposit",
      invest: "/investments",
      withdraw: "/withdraw",
      referral: "/referrals",
    };
    if (routes[action]) navigate(routes[action]);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Header />
        <div className="loading-container">
          <LoadingOutlined style={{ fontSize: 48, color: "#3b82f6" }} spin />
          <p>Loading your dashboard...</p>
          <small>Getting everything ready for you</small>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Header />

      {useMockData && (
        <div className="mock-data-banner">
          <ExclamationCircleOutlined style={{ color: "#f59e0b" }} />
          <span>Showing demo data</span>
          <button
            className="btn-retry"
            onClick={fetchDashboardData}
            title="Retry connection"
          >
            <ReloadOutlined />
          </button>
        </div>
      )}

      <main className="dashboard-main">
        {/* Welcome Header */}
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome Back!</h1>
          <p className="welcome-subtitle">Here's your financial overview</p>
        </div>
        {error && <div>error</div>}

        {/* Stats Grid - Modern Cards */}
        <div className="stats-grid modern-grid">
          {/* Wallet Balance Card */}
          <div className="modern-card wallet-card">
            <div className="card-header">
              <div className="card-icon-container wallet-icon">
                <Wallet size={24} />
              </div>
              <div className="card-actions">
                <button
                  className="icon-btn"
                  onClick={() => setShowBalance(!showBalance)}
                  title={showBalance ? "Hide balance" : "Show balance"}
                >
                  {showBalance ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                </button>
              </div>
            </div>
            <div className="card-content">
              <h3 className="card-label">Available Balance</h3>
              <p className="card-amount main-amount">
                {formatCurrency(dashboardData.wallet.balance)}
              </p>
              <div className="card-details">
                <div className="detail-item">
                  <span className="detail-label">Invested</span>
                  <span className="detail-value">
                    {formatCompactCurrency(dashboardData.wallet.invBalance)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Pending</span>
                  <span className="detail-value">
                    {formatCompactCurrency(dashboardData.wallet.pending)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Investments Card */}
          <div className="modern-card investments-card">
            <div className="card-header">
              <div className="card-icon-container investments-icon">
                <TrendingUp size={24} />
              </div>
              <div className="card-actions">
                <MoreVertical size={18} className="icon-btn" />
              </div>
            </div>
            <div className="card-content">
              <h3 className="card-label">Total Investments</h3>
              <p className="card-amount">
                {formatCurrency(dashboardData.wallet.invBalance)}
              </p>
              <div className="card-stats">
                <div className="stat-item">
                  <div className="stat-badge active">
                    {stats.activeInvestments}
                  </div>
                  <span className="stat-label">Active</span>
                </div>
                <div className="stat-item">
                  <div className="stat-badge completed">
                    {stats.completedInvestments}
                  </div>
                  <span className="stat-label">Completed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profits Card */}
          <div className="modern-card profits-card">
            <div className="card-header">
              <div className="card-icon-container profits-icon">
                <PieChart size={24} />
              </div>
              <div className="card-actions">
                <MoreVertical size={18} className="icon-btn" />
              </div>
            </div>
            <div className="card-content">
              <h3 className="card-label">Total Profits</h3>
              <p className="card-amount">
                {formatCurrency(dashboardData.profits)}
              </p>
              <div className="growth-indicator">
                <ArrowUpRight size={14} />
                <span className="growth-value positive">
                  +{stats.monthlyGrowth}%
                </span>
                <span className="growth-label">this month</span>
              </div>
            </div>
          </div>

          {/* Account Status Card */}
          <div className="modern-card status-card">
            <div className="card-header">
              <div className="card-icon-container status-icon">
                <ShieldCheck size={24} />
              </div>
              <div className="card-actions">
                <MoreVertical size={18} className="icon-btn" />
              </div>
            </div>
            <div className="card-content">
              <h3 className="card-label">Account Status</h3>
              <div className="verification-status">
                {dashboardData.accountStatus?.isVerified ? (
                  <div className="verified-badge">
                    <ShieldCheck size={14} />
                    <span>Verified Account</span>
                  </div>
                ) : (
                  <div className="unverified-badge">
                    <ExclamationCircleOutlined size={14} />
                    <span>Verification Pending</span>
                  </div>
                )}
              </div>
              <p className="status-note">
                {dashboardData.accountStatus?.isVerified
                  ? "Full platform access enabled"
                  : "Complete verification for full access"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          {/* Transactions Panel */}
          <div className="content-panel transactions-panel">
            <div className="panel-header">
              <div className="panel-title">
                <HistoryOutlined style={{ marginRight: "8px" }} />
                <h3>Recent Transactions</h3>
              </div>
              <div className="panel-actions">
                <button
                  className="btn-icon small"
                  onClick={() => navigate("/transactions")}
                >
                  View All
                </button>
                <button className="btn-icon small" onClick={() => {}}>
                  <Filter size={14} />
                </button>
              </div>
            </div>

            <div className="panel-content">
              {dashboardData.transactions.length === 0 ? (
                <div className="empty-state modern">
                  <div className="empty-icon">
                    <CreditCardOutlined />
                  </div>
                  <h4>No transactions yet</h4>
                  <p>Start by making your first deposit</p>
                  <button
                    className="btn-primary small"
                    onClick={() => navigate("/deposit")}
                  >
                    Make First Deposit
                  </button>
                </div>
              ) : (
                <div className="transactions-list modern">
                  {dashboardData.transactions.slice(0, 5).map((transaction) => (
                    <div
                      key={transaction._id}
                      className="transaction-item modern"
                    >
                      <div className="transaction-icon-container">
                        {getTransactionIcon(transaction.type)}
                      </div>
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
                      <div className="transaction-amounts">
                        <span
                          className={`amount ${
                            transaction.type === "withdrawal"
                              ? "negative"
                              : "positive"
                          }`}
                        >
                          {transaction.type === "withdrawal" ? "-" : "+"}
                          {formatCurrency(
                            transaction.requestedAmount ||
                              transaction.creditedAmount
                          )}
                        </span>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="content-panel actions-panel">
            <div className="panel-header">
              <div className="panel-title">
                <RocketOutlined style={{ marginRight: "8px" }} />
                <h3>Quick Actions</h3>
              </div>
            </div>

            <div className="panel-content">
              <div className="actions-grid modern">
                <button
                  className="action-card deposit-action"
                  onClick={() => handleQuickAction("deposit")}
                >
                  <div className="action-icon">
                    <ArrowDownRight size={20} />
                  </div>
                  <div className="action-content">
                    <h4>Deposit</h4>
                    <p>Add funds to your wallet</p>
                  </div>
                </button>

                <button
                  className="action-card invest-action"
                  onClick={() => handleQuickAction("invest")}
                >
                  <div className="action-icon">
                    <TrendingUp size={20} />
                  </div>
                  <div className="action-content">
                    <h4>Invest</h4>
                    <p>Start earning returns</p>
                  </div>
                </button>

                <button
                  className="action-card withdraw-action"
                  onClick={() => handleQuickAction("withdraw")}
                >
                  <div className="action-icon">
                    <ArrowUpRight size={20} />
                  </div>
                  <div className="action-content">
                    <h4>Withdraw</h4>
                    <p>Withdraw your earnings</p>
                  </div>
                </button>

                <button
                  className="action-card referral-action"
                  onClick={() => handleQuickAction("referral")}
                >
                  <div className="action-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div className="action-content">
                    <h4>Refer</h4>
                    <p>Earn with friends</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Footer */}
        <div className="dashboard-footer modern">
          <div className="footer-actions">
            <button
              className="btn-secondary"
              onClick={fetchDashboardData}
              disabled={loading}
            >
              <ReloadOutlined size={14} />
              {loading ? "Refreshing..." : "Refresh Data"}
            </button>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>

          {useMockData && (
            <div className="data-status">
              <span className="status-indicator demo"></span>
              <span>Demo data • Last updated just now</span>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
