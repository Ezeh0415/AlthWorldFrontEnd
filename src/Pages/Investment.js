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
  FilterOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  RocketOutlined,
  StarOutlined,
  TrophyOutlined,
  BarChartOutlined,
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
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showNewInvestmentModal, setShowNewInvestmentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [loadingInvestment, setLoadingInvestment] = useState(false);
  const [error, setError] = useState("");
  const [useMockData, setUseMockData] = useState(false);

  /* ------------------ PLANS ------------------ */
  const investmentPlans = [
    {
      id: "basic",
      name: "Basic Plan",
      minAmount: 100,
      maxAmount: 999,
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
      maxAmount: 1999,
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
      maxAmount: 4999,
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

  /* ------------------ FETCH INVESTMENTS ------------------ */
  const fetchUserInvestments = async () => {
    try {
      setLoading(true);
      setError("");
      setUseMockData(false);

      // Try to fetch from API
      const data = await ApiService.getDashboardData();
      console.log("Investments API Response:", data);

      // Transform API data for investments
      const apiInvestments = data.investments || [];
      setInvestments(apiInvestments);

      if (apiInvestments.length === 0) {
        setUseMockData(true);
        setInvestments(mockInvestments);
      }
    } catch (err) {
      console.error("Failed to fetch investments:", err);
      setError("Failed to load investments");
      setUseMockData(true);
      setInvestments(mockInvestments);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInvestments();
  }, []);

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
  }, [investments]);

  /* ------------------ FILTER ------------------ */
  const filteredInvestments = useMemo(() => {
    return investments.filter((inv) => {
      const matchesSearch =
        !searchTerm ||
        (inv.plan &&
          inv.plan.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (inv.investmentType &&
          inv.investmentType
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (inv._id && inv._id.toString().includes(searchTerm));

      const status = inv.status || inv.investmentStatus;
      const matchesStatus = filterStatus === "all" || status === filterStatus;

      const type = inv.plan || inv.investmentType;
      const matchesType = filterType === "all" || type === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [investments, searchTerm, filterStatus, filterType]);

  /* ------------------ HELPERS ------------------ */
  const formatCurrency = (v) => {
    if (!showValues) return "₦●●●●";
    const amount = v || 0;
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompactCurrency = (v) => {
    const amount = v || 0;
    if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `₦${(amount / 1000).toFixed(1)}K`;
    return `₦${amount}`;
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

  const calculateDaysLeft = (endDate) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const calculateProgress = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    const totalDuration = end - start;
    const elapsed = now - start;

    if (elapsed <= 0) return 0;
    if (elapsed >= totalDuration) return 100;

    return Math.round((elapsed / totalDuration) * 100);
  };

  /* ------------------ CREATE INVESTMENT ------------------ */
  const handleNewInvestment = async ({ amount, startDate, endDate }) => {
    setError("");

    const plan = investmentPlans.find((p) => p.id === selectedPlan);
    const value = Number(amount);

    if (!plan || !value || !startDate || !endDate) {
      setError("All fields are required");
      return;
    }

    if (value < plan.minAmount || value > plan.maxAmount) {
      setError(
        `Amount must be between ${formatCurrency(
          plan.minAmount
        )} and ${formatCurrency(plan.maxAmount)}`
      );
      return;
    }

    try {
      setLoadingInvestment(true);

      const newInvestment = {
        _id: `inv-${Date.now()}`,
        plan: plan.id,
        investmentType: plan.id,
        status: "active",
        amount: value,
        roi: plan.roi,
        totalReturns: 0,
        currentValue: value,
        startDate: startDate,
        endDate: endDate,
        createdAt: new Date().toISOString(),
      };

      // In real app, you would send to API
      // await ApiService.createInvestment(newInvestment);

      setInvestments((prev) => [newInvestment, ...prev]);
      setShowNewInvestmentModal(false);
      setSelectedPlan("");
      setError("");
    } catch (err) {
      setError("Failed to create investment. Please try again.");
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
                            {formatCurrency(plan.minAmount)}
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
                            {formatCurrency(plan.maxAmount)}
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
                        placeholder={`Enter amount between ${formatCurrency(
                          investmentPlans.find((p) => p.id === selectedPlan)
                            .minAmount
                        )} and ${formatCurrency(
                          investmentPlans.find((p) => p.id === selectedPlan)
                            .maxAmount
                        )}`}
                        min={
                          investmentPlans.find((p) => p.id === selectedPlan)
                            .minAmount
                        }
                        max={
                          investmentPlans.find((p) => p.id === selectedPlan)
                            .maxAmount
                        }
                        step="100"
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
                              (1000 * 60 * 60 * 24)
                          )}{" "}
                          days
                        </span>
                      </div>
                      <div className="summary-item total">
                        <span>Total Investment:</span>
                        <span className="total-investment">
                          {amount ? formatCurrency(parseFloat(amount)) : "₦0"}
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

      {useMockData && (
        <div className="mock-data-banner">
          <ExclamationCircleOutlined style={{ color: "#f59e0b" }} />
          <span>Showing demo investment data</span>
          <button
            className="btn-retry"
            onClick={fetchUserInvestments}
            title="Retry connection"
          >
            <ReloadOutlined />
          </button>
        </div>
      )}

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
                {formatCompactCurrency(userStats.totalInvested)}
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
                {formatCompactCurrency(userStats.totalReturns)}
              </div>
              <div className="stat-details">
                <span className="detail-label">All time</span>
                <span className="detail-value positive">
                  <ArrowUpOutlined /> +
                  {userStats.totalInvested > 0
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
                {formatCompactCurrency(userStats.totalPortfolioValue)}
              </div>
              <div className="stat-details">
                <span className="detail-label">Current Value</span>
                <span className="detail-value positive">
                  <ArrowUpOutlined /> +
                  {userStats.totalInvested > 0
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
                  {filteredInvestments.length} investments
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

            <div className="filters-section">
              <div className="filter-group-modern">
                <FilterOutlined />
                <span>Filter by Status</span>
                <div className="filter-buttons-modern">
                  <button
                    className={`filter-btn ${
                      filterStatus === "all" ? "active" : ""
                    }`}
                    onClick={() => setFilterStatus("all")}
                  >
                    All
                  </button>
                  <button
                    className={`filter-btn ${
                      filterStatus === "active" ? "active" : ""
                    }`}
                    onClick={() => setFilterStatus("active")}
                  >
                    Active
                  </button>
                  <button
                    className={`filter-btn ${
                      filterStatus === "completed" ? "active" : ""
                    }`}
                    onClick={() => setFilterStatus("completed")}
                  >
                    Completed
                  </button>
                </div>
              </div>
              <div className="filter-group-modern">
                <FilterOutlined />
                <span>Filter by Plan</span>
                <div className="filter-buttons-modern">
                  <button
                    className={`filter-btn ${
                      filterType === "all" ? "active" : ""
                    }`}
                    onClick={() => setFilterType("all")}
                  >
                    All
                  </button>
                  {["basic", "standard", "premium", "ultimate"].map((type) => (
                    <button
                      key={type}
                      className={`filter-btn ${
                        filterType === type ? "active" : ""
                      }`}
                      onClick={() => setFilterType(type)}
                    >
                      {getPlanName(type)}
                    </button>
                  ))}
                </div>
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
              ) : filteredInvestments.length > 0 ? (
                <div className="investments-grid-modern">
                  {filteredInvestments.map((investment) => {
                    const daysLeft = calculateDaysLeft(
                      investment.endDate || investment.investmentEndDate
                    );
                    const progress = calculateProgress(
                      investment.startDate || investment.investmentStartDate,
                      investment.endDate || investment.investmentEndDate
                    );
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
                                {formatCurrency(
                                  investment.currentValue ||
                                    investment.amount +
                                      (investment.totalReturns || 0)
                                )}
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
                                {formatDate(
                                  investment.startDate ||
                                    investment.investmentStartDate
                                )}
                              </span>
                              <span className="date-separator">→</span>
                              <span className="date">
                                {formatDate(
                                  investment.endDate ||
                                    investment.investmentEndDate
                                )}
                              </span>
                            </div>
                            <div className="days-left">
                              {daysLeft > 0
                                ? `${daysLeft} days left`
                                : "Completed"}
                            </div>
                          </div>

                          <div className="progress-section-modern">
                            <div className="progress-header">
                              <span>Progress</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="progress-bar-modern">
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${progress}%`,
                                  backgroundColor: planColor,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state-modern">
                  <WalletOutlined className="empty-icon" />
                  <h4>No investments found</h4>
                  <p>
                    Start your investment journey by creating your first
                    investment!
                  </p>
                  <div className="empty-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowNewInvestmentModal(true)}
                    >
                      <PlusOutlined />
                      Start Investing
                    </button>
                  </div>
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
                  <div className="stat-icon-small cancelled">
                    <CloseCircleOutlined />
                  </div>
                  <div className="stat-content-small">
                    <span className="stat-label-small">Cancelled</span>
                    <span className="stat-value-small">
                      {userStats.cancelled}
                    </span>
                  </div>
                </div>
                <div className="stat-item-modern">
                  <div className="stat-icon-small total">
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
          {useMockData && (
            <div className="data-status">
              <span className="status-indicator"></span>
              <span>Demo data • Refreshed just now</span>
            </div>
          )}
        </div>
      </div>

      {/* New Investment Modal */}
      {showNewInvestmentModal && <NewInvestmentModal />}

      {/* Footer */}
      <Footer />
    </div>
  );
};

/* ------------------ MOCK DATA ------------------ */
const mockInvestments = [
  {
    _id: "inv-001",
    amount: 50000,
    roi: 15,
    plan: "basic",
    investmentType: "basic",
    status: "active",
    totalReturns: 7500,
    currentValue: 57500,
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    createdAt: "2024-01-15T14:30:00Z",
  },
  {
    _id: "inv-002",
    amount: 100000,
    roi: 10,
    plan: "standard",
    investmentType: "standard",
    status: "completed",
    totalReturns: 10000,
    currentValue: 110000,
    startDate: "2024-01-10",
    endDate: "2024-02-09",
    createdAt: "2024-01-10T09:15:00Z",
  },
  {
    _id: "inv-003",
    amount: 200000,
    roi: 25,
    plan: "premium",
    investmentType: "premium",
    status: "active",
    totalReturns: 50000,
    currentValue: 250000,
    startDate: "2024-01-20",
    endDate: "2024-04-20",
    createdAt: "2024-01-20T11:45:00Z",
  },
  {
    _id: "inv-004",
    amount: 30000,
    roi: 18,
    plan: "standard",
    investmentType: "standard",
    status: "cancelled",
    totalReturns: 2700,
    currentValue: 32700,
    startDate: "2023-12-05",
    endDate: "2024-01-03",
    createdAt: "2023-12-05T16:20:00Z",
  },
  {
    _id: "inv-005",
    amount: 500000,
    roi: 30,
    plan: "ultimate",
    investmentType: "ultimate",
    status: "active",
    totalReturns: 150000,
    currentValue: 650000,
    startDate: "2024-01-01",
    endDate: "2024-04-01",
    createdAt: "2024-01-01T00:00:00Z",
  },
];

export default Investments;
