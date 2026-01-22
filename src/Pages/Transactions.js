import { useState, useEffect } from "react";
import {
  SearchOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  HistoryOutlined,
  WalletOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  FilterOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  MenuOutlined,
  CloseOutlined,
  CreditCardOutlined,
  BankOutlined,
} from "@ant-design/icons";
import "../styles/Transactions.css";
import Header from "../Commponets/Header";
import Footer from "../Commponets/Footer";
import ApiServices from "../Commponets/ApiService";
import { useNavigate } from "react-router-dom";

const Transactions = () => {
  // State Management
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showValues, setShowValues] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showNewWithdrawModal, setShowNewWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const navigate = useNavigate();

  // REAL DATA STATES
  const [userBalance, setUserBalance] = useState({
    total: 0,
    available: 0,
    invested: 0,
    pending: 0,
    currency: "USD",
  });
  const [dashboardData, setDashboardData] = useState(null);

  // Filter options
  const filterOptions = [
    { id: "all", label: "All", icon: <FilterOutlined /> },
    {
      id: "deposit",
      label: "Deposits",
      color: "#10B981",
      icon: <ArrowDownOutlined />,
    },
    {
      id: "withdraw",
      label: "Withdrawals",
      color: "#EF4444",
      icon: <ArrowUpOutlined />,
    },
    {
      id: "profit",
      label: "Profits",
      color: "#8B5CF6",
      icon: <DollarOutlined />,
    },
  ];

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Fetch user transactions and balance
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const dashboardResponse = await ApiServices.getDashboardData();
        console.log("Dashboard response:", dashboardResponse);
        setDashboardData(dashboardResponse);

        if (dashboardResponse?.wallet) {
          const wallet = dashboardResponse.wallet;

          // Calculate balances properly
          const availableBalance = wallet.balance || 0;
          const investedBalance = wallet.invBalance || 0;
          const pendingAmount = Math.abs(wallet.pending) || 0;
          const totalBalance =
            availableBalance + investedBalance + pendingAmount;

          setUserBalance({
            total: totalBalance,
            available: availableBalance,
            invested: investedBalance,
            pending: pendingAmount,
            currency: "USD",
          });
        }

        let transactionsData = [];
        if (
          dashboardResponse?.transactions &&
          Array.isArray(dashboardResponse.transactions)
        ) {
          transactionsData = dashboardResponse.transactions;
        } else if (dashboardResponse?.data?.transactions) {
          transactionsData = dashboardResponse.data.transactions;
        }

        if (transactionsData.length > 0) {
          const formattedTransactions = transactionsData.map((tx, index) => {
            // Extract amount from different possible fields
            let amount = 0;
            if (tx.amount !== undefined) amount = tx.amount;
            else if (tx.requestedAmount !== undefined)
              amount = tx.requestedAmount;
            else if (tx.creditedAmount !== undefined)
              amount = tx.creditedAmount;

            // Ensure amount is positive
            amount = Math.abs(parseFloat(amount) || 0);

            // Determine transaction type
            let type = "deposit";
            if (tx.type) type = tx.type.toLowerCase();
            else if (tx.transactionType)
              type = tx.transactionType.toLowerCase();
            else if (amount < 0) type = "withdraw";

            // Determine status
            let status = "completed";
            if (tx.status) status = tx.status.toLowerCase();
            else if (tx.transactionStatus)
              status = tx.transactionStatus.toLowerCase();

            // Determine payment method icon
            let paymentIcon = <BankOutlined />;
            if (tx.paymentMethod) {
              if (
                tx.paymentMethod.toLowerCase().includes("crypto") ||
                tx.paymentMethod.toLowerCase().includes("wallet")
              ) {
                paymentIcon = <WalletOutlined />;
              } else if (tx.paymentMethod.toLowerCase().includes("card")) {
                paymentIcon = <CreditCardOutlined />;
              }
            }

            return {
              _id: tx._id || tx.id || `tx-${Date.now()}-${index}`,
              type: type,
              currency: tx.currency || "USD",
              amount: amount,
              requestedAmount: amount,
              creditedAmount: amount,
              status: status,
              createdAt:
                tx.createdAt ||
                tx.date ||
                tx.transactionDate ||
                new Date().toISOString(),
              description:
                tx.description ||
                (type === "deposit"
                  ? "Funds Deposit"
                  : type === "withdraw"
                    ? "Funds Withdrawal"
                    : type === "profit"
                      ? "Investment Returns"
                      : "Transaction"),
              paymentMethod:
                tx.paymentMethod || tx.paymentType || "Bank Transfer",
              paymentIcon: paymentIcon,
              transactionHash:
                tx.transactionHash ||
                tx.transactionId ||
                tx.reference ||
                tx._id,
              reference: tx.reference || `REF-${tx._id?.substring(0, 8)}`,
            };
          });

          // Sort by date (newest first)
          formattedTransactions.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          );

          setTransactions(formattedTransactions);
          setFilteredTransactions(formattedTransactions);
        } else {
          setTransactions([]);
          setFilteredTransactions([]);
        }

        setLoading(false);
      } catch (error) {
        setLoading(false);
        setTransactions([]);
        setFilteredTransactions([]);
      }
    };

    fetchUserData();
  }, []);

  // Filter transactions
  useEffect(() => {
    let result = transactions;

    if (activeFilter !== "all") {
      result = result.filter((tx) => tx.type === activeFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.description?.toLowerCase().includes(term) ||
          tx.reference?.toLowerCase().includes(term) ||
          tx.paymentMethod?.toLowerCase().includes(term) ||
          tx.transactionHash?.toLowerCase().includes(term) ||
          tx._id?.toLowerCase().includes(term) ||
          tx.type?.toLowerCase().includes(term) ||
          tx.status?.toLowerCase().includes(term) ||
          tx.amount?.toString().includes(term),
      );
    }

    setFilteredTransactions(result);
  }, [searchTerm, activeFilter, transactions]);

  // Calculate statistics
  const calculateStats = () => {
    const stats = {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalProfits: 0,
      pendingDeposits: 0,
      pendingWithdrawals: 0,
      totalCompleted: 0,
    };

    transactions.forEach((tx) => {
      const amount = tx.amount || 0;

      if (tx.type === "deposit") {
        stats.totalDeposits += amount;
        if (tx.status === "pending") stats.pendingDeposits++;
      } else if (tx.type === "withdraw") {
        stats.totalWithdrawals += amount;
        if (tx.status === "pending") stats.pendingWithdrawals++;
      } else if (tx.type === "profit") {
        stats.totalProfits += amount;
      }

      if (
        tx.status === "completed" ||
        tx.status === "success" ||
        tx.status === "approved"
      ) {
        stats.totalCompleted++;
      }
    });

    return stats;
  };

  const userStats = calculateStats();

  // Format currency
  const formatCurrency = (amount) => {
    if (!showValues) return "••••••";
    if (amount === undefined || amount === null) return "$0";
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return "$0";

    const amountInDollars = amount / 100;

    // if (isMobileView && amountInDollars > 9999) {
    //   return `$${(amountInDollars / 1000).toFixed(1)}K`;
    // }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amountInDollars);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";

      if (isMobileView) {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }

      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const config = {
      completed: {
        label: isMobileView ? "Done" : "Completed",
        color: "#10B981",
        icon: <CheckCircleOutlined />,
      },
      success: {
        label: isMobileView ? "Done" : "Completed",
        color: "#10B981",
        icon: <CheckCircleOutlined />,
      },
      approved: {
        label: isMobileView ? "Done" : "Completed",
        color: "#10B981",
        icon: <CheckCircleOutlined />,
      },
      pending: {
        label: "Pending",
        color: "#F59E0B",
        icon: <ClockCircleOutlined />,
      },
      processing: {
        label: isMobileView ? "Proc" : "Processing",
        color: "#3B82F6",
        icon: <ClockCircleOutlined />,
      },
      canceled: {
        label: isMobileView ? "Cancel" : "Canceled",
        color: "#EF4444",
        icon: <CloseCircleOutlined />,
      },
      cancelled: {
        label: isMobileView ? "Cancel" : "Canceled",
        color: "#EF4444",
        icon: <CloseCircleOutlined />,
      },
      failed: {
        label: "Failed",
        color: "#DC2626",
        icon: <CloseCircleOutlined />,
      },
      rejected: {
        label: "Failed",
        color: "#DC2626",
        icon: <CloseCircleOutlined />,
      },
    };

    const { label, color, icon } = config[status] || {
      label: status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown",
      color: "#6B7280",
      icon: <InfoCircleOutlined />,
    };

    return (
      <span
        className="status-badge"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {!isMobileView && icon}
        {label}
      </span>
    );
  };

  // Type icon component
  const TypeIcon = ({ type }) => {
    const config = {
      deposit: {
        color: "#10B981",
        icon: <ArrowDownOutlined />,
        bgColor: "#10B98115",
      },
      withdraw: {
        color: "#EF4444",
        icon: <ArrowUpOutlined />,
        bgColor: "#EF444415",
      },
      withdrawal: {
        color: "#EF4444",
        icon: <ArrowUpOutlined />,
        bgColor: "#EF444415",
      },
      profit: {
        color: "#8B5CF6",
        icon: <DollarOutlined />,
        bgColor: "#8B5CF615",
      },
      earning: {
        color: "#8B5CF6",
        icon: <DollarOutlined />,
        bgColor: "#8B5CF615",
      },
      interest: {
        color: "#8B5CF6",
        icon: <DollarOutlined />,
        bgColor: "#8B5CF615",
      },
    };

    const { color, icon, bgColor } = config[type] || {
      color: "#6B7280",
      icon: <DollarOutlined />,
      bgColor: "#6B728015",
    };

    return (
      <div
        className="transaction-type-icon"
        style={{
          backgroundColor: bgColor,
          color: color,
        }}
      >
        {icon}
      </div>
    );
  };

  // Copy to clipboard
  const copyToClipboard = (text, id) => {
    if (!text) return;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        alert("Failed to copy to clipboard");
      });
  };

  // Refresh transactions
  const refreshTransactions = async () => {
    setLoading(true);
    try {
      const dashboardResponse = await ApiServices.getDashboardData();
      setDashboardData(dashboardResponse);

      if (dashboardResponse?.wallet) {
        const wallet = dashboardResponse.wallet;
        const availableBalance = wallet.balance || 0;
        const investedBalance = wallet.invBalance || 0;
        const pendingAmount = Math.abs(wallet.pending) || 0;
        const totalBalance = availableBalance + investedBalance + pendingAmount;

        setUserBalance({
          total: totalBalance,
          available: availableBalance,
          invested: investedBalance,
          pending: pendingAmount,
          currency: "USD",
        });
      }

      let transactionsData = [];
      if (
        dashboardResponse?.transactions &&
        Array.isArray(dashboardResponse.transactions)
      ) {
        transactionsData = dashboardResponse.transactions;
      }

      if (transactionsData.length > 0) {
        const formattedTransactions = transactionsData.map((tx, index) => {
          let amount =
            tx.amount || tx.requestedAmount || tx.creditedAmount || 0;
          amount = Math.abs(parseFloat(amount) || 0);

          let type = "deposit";
          if (tx.type) type = tx.type.toLowerCase();
          else if (tx.transactionType) type = tx.transactionType.toLowerCase();

          let status = tx.status?.toLowerCase() || "completed";

          return {
            _id: tx._id || `tx-${Date.now()}-${index}`,
            type,
            currency: tx.currency || "USD",
            amount,
            status,
            createdAt: tx.createdAt || tx.date || new Date().toISOString(),
            description:
              tx.description ||
              (type === "deposit"
                ? "Funds Deposit"
                : type === "withdraw"
                  ? "Funds Withdrawal"
                  : type === "profit"
                    ? "Investment Returns"
                    : "Transaction"),
            paymentMethod: tx.paymentMethod || "Bank Transfer",
            transactionHash: tx.transactionHash || tx.transactionId || tx._id,
            reference: tx.reference || `REF-${tx._id?.substring(0, 8)}`,
          };
        });

        formattedTransactions.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setTransactions(formattedTransactions);
        setFilteredTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error("Error refreshing transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Transaction Card Component
  const TransactionCard = ({ transaction }) => {
    const {
      _id,
      type,
      amount,
      status,
      createdAt,
      description,
      reference,
      paymentMethod,
      transactionHash,
      paymentIcon,
      currency,
    } = transaction;

    const amountInDollars = amount / 100;

    return (
      <div className="transaction-card" key={_id}>
        <div className="transaction-card-header">
          <div className="transaction-header-left">
            <TypeIcon type={type} />
            <div className="transaction-title">
              <h4>{description}</h4>
              <div className="transaction-meta">
                <span className="transaction-ref">{reference}</span>
                <span className="transaction-method">
                  {paymentIcon} {paymentMethod}
                </span>
              </div>
            </div>
          </div>
          <div className="transaction-header-right">
            <div className={`transaction-amount ${type}`}>
              {type === "deposit" || type === "profit" ? "+" : "-"}
              {showValues ? formatCurrency(amount) : "••••••"}
            </div>
            <StatusBadge status={status} />
          </div>
        </div>

        <div className="transaction-card-body">
          <div className="transaction-details">
            <div className="detail-item">
              <span className="detail-label">Date & Time</span>
              <span className="detail-value">{formatDate(createdAt)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Transaction ID</span>
              <span
                className={`detail-value clickable ${copiedId === _id ? "copied" : ""}`}
                onClick={() => copyToClipboard(transactionHash, _id)}
              >
                <CopyOutlined /> {transactionHash?.substring(0, 10)}...
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Currency</span>
              <span className="detail-value">{currency}</span>
            </div>
            {!isMobileView && (
              <div className="detail-item">
                <span className="detail-label">Exact Amount</span>
                <span className="detail-value">
                  {showValues ? `$${amountInDollars.toFixed(2)}` : "••••••"}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="transaction-card-footer">
          <button
            className="btn-text details-btn"
            onClick={() =>
              alert(
                `Transaction Details\n\n` +
                  `ID: ${_id}\n` +
                  `Type: ${type}\n` +
                  `Amount: ${formatCurrency(amount)}\n` +
                  `Exact Amount: $${amountInDollars.toFixed(2)}\n` +
                  `Status: ${status}\n` +
                  `Date: ${formatDate(createdAt)}\n` +
                  `Description: ${description}\n` +
                  `Payment Method: ${paymentMethod}\n` +
                  `Currency: ${currency || "USD"}`,
              )
            }
          >
            <InfoCircleOutlined /> View Full Details
          </button>
        </div>
      </div>
    );
  };

  // Withdraw Modal
  const WithdrawModal = () => (
    <div
      className="modal-overlay"
      onClick={() => setShowNewWithdrawModal(false)}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Request Withdrawal</h3>
          <button
            className="close-btn"
            onClick={() => setShowNewWithdrawModal(false)}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="balance-info-card">
            <div className="balance-info-item">
              <span>Available Balance</span>
              <span className="balance-amount">
                {formatCurrency(userBalance.available)}
              </span>
            </div>
            {userBalance.pending > 0 && (
              <div className="balance-info-item pending">
                <span>Pending Transactions</span>
                <span className="balance-amount">
                  {formatCurrency(userBalance.pending)}
                </span>
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Amount (USD)</label>
            <div className="amount-input-group">
              <span className="currency-prefix">$</span>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                min="10"
                max={userBalance.available / 100}
                step="0.01"
              />
            </div>
            <div className="form-hints">
              <small>
                Min: $10 • Max: {formatCurrency(userBalance.available)}
              </small>
              <button
                className="btn-text"
                onClick={() => setWithdrawAmount(userBalance.available / 100)}
                style={{ marginLeft: "10px" }}
              >
                Withdraw All
              </button>
            </div>
          </div>

          {!isMobileView && (
            <div className="payment-methods">
              <h4>Select Withdrawal Method</h4>
              <div className="method-options">
                <label className="method-option">
                  <input type="radio" name="withdraw-method" defaultChecked />
                  <WalletOutlined />
                  <span>Crypto Wallet</span>
                </label>
                <label className="method-option">
                  <input type="radio" name="withdraw-method" />
                  <DollarOutlined />
                  <span>Bank Transfer</span>
                </label>
              </div>
            </div>
          )}

          <div className="withdrawal-info">
            <QuestionCircleOutlined />
            <p>
              Withdrawals are processed within 24-48 hours. A small fee may
              apply.
            </p>
          </div>

          <div className="modal-actions">
            <button
              className="btn btn-outline"
              onClick={() => setShowNewWithdrawModal(false)}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleNewWithdrawal}>
              Request Withdrawal
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Handle withdrawal
  const handleNewWithdrawal = async () => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (withdrawAmount < 10) {
      alert("Minimum withdrawal is $10");
      return;
    }

    if (withdrawAmount > userBalance.available / 100) {
      alert(
        `Insufficient available balance. Available: ${formatCurrency(userBalance.available)}`,
      );
      return;
    }

    try {
      const withdrawalData = {
        amount: parseFloat(withdrawAmount) * 100,
        currency: "USD",
        withdrawalMethod: "bank_transfer",
      };

      const result = await ApiServices.createWithdrawal(withdrawalData);

      if (result.success || result._id) {
        const dashboardResponse = await ApiServices.getDashboardData();
        setDashboardData(dashboardResponse);

        if (dashboardResponse?.wallet) {
          const wallet = dashboardResponse.wallet;
          const availableBalance = wallet.balance || 0;
          const investedBalance = wallet.invBalance || 0;
          const pendingAmount = Math.abs(wallet.pending) || 0;
          const totalBalance =
            availableBalance + investedBalance + pendingAmount;

          setUserBalance({
            total: totalBalance,
            available: availableBalance,
            invested: investedBalance,
            pending: pendingAmount,
          });
        }

        setWithdrawAmount("");
        setShowNewWithdrawModal(false);
        alert("Withdrawal request submitted successfully!");
      } else {
        alert(result.message || "Failed to create withdrawal");
      }
    } catch (error) {
      console.error("Error creating withdrawal:", error);
      alert(error.message || "Failed to create withdrawal request");
    }
  };

  return (
    <div className="transactions-page">
      <Header />

      {/* Mobile Header */}
      {isMobileView && (
        <div className="mobile-top-bar">
          <button
            className="menu-toggle"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <CloseOutlined /> : <MenuOutlined />}
          </button>
          <h1 className="mobile-title">Transactions</h1>
          <button
            className="eye-toggle"
            onClick={() => setShowValues(!showValues)}
          >
            {showValues ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          </button>
        </div>
      )}

      {/* Mobile Filter Menu */}
      {isMobileView && showMobileMenu && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu">
            <div className="mobile-menu-header">
              <h3>Filters</h3>
              <button
                className="close-btn"
                onClick={() => setShowMobileMenu(false)}
              >
                ×
              </button>
            </div>
            <div className="mobile-filter-options">
              {filterOptions.map((filter) => (
                <button
                  key={filter.id}
                  className={`mobile-filter-option ${activeFilter === filter.id ? "active" : ""}`}
                  onClick={() => {
                    setActiveFilter(filter.id);
                    setShowMobileMenu(false);
                  }}
                >
                  <span className="filter-icon">{filter.icon}</span>
                  <span className="filter-label">{filter.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="transactions-content">
        {/* Desktop Header */}
        {!isMobileView && (
          <div className="page-header">
            <div className="header-content">
              <h1>Transaction History</h1>
              <p className="page-subtitle">
                Track all your deposits, withdrawals, and investment returns
              </p>
              <div className="account-status">
                Account Status:{" "}
                <span
                  className={
                    dashboardData?.accountStatus?._id
                      ? "status-active"
                      : "status-inactive"
                  }
                >
                  {dashboardData?.accountStatus?._id ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div className="header-actions">
              <button
                className="btn btn-icon"
                onClick={() => setShowValues(!showValues)}
              >
                {showValues ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              </button>
              {/* <button
                className="btn btn-icon"
                onClick={() => alert("Export feature coming soon!")}
              >
                <DownloadOutlined />
              </button> */}
              <button
                className="btn btn-icon"
                onClick={refreshTransactions}
                disabled={loading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Balance Overview - Responsive Grid */}
        <div
          className={`balance-overview-cards ${isMobileView ? "mobile-layout" : "desktop-layout"}`}
        >
          <div className="balance-card total">
            <div className="balance-card-header">
              <div className="balance-icon">
                <WalletOutlined />
              </div>
              <div>
                <h3>Total Balance</h3>
                <div className="balance-amount">
                  {formatCurrency(userBalance.total)}
                </div>
              </div>
            </div>
            <div className="balance-details">
              <div className="detail-row">
                <span className="detail-label">Available</span>
                <span className="detail-value">
                  {formatCurrency(userBalance.available)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Invested</span>
                <span className="detail-value">
                  {formatCurrency(userBalance.invested)}
                </span>
              </div>
              {userBalance.pending > 0 && (
                <div className="detail-row">
                  <span className="detail-label">Pending</span>
                  <span className="detail-value pending">
                    {formatCurrency(userBalance.pending)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {!isMobileView ? (
            <div className="stats-card">
              <h3>Summary</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-icon deposit">
                    <ArrowDownOutlined />
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">Total Deposits</div>
                    <div className="stat-value">
                      {formatCurrency(userStats.totalDeposits)}
                    </div>
                    <div className="stat-subtext">
                      {userStats.pendingDeposits} pending
                    </div>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon withdraw">
                    <ArrowUpOutlined />
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">Total Withdrawals</div>
                    <div className="stat-value">
                      {formatCurrency(userStats.totalWithdrawals)}
                    </div>
                    <div className="stat-subtext">
                      {userStats.pendingWithdrawals} pending
                    </div>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon profit">
                    <DollarOutlined />
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">Total Profits</div>
                    <div className="stat-value">
                      {formatCurrency(userStats.totalProfits)}
                    </div>
                    <div className="stat-subtext">
                      From {dashboardData?.investments?.length || 0} investments
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mobile-stats-card">
              <div className="mobile-stats-row">
                <div className="mobile-stat">
                  <div className="mobile-stat-icon deposit">
                    <ArrowDownOutlined />
                  </div>
                  <div className="mobile-stat-content">
                    <div className="mobile-stat-label">Deposits</div>
                    <div className="mobile-stat-value">
                      {formatCurrency(userStats.totalDeposits)}
                    </div>
                  </div>
                </div>
                <div className="mobile-stat">
                  <div className="mobile-stat-icon withdraw">
                    <ArrowUpOutlined />
                  </div>
                  <div className="mobile-stat-content">
                    <div className="mobile-stat-label">Withdrawals</div>
                    <div className="mobile-stat-value">
                      {formatCurrency(userStats.totalWithdrawals)}
                    </div>
                  </div>
                </div>
                <div className="mobile-stat">
                  <div className="mobile-stat-icon profit">
                    <DollarOutlined />
                  </div>
                  <div className="mobile-stat-content">
                    <div className="mobile-stat-label">Profits</div>
                    <div className="mobile-stat-value">
                      {formatCurrency(userStats.totalProfits)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="actions-card">
            <h3>{isMobileView ? "Actions" : "Quick Actions"}</h3>
            <div className="action-buttons">
              <button
                className="btn btn-success"
                onClick={() => navigate("/deposit")}
              >
                <ArrowDownOutlined />
                <span>{isMobileView ? "Deposit" : "Deposit Funds"}</span>
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/withdrawal")}
                disabled={userBalance.available <= 0}
              >
                <ArrowUpOutlined />
                <span>{isMobileView ? "Withdraw" : "Withdraw Funds"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="filters-section">
          <div className="search-container">
            <SearchOutlined />
            <input
              type="text"
              placeholder={
                isMobileView
                  ? "Search transactions..."
                  : "Search transactions by reference, amount, or description..."
              }
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

          {!isMobileView && (
            <div className="filter-tabs">
              {filterOptions.map((filter) => (
                <button
                  key={filter.id}
                  className={`filter-tab ${activeFilter === filter.id ? "active" : ""}`}
                  onClick={() => setActiveFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          )}

          <div className="results-info">
            <span className="results-count">
              {filteredTransactions.length} transactions
            </span>
            {(searchTerm || activeFilter !== "all") && (
              <button
                className="btn-text"
                onClick={() => {
                  setSearchTerm("");
                  setActiveFilter("all");
                }}
              >
                Clear filters
              </button>
            )}
            {!isMobileView && (
              <button
                className="btn-text"
                onClick={refreshTransactions}
                disabled={loading}
              >
                Refresh Data
              </button>
            )}
          </div>
        </div>

        {/* Transaction Cards Container */}
        <div className="transactions-cards-section">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading your transactions...</p>
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div
              className={`transactions-grid ${isMobileView ? "mobile-grid" : "desktop-grid"}`}
            >
              {filteredTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction._id}
                  transaction={transaction}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <HistoryOutlined />
              </div>
              <h3>No transactions found</h3>
              <p>
                {transactions.length === 0
                  ? "You haven't made any transactions yet. Start by making your first deposit!"
                  : "No transactions match your current filters."}
              </p>
              <div className="empty-state-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/deposit")}
                >
                  <PlusOutlined />
                  Make First Deposit
                </button>
                {(searchTerm || activeFilter !== "all") && (
                  <button
                    className="btn btn-outline"
                    onClick={() => {
                      setSearchTerm("");
                      setActiveFilter("all");
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        {!isMobileView && (
          <div className="help-section">
            <div className="help-header">
              <QuestionCircleOutlined />
              <h3>Need Help?</h3>
            </div>
            <div className="help-content">
              <div className="help-item">
                <strong>Processing Times</strong>
                <p>Deposits: 1-2 hours • Withdrawals: 24-48 hours</p>
              </div>
              <div className="help-item">
                <strong>Transaction Fees</strong>
                <p>No deposit fees • Withdrawal fees may apply</p>
              </div>
              <div className="help-item">
                <strong>Support</strong>
                <p>
                  Keep your transaction IDs for reference • Contact support for
                  issues
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showNewWithdrawModal && <WithdrawModal />}

      <Footer />
    </div>
  );
};

export default Transactions;
