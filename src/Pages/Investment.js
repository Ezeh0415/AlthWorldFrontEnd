import { useState, useEffect, useMemo } from "react";
import {
  LineChartOutlined,
  DollarOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  WalletOutlined,
  ArrowUpOutlined,
  PercentageOutlined,
  ReloadOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  RocketOutlined,
  StarOutlined,
  TrophyOutlined,
  BarChartOutlined,
  QuestionCircleOutlined,
  ArrowDownOutlined, // For deposits
  // For withdrawals
  CheckCircleFilled, // For confirmed deposits
} from "@ant-design/icons";
import "../styles/Investment.css";
import Header from "../Commponets/Header";
import Footer from "../Commponets/Footer";
import ApiService from "../Commponets/ApiService";

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showValues, setShowValues] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewInvestmentModal, setShowNewInvestmentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [loadingInvestment, setLoadingInvestment] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  /* ------------------ PLANS ------------------ */
  const investmentPlans = [
    {
      id: "basic",
      name: "Basic Plan",
      minAmount: 100,
      maxAmount: 1000,
      roi: 2,
      duration: 30,
      color: "#10B981",
      icon: <StarOutlined />,
      description: "Perfect for beginners with low risk",
      features: ["Daily Returns", "Capital Protection", "24/7 Support"],
    },
    {
      id: "standard",
      name: "Standard Plan",
      minAmount: 500,
      maxAmount: 2000,
      roi: 4,
      duration: 60,
      color: "#3B82F6",
      icon: <BarChartOutlined />,
      description: "Balanced returns with moderate risk",
      features: ["Higher Returns", "Auto Reinvest", "Priority Support"],
    },
    {
      id: "premium",
      name: "Premium Plan",
      minAmount: 2000,
      maxAmount: 5000,
      roi: 6,
      duration: 90,
      color: "#8B5CF6",
      icon: <TrophyOutlined />,
      description: "High returns for serious investors",
      features: ["Maximum Returns", "VIP Support", "Early Withdrawal"],
    },
    {
      id: "ultimate",
      name: "Ultimate Plan",
      minAmount: 5000,
      maxAmount: 50000,
      roi: 8,
      duration: 120,
      color: "#EC4899",
      icon: <RocketOutlined />,
      description: "Maximum returns for premium investors",
      features: ["Premium Returns", "Dedicated Manager", "Custom Terms"],
    },
  ];

  /* ------------------ FETCH DATA ------------------ */
  const fetchUserInvestments = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch dashboard data
      const data = await ApiService.getDashboardData();
      setDashboardData(data);
      console.log(data);

      // Extract investments from dashboard data
      let apiInvestments = [];

      if (data.investments && Array.isArray(data.investments)) {
        // Transform your investment data to match component structure
        apiInvestments = data.investments.map((inv, index) => {
          // Extract data from your backend structure
          const amount = inv.amount || 0;
          const roi =
            inv.roi || inv.investmentType === "basic"
              ? 2
              : inv.investmentType === "standard"
                ? 4
                : inv.investmentType === "premium"
                  ? 6
                  : inv.investmentType === "ultimate"
                    ? 8
                    : 2;

          // Calculate total returns if not present
          const totalReturns = inv.profits || inv.totalReturns || 0;
          const currentValue = amount + totalReturns;

          return {
            _id: inv._id || `inv-${Date.now()}-${index}`,
            amount: amount,
            roi: roi,
            plan: inv.plan || inv.investmentType || "basic",
            investmentType: inv.investmentType || inv.plan || "basic",
            status: inv.status || "active",
            totalReturns: totalReturns,
            currentValue: currentValue,
            startDate:
              inv.startDate ||
              inv.investmentStartDate ||
              new Date().toISOString(),
            endDate:
              inv.endDate ||
              inv.investmentEndDate ||
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: inv.createdAt || new Date().toISOString(),
          };
        });
      }

      setInvestments(apiInvestments);
    } catch (err) {
      console.error("Failed to fetch investments:", err);
      setError("Failed to load investments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInvestments();
  }, []);

  /* ------------------ FILTER DEPOSITS ------------------ */
  const recentDeposits = useMemo(() => {
    if (
      !dashboardData?.transactions ||
      !Array.isArray(dashboardData.transactions)
    ) {
      return [];
    }

    // Filter only deposit transactions
    const deposits = dashboardData.transactions
      .filter((txn) => txn.type === "deposit")
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.date || 0) -
          new Date(a.createdAt || a.date || 0),
      )
      .slice(0, 5); // Get last 5 deposits

    return deposits;
  }, [dashboardData]);

  /* ------------------ STATS ------------------ */
  const userStats = useMemo(() => {
    const stats = {
      totalInvested: 0,
      totalReturns: 0,
      totalPortfolioValue: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
      avgROI: 0,
      totalInvestments: 0,
      totalDeposits: recentDeposits.length,
      totalDepositAmount: recentDeposits.reduce(
        (sum, deposit) => sum + (deposit.requestedAmount || 0),
        0,
      ),
    };

    investments.forEach((i) => {
      stats.totalInvested += i.amount || 0;
      stats.totalReturns += i.totalReturns || i.profits || 0;
      stats.totalPortfolioValue += i.currentValue || i.amount || 0;
      stats.avgROI += i.roi || 0;
      stats.totalInvestments++;

      if (i.status === "active" || i.investmentStatus === "active")
        stats.active++;
      if (i.status === "completed" || i.investmentStatus === "completed")
        stats.completed++;
      if (i.status === "cancelled" || i.investmentStatus === "cancelled")
        stats.cancelled++;
    });

    stats.avgROI = stats.totalInvestments
      ? stats.avgROI / stats.totalInvestments
      : 0;
    return stats;
  }, [investments, recentDeposits]);

  /* ------------------ COMING SOON COMPONENT ------------------ */
  const ComingSoonPlaceholder = ({
    message = "Coming Soon",
    iconSize = 48,
  }) => (
    <div className="coming-soon-placeholder">
      <QuestionCircleOutlined
        style={{
          fontSize: iconSize,
          color: "#6B7280",
          opacity: 0.5,
        }}
      />
      <span className="coming-soon-text">{message}</span>
    </div>
  );

  /* ------------------ HELPERS ------------------ */

  const formatCurrency = (v) => {
    if (!showValues) return "$●●●●";
    const amount = v || 0;
    const amountInDollars = amount / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amountInDollars);
  };

  const formatInvestCurrency = (v) => {
    if (!showValues) return "$●●●●";
    const amount = v || 0;
    // const amountInDollars = amount / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatCompactCurrency = (v) => {
    const amount = v || 0;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    return `$${amount}`;
  };

  const formatPercentage = (v) => {
    if (!showValues) return "●●%";
    return `${(v || 0).toFixed(1)}%`;
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
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        icon: <ClockCircleOutlined />,
        text: "Active",
        color: "#3b82f6",
        bg: "#dbeafe",
      },
      completed: {
        icon: <CheckCircleOutlined />,
        text: "Completed",
        color: "#10b981",
        bg: "#d1fae5",
      },
      cancelled: {
        icon: <CloseCircleOutlined />,
        text: "Cancelled",
        color: "#ef4444",
        bg: "#fee2e2",
      },
      pending: {
        icon: <ClockCircleOutlined />,
        text: "Pending",
        color: "#f59e0b",
        bg: "#fef3c7",
      },
    };

    const config = statusConfig[status] || statusConfig.active;

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
        {config.icon}
        {config.text}
      </span>
    );
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "basic":
        return "#10B981";
      case "standard":
        return "#3B82F6";
      case "premium":
        return "#8B5CF6";
      case "ultimate":
        return "#EC4899";
      default:
        return "#6B7280";
    }
  };

  const getPlanName = (type) => {
    switch (type?.toLowerCase()) {
      case "basic":
        return "Basic Plan";
      case "standard":
        return "Standard Plan";
      case "premium":
        return "Premium Plan";
      case "ultimate":
        return "Ultimate Plan";
      default:
        return type || "Investment Plan";
    }
  };

  const getDepositStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "completed":
      case "success":
        return <CheckCircleFilled style={{ color: "#10b981" }} />;
      case "pending":
        return <ClockCircleOutlined style={{ color: "#f59e0b" }} />;
      case "failed":
      case "cancelled":
        return <CloseCircleOutlined style={{ color: "#ef4444" }} />;
      default:
        return <ClockCircleOutlined style={{ color: "#6b7280" }} />;
    }
  };

  const getDepositStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "completed":
      case "success":
        return "Confirmed";
      case "pending":
        return "Pending";
      case "failed":
      case "cancelled":
        return "Failed";
      default:
        return "Processing";
    }
  };

  /* ------------------ CREATE INVESTMENT ------------------ */
  const handleNewInvestment = async ({ amount, startDate, endDate }) => {
  setError("");
  
  // Validate selected plan exists
  if (!selectedPlan) {
    setError("Please select an investment plan");
    return;
  }
  
  const plan = investmentPlans.find((p) => p.id === selectedPlan);
  
  // Validate plan exists
  if (!plan) {
    setError("Selected investment plan not found");
    return;
  }
  
  // Parse amount with better validation
  const value = parseFloat(amount);
  
  // Comprehensive validation
  if (isNaN(value) || !startDate || !endDate) {
    setError("All fields are required");
    return;
  }
  
  // Check for negative or zero amount
  if (value <= 0) {
    setError("Investment amount must be greater than 0");
    return;
  }
  
  // Check min/max amount with better precision
  if (value < plan.minAmount) {
    setError(`Minimum investment amount is ${formatCurrency(plan.minAmount)}`);
    return;
  }
  
  if (value > plan.maxAmount) {
    setError(`Maximum investment amount is ${formatCurrency(plan.maxAmount)}`);
    return;
  }
  
  // Validate date range
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
  
  if (start < today) {
    setError("Start date cannot be in the past");
    return;
  }
  
  if (end <= start) {
    setError("End date must be after start date");
    return;
  }
  
  // Calculate duration in days
  const durationDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
  
  // Validate against plan duration if applicable
  if (plan.duration && durationDays < plan.duration) {
    setError(`Minimum investment duration is ${plan.duration} days`);
    return;
  }
  
  try {
    setLoadingInvestment(true);
    
    // Prepare data for API
    const investmentData = {
      amount: value,
      roi: plan.roi,
      investmentType: plan.id,
      planName: plan.name, // Include plan name for reference
      investmentStartDate: startDate,
      investmentEndDate: endDate,
      duration: durationDays,
      expectedReturn: value * (plan.roi / 100), // Calculate expected return
      // userId: dashboardData?.accountStatus?._id || localStorage.getItem("userId"),
    };
    
    console.log("Submitting investment:", investmentData); // For debugging
    
    const result = await ApiService.invest(investmentData);
    
    // Validate response
    if (!result || !result.success) {
      throw new Error(result?.message || "Investment creation failed");
    }
    
    // Reset form state
    setShowNewInvestmentModal(false);
    setSelectedPlan("");
    setError("");
    
    // Show success message
    setSuccess(true);
    
    
    
    // Optional: Show success toast/notification
    if (result.message) {
      // Show notification: result.message
    }
    
    return result; // Return result for potential chaining
    
  } catch (err) {
    console.error("Investment creation error:", err);
    
    // Better error handling
    let errorMessage = "Failed to create investment";
    
    if (err.response) {
      // Server responded with error
      errorMessage = err.response.data?.message || err.response.statusText;
    } else if (err.request) {
      // No response received
      errorMessage = "Network error. Please check your connection.";
    } else if (err.message) {
      // Error thrown manually
      errorMessage = err.message;
    }
    
    setError(errorMessage);
    
    // Optional: Log error to monitoring service
    // logErrorToService(err, { amount, startDate, endDate, planId: selectedPlan });
    
    throw err; // Re-throw if parent component needs to handle
  } finally {
    setLoadingInvestment(false);
  }
};

  /* ------------------ MODAL ------------------ */
  const NewInvestmentModal = () => {
    const [amount, setAmount] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
      const plan = investmentPlans.find((p) => p.id === selectedPlan);
      if (!plan) return;

      const s = new Date();
      const e = new Date();
      e.setDate(e.getDate() + plan.duration);

      setStartDate(s.toISOString().split("T")[0]);
      setEndDate(e.toISOString().split("T")[0]);
    }, [selectedPlan]);

    const handleSubmit = (e) => {
      e.preventDefault();
      handleNewInvestment({ amount, startDate, endDate });
    };

    return (
      <div
        className="modal-overlay"
        onClick={() => setShowNewInvestmentModal(false)}
      >
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-title">
              <RocketOutlined
                style={{ color: "#3b82f6", marginRight: "8px" }}
              />
              <h3>Create New Investment</h3>
            </div>
            <button
              className="close-btn"
              onClick={() => setShowNewInvestmentModal(false)}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="error-message">
                  <ExclamationCircleOutlined />
                  <span>{error}</span>
                </div>
              )}

              <div className="plan-selection">
                <h4 className="section-title">Select Investment Plan</h4>
                <div className="plan-options-grid">
                  {investmentPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`plan-option-card ${
                        selectedPlan === plan.id ? "selected" : ""
                      }`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      <div className="plan-card-header">
                        <div
                          className="plan-icon-wrapper"
                          style={{
                            backgroundColor: `${plan.color}20`,
                            color: plan.color,
                          }}
                        >
                          {plan.icon}
                        </div>
                        <div className="plan-title-section">
                          <h5>{plan.name}</h5>
                          <span
                            className="plan-roi"
                            style={{ color: plan.color }}
                          >
                            {plan.roi}% ROI
                          </span>
                        </div>
                      </div>
                      <p className="plan-description">{plan.description}</p>
                      <div className="plan-details-grid">
                        <div className="plan-detail-item">
                          <span className="detail-label">Min Investment</span>
                          <span className="detail-value">
                            {formatInvestCurrency(plan.minAmount)}
                          </span>
                        </div>
                        <div className="plan-detail-item">
                          <span className="detail-label">Duration</span>
                          <span className="detail-value">
                            {plan.duration} days
                          </span>
                        </div>
                        <div className="plan-detail-item">
                          <span className="detail-label">Max Investment</span>
                          <span className="detail-value">
                            {formatInvestCurrency(plan.maxAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedPlan && (
                <div className="investment-details-form">
                  <h4 className="section-title">Investment Details</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Investment Amount *</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={`Enter amount between ${formatInvestCurrency(
                          investmentPlans.find((p) => p.id === selectedPlan)
                            .minAmount,
                        )} and ${formatInvestCurrency(
                          investmentPlans.find((p) => p.id === selectedPlan)
                            .maxAmount,
                        )}`}
                        // Remove these lines:
                        // min={investmentPlans.find((p) => p.id === selectedPlan).minAmount}
                        // max={investmentPlans.find((p) => p.id === selectedPlan).maxAmount}
                        step="0.01"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Start Date *</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>End Date *</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={
                          startDate || new Date().toISOString().split("T")[0]
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="investment-summary-card">
                    <h5>Investment Summary</h5>
                    <div className="summary-grid">
                      <div className="summary-item">
                        <span>Plan:</span>
                        <span>{getPlanName(selectedPlan)}</span>
                      </div>
                      <div className="summary-item">
                        <span>ROI Rate:</span>
                        <span>
                          {
                            investmentPlans.find((p) => p.id === selectedPlan)
                              .roi
                          }
                          %
                        </span>
                      </div>
                      <div className="summary-item">
                        <span>Duration:</span>
                        <span>
                          {Math.round(
                            (new Date(endDate) - new Date(startDate)) /
                              (1000 * 60 * 60 * 24),
                          )}{" "}
                          days
                        </span>
                      </div>
                      <div className="summary-item total">
                        <span>Total Investment:</span>
                        <span className="total-investment">
                          {amount
                            ? formatInvestCurrency(parseFloat(amount))
                            : "$0"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowNewInvestmentModal(false)}
                  disabled={loadingInvestment}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    !selectedPlan ||
                    !amount ||
                    !startDate ||
                    !endDate ||
                    loadingInvestment
                  }
                >
                  {loadingInvestment ? (
                    <>
                      <LoadingOutlined spin style={{ marginRight: "8px" }} />
                      Creating...
                    </>
                  ) : (
                    "Confirm Investment"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="user-investments-container">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="investments-content">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-left">
            <div className="page-title">
              <RocketOutlined className="page-icon" />
              <div>
                <h1>Investments</h1>
                <p>Manage and track your investment portfolio</p>
              </div>
            </div>
          </div>
          <div className="header-right">
            <button
              className="btn-icon"
              onClick={() => setShowValues(!showValues)}
              aria-label={showValues ? "Hide values" : "Show values"}
            >
              {showValues ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowNewInvestmentModal(true)}
            >
              <PlusOutlined />
              New Investment
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview-grid">
          <div className="stat-card-modern total-invested">
            <div className="stat-icon-container">
              <WalletOutlined />
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Invested</div>
              <div className="stat-value">
                {dashboardData?.wallet?.balance
                  ? formatCompactCurrency(dashboardData.wallet.balance)
                  : formatCompactCurrency(userStats.totalInvested)}
              </div>
              <div className="stat-details">
                <span className="detail-label">Active Investments:</span>
                <span className="detail-value">{userStats.active}</span>
              </div>
            </div>
          </div>

          <div className="stat-card-modern total-returns">
            <div className="stat-icon-container">
              <DollarOutlined />
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Returns</div>
              <div className="stat-value">
                {dashboardData?.profits
                  ? formatCompactCurrency(dashboardData.totalDeposits)
                  : formatCompactCurrency(userStats.totalReturns)}
              </div>
              <div className="stat-details">
                <span className="detail-label">All time</span>
                <span className="detail-value positive">
                  <ArrowUpOutlined /> +
                  {dashboardData?.totalDeposits && dashboardData?.wallet?.balance
                    ? (
                        (dashboardData.totalDeposits / dashboardData.wallet.balance) *
                        100
                      ).toFixed(1)
                    : userStats.totalInvested > 0
                      ? (
                          (userStats.totalReturns / userStats.totalInvested) *
                          100
                        ).toFixed(1)
                      : 0}
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="stat-card-modern portfolio-value">
            <div className="stat-icon-container">
              <LineChartOutlined />
            </div>
            <div className="stat-content">
              <div className="stat-label">Portfolio Value</div>
              <div className="stat-value">
                {dashboardData?.wallet?.balance && dashboardData?.profits
                  ? formatCompactCurrency(
                      dashboardData.wallet.balance + dashboardData.profits,
                    )
                  : formatCompactCurrency(userStats.totalPortfolioValue)}
              </div>
              <div className="stat-details">
                <span className="detail-label">Current Value</span>
                <span className="detail-value positive">
                  <ArrowUpOutlined /> +
                  {dashboardData?.profits && dashboardData?.wallet?.balance
                    ? (
                        (dashboardData.profits / dashboardData.wallet.balance) *
                        100
                      ).toFixed(1)
                    : userStats.totalInvested > 0
                      ? (
                          (userStats.totalReturns / userStats.totalInvested) *
                          100
                        ).toFixed(1)
                      : 0}
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="stat-card-modern average-roi">
            <div className="stat-icon-container">
              <PercentageOutlined />
            </div>
            <div className="stat-content">
              <div className="stat-label">Average ROI</div>
              <div className="stat-value">
                {formatPercentage(userStats.avgROI)}
              </div>
              <div className="stat-details">
                <span className="detail-label">Across all investments</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="main-content-area">
          {/* Investments Panel */}
          <div className="investments-panel">
            <div className="panel-header">
              <div className="panel-title">
                <BarChartOutlined className="panel-icon" />
                <h3>My Investments</h3>
                <span className="investment-count">
                  {investments.length} investments
                </span>
              </div>
              <div className="panel-actions">
                <div className="search-filter-modern">
                  <SearchOutlined />
                  <input
                    type="text"
                    placeholder="Search investments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      className="clear-search"
                      onClick={() => setSearchTerm("")}
                    >
                      ×
                    </button>
                  )}
                </div>
                <button className="btn-refresh" onClick={fetchUserInvestments}>
                  <ReloadOutlined />
                </button>
              </div>
            </div>

            <div className="panel-content">
              {loading ? (
                <div className="loading-state-modern">
                  <LoadingOutlined
                    spin
                    style={{ fontSize: 48, color: "#3b82f6" }}
                  />
                  <p>Loading investments...</p>
                  <small>Getting your investment portfolio</small>
                </div>
              ) : investments.length === 0 ? (
                <div className="coming-soon-state">
                  <ComingSoonPlaceholder
                    message="No investments yet. Start your first investment!"
                    iconSize={64}
                  />
                  <div className="coming-soon-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowNewInvestmentModal(true)}
                    >
                      <PlusOutlined />
                      Start Investing
                    </button>
                  </div>
                </div>
              ) : (
                <div className="investments-grid-modern">
                  {investments.map((investment) => {
                    const planType =
                      investment.plan || investment.investmentType;
                    const planColor = getTypeColor(planType);
                    const status =
                      investment.status || investment.investmentStatus;

                    return (
                      <div
                        key={investment._id}
                        className="investment-card-modern"
                      >
                        <div className="investment-header-modern">
                          <div className="investment-title-section">
                            <div
                              className="plan-icon-container"
                              style={{
                                backgroundColor: `${planColor}20`,
                                color: planColor,
                              }}
                            >
                              {investmentPlans.find((p) => p.id === planType)
                                ?.icon || <DollarOutlined />}
                            </div>
                            <div>
                              <h4>{getPlanName(planType)}</h4>
                              <div className="investment-meta">
                                <span className="investment-id">
                                  ID: {investment._id?.slice(-8)}
                                </span>
                                {getStatusBadge(status)}
                              </div>
                            </div>
                          </div>
                          <div className="investment-amount-section">
                            <span className="amount-main">
                              {formatCurrency(investment.amount)}
                            </span>
                            <span
                              className="roi-badge"
                              style={{
                                backgroundColor: `${planColor}20`,
                                color: planColor,
                              }}
                            >
                              {formatPercentage(investment.roi)} ROI
                            </span>
                          </div>
                        </div>

                        <div className="investment-details-modern">
                          <div className="details-grid">
                            <div className="detail-item-modern">
                              <span className="detail-label">
                                Current Value
                              </span>
                              <span className="detail-value">
                                {formatCurrency(investment.currentValue)}
                              </span>
                            </div>
                            <div className="detail-item-modern">
                              <span className="detail-label">
                                Returns Earned
                              </span>
                              <span className="detail-value profit">
                                {formatCurrency(investment.totalReturns || 0)}
                              </span>
                            </div>
                          </div>

                          <div className="timeline-section">
                            <div className="timeline-header">
                              <CalendarOutlined />
                              <span>Investment Period</span>
                            </div>
                            <div className="timeline-dates">
                              <span className="date">
                                {formatDate(investment.startDate)}
                              </span>
                              <span className="date-separator">→</span>
                              <span className="date">
                                {formatDate(investment.endDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Side Panel - Stats & Tips */}
          <div className="side-panel">
            <div className="stats-panel">
              <div className="panel-header">
                <h3>Investment Stats</h3>
              </div>
              <div className="stats-grid">
                <div className="stat-item-modern">
                  <div className="stat-icon-small active">
                    <ClockCircleOutlined />
                  </div>
                  <div className="stat-content-small">
                    <span className="stat-label-small">Active</span>
                    <span className="stat-value-small">{userStats.active}</span>
                  </div>
                </div>
                <div className="stat-item-modern">
                  <div className="stat-icon-small completed">
                    <CheckCircleOutlined />
                  </div>
                  <div className="stat-content-small">
                    <span className="stat-label-small">Completed</span>
                    <span className="stat-value-small">
                      {userStats.completed}
                    </span>
                  </div>
                </div>
                <div className="stat-item-modern">
                  <div className="stat-icon-small total-deposits">
                    <ArrowDownOutlined />
                  </div>
                  <div className="stat-content-small">
                    <span className="stat-label-small">Total Deposits</span>
                    <span className="stat-value-small">
                      {userStats.totalDeposits}
                    </span>
                  </div>
                </div>
                <div className="stat-item-modern">
                  <div className="stat-icon-small total-investments">
                    <BarChartOutlined />
                  </div>
                  <div className="stat-content-small">
                    <span className="stat-label-small">Total</span>
                    <span className="stat-value-small">
                      {userStats.totalInvestments}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Deposits Panel */}
            <div className="recent-deposits-panel">
              <div className="panel-header">
                <h3>Recent Deposits</h3>
                <span className="deposit-total">
                  {formatCurrency(userStats.totalDepositAmount)}
                </span>
              </div>
              {recentDeposits.length > 0 ? (
                <div className="deposits-list">
                  {recentDeposits.map((deposit, index) => (
                    <div key={deposit._id || index} className="deposit-item">
                      <div className="deposit-icon">
                        <ArrowDownOutlined
                          style={{
                            color: "#10b981",
                            fontSize: "16px",
                          }}
                        />
                      </div>
                      <div className="deposit-info">
                        <div className="deposit-header">
                          <span className="deposit-currency">
                            {deposit.currency || "Crypto"}
                          </span>
                          <span className="deposit-status">
                            {getDepositStatusIcon(deposit.status)}
                            {getDepositStatusText(deposit.status)}
                          </span>
                        </div>
                        <div className="deposit-footer">
                          <span className="deposit-date">
                            {formatDate(deposit.createdAt || deposit.date)}
                          </span>
                          <span className="deposit-amount">
                            {formatCurrency(deposit.requestedAmount || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ComingSoonPlaceholder
                  message="No deposit history"
                  iconSize={32}
                />
              )}
            </div>

            <div className="tips-panel">
              <div className="panel-header">
                <InfoCircleOutlined className="tips-icon" />
                <h3>Investment Tips</h3>
              </div>
              <ul className="tips-list">
                <li>Diversify your investments across different plans</li>
                <li>Monitor your investments regularly for better returns</li>
                <li>Consider reinvesting profits to compound your earnings</li>
                <li>Review your investment strategy periodically</li>
                <li>Contact support if you need help with your investments</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="page-footer">
          <button className="btn-refresh-large" onClick={fetchUserInvestments}>
            <ReloadOutlined />
            Refresh Data
          </button>
        </div>
      </div>

      {/* New Investment Modal */}
      {showNewInvestmentModal && <NewInvestmentModal />}

      {success && (
        <div className="copy-notification">
          Investment created successfully!
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Investments;
