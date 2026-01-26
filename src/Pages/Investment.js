import { useState, useEffect, useMemo } from "react";
import {
  DollarOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  RocketOutlined,
  StarOutlined,
  TrophyOutlined,
  BarChartOutlined,
  QuestionCircleOutlined,
  FundOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import "../styles/Investment.css";
import Header from "../Commponets/Header";
import Footer from "../Commponets/Footer";
import ApiService from "../Commponets/ApiService";
// import ApiServices from "../Commponets/ApiService";

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
  const [activeFilter, setActiveFilter] = useState("all");

  /* ------------------ PLANS ------------------ */
  const investmentPlans = [
    {
      id: "basic",
      name: "Basic Plan",
      minAmount: 100,
      maxAmount: 3000,
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
      maxAmount: 8000,
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
      maxAmount: 15000,
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
      maxAmount: 80000,
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

      const data = await ApiService.getDashboardData();
      setDashboardData(data);

      let apiInvestments = [];

      if (data.investments && Array.isArray(data.investments)) {
        apiInvestments = data.investments.map((inv, index) => {
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

  /* ------------------ FILTER INVESTMENTS ------------------ */
  const filteredInvestments = useMemo(() => {
    let filtered = investments;

    // Apply status filter
    if (activeFilter !== "all") {
      filtered = filtered.filter(
        (inv) => inv.status.toLowerCase() === activeFilter.toLowerCase(),
      );
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.plan?.toLowerCase().includes(term) ||
          inv._id?.toLowerCase().includes(term) ||
          inv.investmentType?.toLowerCase().includes(term),
      );
    }

    return filtered;
  }, [investments, activeFilter, searchTerm]);

  /* ------------------ RECENT DEPOSITS ------------------ */
  const recentDeposits = useMemo(() => {
    if (
      !dashboardData?.transactions ||
      !Array.isArray(dashboardData.transactions)
    ) {
      return [];
    }

    const deposits = dashboardData.transactions
      .filter((txn) => txn.type === "deposit")
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.date || 0) -
          new Date(a.createdAt || a.date || 0),
      )
      .slice(0, 5);

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

  /* ------------------ HELPER FUNCTIONS ------------------ */
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
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
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
  //   switch (status?.toLowerCase()) {
  //     case "confirmed":
  //     case "completed":
  //     case "success":
  //       return <CheckCircleFilled style={{ color: "#10b981" }} />;
  //     case "pending":
  //       return <ClockCircleOutlined style={{ color: "#f59e0b" }} />;
  //     case "failed":
  //     case "cancelled":
  //       return <CloseCircleOutlined style={{ color: "#ef4444" }} />;
  //     default:
  //       return <ClockCircleOutlined style={{ color: "#6b7280" }} />;
  //   }
  // };

  // const getDepositStatusText = (status) => {
  //   switch (status?.toLowerCase()) {
  //     case "confirmed":
  //     case "completed":
  //     case "success":
  //       return "Confirmed";
  //     case "pending":
  //       return "Pending";
  //     case "failed":
  //     case "cancelled":
  //       return "Failed";
  //     default:
  //       return "Processing";
  //   }
  // };

  /* ------------------ CREATE INVESTMENT ------------------ */
  const handleNewInvestment = async ({ amount, startDate, endDate }) => {
    setError("");

    if (!selectedPlan) {
      setError("Please select an investment plan");
      return;
    }

    const plan = investmentPlans.find((p) => p.id === selectedPlan);

    if (!plan) {
      setError("Selected investment plan not found");
      return;
    }

    const value = parseFloat(amount);

    if (isNaN(value) || !startDate || !endDate) {
      setError("All fields are required");
      return;
    }

    if (value <= 0) {
      setError("Investment amount must be greater than 0");
      return;
    }

    if (value < plan.minAmount) {
      setError(`Minimum investment amount is $${plan.minAmount}`);
      return;
    }

    if (value > plan.maxAmount) {
      setError(`Maximum investment amount is $${plan.maxAmount}`);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      setError("Start date cannot be in the past");
      return;
    }

    if (end <= start) {
      setError("End date must be after start date");
      return;
    }

    const durationDays = Math.round((end - start) / (1000 * 60 * 60 * 24));

    if (plan.duration && durationDays < plan.duration) {
      setError(`Minimum investment duration is ${plan.duration} days`);
      return;
    }

    try {
      setLoadingInvestment(true);

      // This is the correct format based on your original function
      const investmentData = {
        amount: value,
        roi: plan.roi,
        investmentType: plan.id,
        planName: plan.name,
        investmentStartDate: startDate,
        investmentEndDate: endDate,
        duration: durationDays,
        expectedReturn: value * (plan.roi / 100),
        // Add userId if required by backend
        userId: localStorage.getItem("userId"),
        // Add other required fields if needed
        ...(plan.planId && { planId: plan.planId }),
      };

      

    

      const result = await ApiService.invest(investmentData);

      if (!result || !result.success) {
        throw new Error(result?.message || "Investment creation failed");
      }

      setShowNewInvestmentModal(false);
      setSelectedPlan("");
      setError("");
      setSuccess(true);
      fetchUserInvestments();

      setTimeout(() => setSuccess(false), 3000);

      if (result.message) {
        // Show notification
        console.log("Success:", result.message);
      }

      return result;
    } catch (err) {
      console.error("Investment creation error details:", err);

      let errorMessage = "Failed to create investment";

      if (err.response) {
        errorMessage = err.response.data?.message || err.response.statusText;
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
      } else if (err.message) {
        // Check for specific error messages
        if (err.message.includes("500")) {
          errorMessage = "Server error. Please try again later.";
        } else if (err.message.includes("401")) {
          errorMessage = "Session expired. Please login again.";
          localStorage.clear();
          window.location.href = "/login";
        } else if (err.message.includes("Network")) {
          errorMessage = "Network error. Please check your connection.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      throw err;
    } finally {
      setLoadingInvestment(false);
    }
  };

  /* ------------------ NEW INVESTMENT MODAL ------------------ */
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
              <RocketOutlined className="modal-title-icon" />
              <h3>Create New Investment</h3>
            </div>
            <button
              className="modal-close-btn"
              onClick={() => setShowNewInvestmentModal(false)}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="modal-error-message">
                  <ExclamationCircleOutlined />
                  <span>{error}</span>
                </div>
              )}

              <div className="plan-selection-section">
                <h4 className="modal-section-title">Select Investment Plan</h4>
                <div className="investment-plans-grid">
                  {investmentPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`investment-plan-card ${
                        selectedPlan === plan.id ? "selected" : ""
                      }`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      <div className="plan-card-header">
                        <div
                          className="plan-icon-container"
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
                            className="plan-roi-badge"
                            style={{ color: plan.color }}
                          >
                            {plan.roi}% ROI
                          </span>
                        </div>
                      </div>
                      <p className="plan-description">{plan.description}</p>
                      <div className="plan-details-grid">
                        <div className="plan-detail">
                          <span className="plan-detail-label">
                            Min Investment
                          </span>
                          <span className="plan-detail-value">
                            {formatInvestCurrency(plan.minAmount)}
                          </span>
                        </div>
                        <div className="plan-detail">
                          <span className="plan-detail-label">Duration</span>
                          <span className="plan-detail-value">
                            {plan.duration} days
                          </span>
                        </div>
                        <div className="plan-detail">
                          <span className="plan-detail-label">
                            Max Investment
                          </span>
                          <span className="plan-detail-value">
                            {formatInvestCurrency(plan.maxAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedPlan && (
                <div className="investment-details-section">
                  <h4 className="modal-section-title">Investment Details</h4>
                  <div className="investment-form-grid">
                    <div className="form-field">
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
                        step="0.01"
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label>Start Date *</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>

                    <div className="form-field">
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
                      <div className="summary-item total-item">
                        <span>Total Investment:</span>
                        <span className="total-amount">
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
                  className="btn-secondary"
                  onClick={() => setShowNewInvestmentModal(false)}
                  disabled={loadingInvestment}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
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
                      <LoadingOutlined className="loading-icon" />
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

  return (
    <div className="investment-portfolio">
      <Header />

      <div className="investment-content">
        {/* Success Notification */}
        {success && (
          <div className="success-notification">
            <CheckCircleOutlined />
            <span>Investment created successfully!</span>
          </div>
        )}

        {/* Page Header */}
        <div className="portfolio-header">
          <div className="header-left-content">
            <div className="header-title-section">
              <div className="title-icon-container">
                <FundOutlined className="title-icon" />
              </div>
              <div>
                <h1 className="portfolio-title">Investment Portfolio</h1>
                <p className="portfolio-subtitle">
                  Manage and track your investment portfolio with precision
                </p>
              </div>
            </div>
          </div>

          <div className="header-actions">
            {/* Mobile New Investment Button */}
            <button
              className="mobile-invest-btn"
              onClick={() => setShowNewInvestmentModal(true)}
              aria-label="New Investment"
            >
              <PlusOutlined />
              <span>New</span>
            </button>

            <button
              className="visibility-toggle"
              onClick={() => setShowValues(!showValues)}
              aria-label={showValues ? "Hide values" : "Show values"}
            >
              {showValues ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            </button>

            {/* <button
              className="primary-action-btn"
              onClick={() => setShowNewInvestmentModal(true)}
            >
              <PlusOutlined />
              New Investment
            </button> */}
          </div>
        </div>

        {/* Stats Overview */}
        {/* <div className="portfolio-stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper total-invested-icon">
              <WalletOutlined />
            </div>
            <div className="stat-content-wrapper">
              <div className="stat-label">Total Invested</div>
              <div className="stat-value">
                {dashboardData?.wallet?.balance
                  ? formatCompactCurrency(dashboardData.wallet.balance)
                  : formatCompactCurrency(userStats.totalInvested)}
              </div>
              <div className="stat-details-row">
                <span className="detail-label">Active:</span>
                <span className="detail-value">{userStats.active}</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper total-returns-icon">
              <DollarOutlined />
            </div>
            <div className="stat-content-wrapper">
              <div className="stat-label">Total Returns</div>
              <div className="stat-value">
                {dashboardData?.profits
                  ? formatCompactCurrency(dashboardData.totalDeposits)
                  : formatCompactCurrency(userStats.totalReturns)}
              </div>
              <div className="stat-details-row">
                <span className="detail-label">Growth:</span>
                <span className="detail-value positive">
                  <ArrowUpOutlined />
                  {dashboardData?.totalDeposits &&
                  dashboardData?.wallet?.balance
                    ? (
                        (dashboardData.totalDeposits /
                          dashboardData.wallet.balance) *
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

          <div className="stat-card">
            <div className="stat-icon-wrapper portfolio-value-icon">
              <LineChartOutlined />
            </div>
            <div className="stat-content-wrapper">
              <div className="stat-label">Portfolio Value</div>
              <div className="stat-value">
                {dashboardData?.wallet?.balance && dashboardData?.profits
                  ? formatCompactCurrency(
                      dashboardData.wallet.balance + dashboardData.profits,
                    )
                  : formatCompactCurrency(userStats.totalPortfolioValue)}
              </div>
              <div className="stat-details-row">
                <span className="detail-label">Current:</span>
                <span className="detail-value positive">
                  <ArrowUpOutlined />
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

          <div className="stat-card">
            <div className="stat-icon-wrapper average-roi-icon">
              <PercentageOutlined />
            </div>
            <div className="stat-content-wrapper">
              <div className="stat-label">Average ROI</div>
              <div className="stat-value">
                {formatPercentage(userStats.avgROI)}
              </div>
              <div className="stat-details-row">
                <span className="detail-label">All Investments</span>
              </div>
            </div>
          </div>
        </div> */}

        {/* Main Content */}
        <div className="portfolio-main-content">
          {/* Investments Section */}
          <div className="investments-section">
            <div className="section-header">
              <div className="section-title-row">
                <BarChartOutlined className="section-icon" />
                <h2 className="section-title">My Investments</h2>
                <span className="investment-count-badge">
                  {filteredInvestments.length} investments
                </span>
              </div>

              <div className="section-controls">
                <div className="search-container">
                  <SearchOutlined className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search investments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      className="clear-search-btn"
                      onClick={() => setSearchTerm("")}
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="filter-tabs">
                  {["all", "active", "completed", "cancelled"].map((filter) => (
                    <button
                      key={filter}
                      className={`filter-tab ${
                        activeFilter === filter ? "active" : ""
                      }`}
                      onClick={() => setActiveFilter(filter)}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>

                <button
                  className="refresh-btn"
                  onClick={fetchUserInvestments}
                  title="Refresh data"
                >
                  <ReloadOutlined />
                </button>
              </div>
            </div>

            <div className="section-content">
              {loading ? (
                <div className="loading-state">
                  <LoadingOutlined spin className="loading-icon-large" />
                  <p className="loading-text">Loading investments...</p>
                  <small className="loading-subtext">
                    Getting your investment portfolio
                  </small>
                </div>
              ) : filteredInvestments.length === 0 ? (
                <div className="empty-state">
                  <ComingSoonPlaceholder
                    message="No investments found"
                    iconSize={64}
                  />
                  <div className="empty-state-actions">
                    <button
                      className="btn-invest-now"
                      onClick={() => setShowNewInvestmentModal(true)}
                    >
                      <PlusOutlined />
                      Start Your First Investment
                    </button>
                  </div>
                </div>
              ) : (
                <div className="investments-grid">
                  {filteredInvestments.map((investment) => {
                    const planType =
                      investment.plan || investment.investmentType;
                    const planColor = getTypeColor(planType);
                    const status =
                      investment.status || investment.investmentStatus;

                    return (
                      <div key={investment._id} className="investment-card">
                        <div className="investment-card-header">
                          <div className="investment-info">
                            <div
                              className="investment-icon-wrapper"
                              style={{
                                backgroundColor: `${planColor}20`,
                                color: planColor,
                              }}
                            >
                              {investmentPlans.find((p) => p.id === planType)
                                ?.icon || <DollarOutlined />}
                            </div>
                            <div className="investment-details">
                              <h3 className="investment-title">
                                {getPlanName(planType)}
                              </h3>
                              <div className="investment-meta">
                                <span className="investment-id">
                                  ID: {investment._id?.slice(-8)}
                                </span>
                                {getStatusBadge(status)}
                              </div>
                            </div>
                          </div>
                          <div className="investment-amount">
                            <div className="amount-value">
                              {formatCurrency(investment.amount)}
                            </div>
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

                        <div className="investment-card-body">
                          <div className="investment-metrics">
                            <div className="metric">
                              <span className="metric-label">
                                Current Value
                              </span>
                              <span className="metric-value">
                                {formatCurrency(investment.currentValue)}
                              </span>
                            </div>
                            <div className="metric">
                              <span className="metric-label">
                                Returns Earned
                              </span>
                              <span className="metric-value profit">
                                {formatCurrency(investment.totalReturns || 0)}
                              </span>
                            </div>
                          </div>

                          <div className="investment-timeline">
                            <div className="timeline-header">
                              <CalendarOutlined />
                              <span>Investment Period</span>
                            </div>
                            <div className="timeline-dates">
                              <span className="timeline-date">
                                {formatDate(investment.startDate)}
                              </span>
                              <span className="timeline-separator">→</span>
                              <span className="timeline-date">
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

          {/* Sidebar */}
          <div className="portfolio-sidebar">
            {/* Quick Stats */}
            <div className="sidebar-card quick-stats">
              <div className="sidebar-card-header">
                <h3 className="sidebar-card-title">Quick Stats</h3>
              </div>
              <div className="stats-grid">
                <div className="quick-stat">
                  <div className="quick-stat-icon active-stat">
                    <ClockCircleOutlined />
                  </div>
                  <div className="quick-stat-content">
                    <span className="quick-stat-label">Active</span>
                    <span className="quick-stat-value">{userStats.active}</span>
                  </div>
                </div>
                <div className="quick-stat">
                  <div className="quick-stat-icon completed-stat">
                    <CheckCircleOutlined />
                  </div>
                  <div className="quick-stat-content">
                    <span className="quick-stat-label">Completed</span>
                    <span className="quick-stat-value">
                      {userStats.completed}
                    </span>
                  </div>
                </div>
                {/* <div className="quick-stat">
                  <div className="quick-stat-icon deposit-stat">
                    <ArrowDownOutlined />
                  </div>
                  <div className="quick-stat-content">
                    <span className="quick-stat-label">Total Deposits</span>
                    <span className="quick-stat-value">
                      {userStats.totalDeposits}
                    </span>
                  </div>
                </div> */}
                <div className="quick-stat">
                  <div className="quick-stat-icon total-stat">
                    <BarChartOutlined />
                  </div>
                  <div className="quick-stat-content">
                    <span className="quick-stat-label">Total</span>
                    <span className="quick-stat-value">
                      {userStats.totalInvestments}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Deposits */}
            {/* <div className="sidebar-card recent-deposits">
              <div className="sidebar-card-header">
                <h3 className="sidebar-card-title">Recent Deposits</h3>
                <span className="deposits-total">
                  {formatCurrency(userStats.totalDepositAmount)}
                </span>
              </div>
              {recentDeposits.length > 0 ? (
                <div className="deposits-list">
                  {recentDeposits.map((deposit, index) => (
                    <div key={deposit._id || index} className="deposit-item">
                      <div className="deposit-icon-wrapper">
                        <ArrowDownOutlined className="deposit-icon" />
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
            </div> */}

            {/* Investment Tips */}
            <div className="sidebar-card investment-tips">
              <div className="sidebar-card-header">
                <InfoCircleOutlined className="tips-icon" />
                <h3 className="sidebar-card-title">Investment Tips</h3>
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
        <div className="portfolio-footer">
          <button className="refresh-large-btn" onClick={fetchUserInvestments}>
            <ReloadOutlined />
            Refresh Portfolio
          </button>
          <div className="last-updated">
            <HistoryOutlined />
            <span>Last updated: Just now</span>
          </div>
        </div>
      </div>

      {/* New Investment Modal */}
      {showNewInvestmentModal && <NewInvestmentModal />}

      <Footer />
    </div>
  );
};

export default Investments;
