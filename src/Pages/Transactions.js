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
      color: "#059669",
      icon: <ArrowDownOutlined />,
    },
    {
      id: "withdraw",
      label: "Withdrawals",
      color: "#e11d48",
      icon: <ArrowUpOutlined />,
    },
    {
      id: "profit",
      label: "Profits",
      color: "#7c3aed",
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
        className: "nexus-status-badge--completed",
      },
      success: {
        label: isMobileView ? "Done" : "Completed",
        className: "nexus-status-badge--completed",
      },
      approved: {
        label: isMobileView ? "Done" : "Completed",
        className: "nexus-status-badge--completed",
      },
      pending: {
        label: "Pending",
        className: "nexus-status-badge--pending",
      },
      processing: {
        label: isMobileView ? "Proc" : "Processing",
        className: "nexus-status-badge--processing",
      },
      canceled: {
        label: isMobileView ? "Cancel" : "Canceled",
        className: "nexus-status-badge--failed",
      },
      cancelled: {
        label: isMobileView ? "Cancel" : "Canceled",
        className: "nexus-status-badge--failed",
      },
      failed: {
        label: "Failed",
        className: "nexus-status-badge--failed",
      },
      rejected: {
        label: "Failed",
        className: "nexus-status-badge--failed",
      },
    };

    const { label, className } = config[status] || {
      label: status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown",
      className: "nexus-status-badge--completed",
    };

    return (
      <span className={`nexus-status-badge ${className}`}>
        {!isMobileView && getStatusIcon(status)}
        {label}
      </span>
    );
  };

  // Helper function to get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
      case "success":
      case "approved":
        return <CheckCircleOutlined />;
      case "pending":
      case "processing":
        return <ClockCircleOutlined />;
      case "canceled":
      case "cancelled":
      case "failed":
      case "rejected":
        return <CloseCircleOutlined />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  // Type icon component
  const TypeIcon = ({ type }) => {
    const config = {
      deposit: {
        className: "nexus-transaction-icon--deposit",
        icon: <ArrowDownOutlined />,
      },
      withdraw: {
        className: "nexus-transaction-icon--withdraw",
        icon: <ArrowUpOutlined />,
      },
      withdrawal: {
        className: "nexus-transaction-icon--withdraw",
        icon: <ArrowUpOutlined />,
      },
      profit: {
        className: "nexus-transaction-icon--profit",
        icon: <DollarOutlined />,
      },
      earning: {
        className: "nexus-transaction-icon--profit",
        icon: <DollarOutlined />,
      },
      interest: {
        className: "nexus-transaction-icon--profit",
        icon: <DollarOutlined />,
      },
    };

    const { className, icon } = config[type] || {
      className: "nexus-transaction-icon--deposit",
      icon: <DollarOutlined />,
    };

    return <div className={`nexus-transaction-icon ${className}`}>{icon}</div>;
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
      currency,
    } = transaction;

    const amountInDollars = amount / 100;

    return (
      <div className="nexus-transaction-card" key={_id}>
        <div className="nexus-transaction-card__header">
          <div className="nexus-transaction-card__main">
            <TypeIcon type={type} />
            <div className="nexus-transaction-details">
              <h4 className="nexus-transaction-title">{description}</h4>
              <div className="nexus-transaction-meta">
                <span className="nexus-transaction-ref">{reference}</span>
              </div>
            </div>
          </div>
          <div className="nexus-transaction-header-right">
            <div
              className={`nexus-transaction-amount nexus-transaction-amount--${type}`}
            >
              {type === "deposit" || type === "profit" ? "+" : "-"}
              {showValues ? formatCurrency(amount) : "••••••"}
            </div>
            <StatusBadge status={status} />
          </div>
        </div>

        <div className="nexus-transaction-card__body">
          <div className="nexus-transaction-info">
            <div className="nexus-info-item">
              <span className="nexus-info-label">Date & Time</span>
              <span className="nexus-info-value">{formatDate(createdAt)}</span>
            </div>
            <div className="nexus-info-item">
              <span className="nexus-info-label">Transaction ID</span>
              <span
                className={`nexus-info-value nexus-info-value--clickable ${
                  copiedId === _id ? "nexus-info-value--copied" : ""
                }`}
                onClick={() => copyToClipboard(transactionHash, _id)}
              >
                <CopyOutlined /> {transactionHash?.substring(0, 10)}...
              </span>
            </div>
            <div className="nexus-info-item">
              <span className="nexus-info-label">Currency</span>
              <span className="nexus-info-value">{currency}</span>
            </div>
            {!isMobileView && (
              <div className="nexus-info-item">
                <span className="nexus-info-label">Exact Amount</span>
                <span className="nexus-info-value">
                  {showValues ? `$${amountInDollars.toFixed(2)}` : "••••••"}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="nexus-transaction-card__footer">
          <button
            className="nexus-details-button"
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
      className="nexus-modal-overlay"
      onClick={() => setShowNewWithdrawModal(false)}
    >
      <div className="nexus-modal" onClick={(e) => e.stopPropagation()}>
        <div className="nexus-modal__header">
          <h3 className="nexus-modal__title">Request Withdrawal</h3>
          <button
            className="nexus-modal__close"
            onClick={() => setShowNewWithdrawModal(false)}
          >
            ×
          </button>
        </div>
        <div className="nexus-modal__body">
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
    <div className="nexus-transactions">
      <Header />

      {/* Mobile Header */}
      {isMobileView && (
        <div className="nexus-mobile-chrome">
          <button
            className="nexus-mobile-chrome__button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <CloseOutlined /> : <MenuOutlined />}
          </button>
          <h1 className="nexus-mobile-chrome__title">Transactions</h1>
          <button
            className="nexus-mobile-chrome__button"
            onClick={() => setShowValues(!showValues)}
          >
            {showValues ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          </button>
        </div>
      )}

      {/* Mobile Filter Menu */}
      {isMobileView && showMobileMenu && (
        <div className="nexus-filter-drawer">
          <div className="nexus-filter-drawer__content">
            <div className="nexus-filter-drawer__header">
              <h3 className="nexus-filter-drawer__title">Filters</h3>
              <button
                className="nexus-filter-drawer__close"
                onClick={() => setShowMobileMenu(false)}
              >
                ×
              </button>
            </div>
            <div className="nexus-filter-drawer__options">
              {filterOptions.map((filter) => (
                <button
                  key={filter.id}
                  className={`nexus-filter-drawer__option ${
                    activeFilter === filter.id
                      ? "nexus-filter-drawer__option--active"
                      : ""
                  }`}
                  onClick={() => {
                    setActiveFilter(filter.id);
                    setShowMobileMenu(false);
                  }}
                >
                  <span className="nexus-filter-drawer__option-icon">
                    {filter.icon}
                  </span>
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="nexus-content">
        {/* Desktop Header */}
        {!isMobileView && (
          <div className="nexus-desktop-header">
            <div className="nexus-page-header">
              <div className="nexus-page-header__main">
                <h1>Transaction History</h1>
                <p className="nexus-page-header__subtitle">
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
              <div className="nexus-page-header__actions">
                <button
                  className="nexus-icon-button"
                  onClick={() => setShowValues(!showValues)}
                >
                  {showValues ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                </button>
                <button
                  className="nexus-icon-button"
                  onClick={refreshTransactions}
                  disabled={loading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Balance Overview */}
        <div className="nexus-balance-grid">
          {/* Total Balance Card */}
          <div className="nexus-balance-total">
            <div className="nexus-balance-total__header">
              <div className="nexus-balance-total__icon">
                <WalletOutlined />
              </div>
              <div>
                <h3 className="nexus-balance-total__amount">Total Balance</h3>
                <div className="nexus-balance-total__amount">
                  {formatCurrency(userBalance.total)}
                </div>
              </div>
            </div>
            <div className="nexus-balance-total__details">
              <div className="nexus-balance-detail__item">
                <span className="nexus-balance-detail__label">Available</span>
                <span className="nexus-balance-detail__value">
                  {formatCurrency(userBalance.available)}
                </span>
              </div>
              <div className="nexus-balance-detail__item">
                <span className="nexus-balance-detail__label">Invested</span>
                <span className="nexus-balance-detail__value">
                  {formatCurrency(userBalance.invested)}
                </span>
              </div>
              {userBalance.pending > 0 && (
                <div className="nexus-balance-detail__item">
                  <span className="nexus-balance-detail__label">Pending</span>
                  <span className="nexus-balance-detail__value nexus-balance-detail__value--pending">
                    {formatCurrency(userBalance.pending)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          {!isMobileView ? (
            <div className="nexus-desktop-stats">
              <h3 className="nexus-desktop-stats__title">Summary</h3>
              <div className="nexus-desktop-stats__grid">
                <div className="nexus-desktop-stat__item">
                  <div className="nexus-desktop-stat__icon nexus-desktop-stat__icon--deposit">
                    <ArrowDownOutlined />
                  </div>
                  <div className="nexus-desktop-stat__content">
                    <div className="nexus-desktop-stat__label">
                      Total Deposits
                    </div>
                    <div className="nexus-desktop-stat__value">
                      {formatCurrency(userStats.totalDeposits)}
                    </div>
                    <div className="nexus-desktop-stat__subtext">
                      {userStats.pendingDeposits} pending
                    </div>
                  </div>
                </div>
                <div className="nexus-desktop-stat__item">
                  <div className="nexus-desktop-stat__icon nexus-desktop-stat__icon--withdraw">
                    <ArrowUpOutlined />
                  </div>
                  <div className="nexus-desktop-stat__content">
                    <div className="nexus-desktop-stat__label">
                      Total Withdrawals
                    </div>
                    <div className="nexus-desktop-stat__value">
                      {formatCurrency(userStats.totalWithdrawals)}
                    </div>
                    <div className="nexus-desktop-stat__subtext">
                      {userStats.pendingWithdrawals} pending
                    </div>
                  </div>
                </div>
                <div className="nexus-desktop-stat__item">
                  <div className="nexus-desktop-stat__icon nexus-desktop-stat__icon--profit">
                    <DollarOutlined />
                  </div>
                  <div className="nexus-desktop-stat__content">
                    <div className="nexus-desktop-stat__label">
                      Total Profits
                    </div>
                    <div className="nexus-desktop-stat__value">
                      {formatCurrency(userStats.totalProfits)}
                    </div>
                    <div className="nexus-desktop-stat__subtext">
                      From {dashboardData?.investments?.length || 0} investments
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="nexus-mobile-stats">
              <div className="nexus-mobile-stats__grid">
                <div className="nexus-mobile-stat__item">
                  <div className="nexus-mobile-stat__icon nexus-mobile-stat__icon--deposit">
                    <ArrowDownOutlined />
                  </div>
                  <div className="nexus-mobile-stat__content">
                    <div className="nexus-mobile-stat__label">Deposits</div>
                    <div className="nexus-mobile-stat__value">
                      {formatCurrency(userStats.totalDeposits)}
                    </div>
                  </div>
                </div>
                <div className="nexus-mobile-stat__item">
                  <div className="nexus-mobile-stat__icon nexus-mobile-stat__icon--withdraw">
                    <ArrowUpOutlined />
                  </div>
                  <div className="nexus-mobile-stat__content">
                    <div className="nexus-mobile-stat__label">Withdrawals</div>
                    <div className="nexus-mobile-stat__value">
                      {formatCurrency(userStats.totalWithdrawals)}
                    </div>
                  </div>
                </div>
                <div className="nexus-mobile-stat__item">
                  <div className="nexus-mobile-stat__icon nexus-mobile-stat__icon--profit">
                    <DollarOutlined />
                  </div>
                  <div className="nexus-mobile-stat__content">
                    <div className="nexus-mobile-stat__label">Profits</div>
                    <div className="nexus-mobile-stat__value">
                      {formatCurrency(userStats.totalProfits)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions Card */}
          <div className="nexus-actions-card">
            <h3 className="nexus-actions-card__title">
              {isMobileView ? "Actions" : "Quick Actions"}
            </h3>
            <div className="nexus-actions-card__grid">
              <button
                className="nexus-action-button nexus-action-button--success"
                onClick={() => navigate("/deposit")}
              >
                <ArrowDownOutlined />
                <span className="nexus-w-btn">{isMobileView ? "Deposit" : "Deposit Funds"}</span>
              </button>
              <button
                className="nexus-action-button  nexus-withdraw"
                onClick={() => navigate("/withdraw")}
                disabled={userBalance.available <= 0}
              >
                <ArrowUpOutlined />
                <span className="nexus-w-btn">{isMobileView ? "Withdraw" : "Withdraw Funds"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="nexus-search-section">
          <div className="nexus-search-container">
            <span className="nexus-search-icon">
              <SearchOutlined />
            </span>
            <input
              type="text"
              className="nexus-search-input"
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
                className="nexus-search-clear"
                onClick={() => setSearchTerm("")}
              >
                ×
              </button>
            )}
          </div>

          {!isMobileView && (
            <div className="nexus-filter-tabs">
              {filterOptions.map((filter) => (
                <button
                  key={filter.id}
                  className={`nexus-filter-tab ${
                    activeFilter === filter.id ? "nexus-filter-tab--active" : ""
                  }`}
                  onClick={() => setActiveFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          )}

          <div className="nexus-results-info">
            <span className="nexus-results-count">
              {filteredTransactions.length} transactions
            </span>
            {(searchTerm || activeFilter !== "all") && (
              <button
                className="nexus-clear-filters"
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
                className="nexus-clear-filters"
                onClick={refreshTransactions}
                disabled={loading}
              >
                Refresh Data
              </button>
            )}
          </div>
        </div>

        {/* Transaction Cards Container */}
        <div className="nexus-transactions-list">
          {loading ? (
            <div className="nexus-loading">
              <div className="nexus-loading-spinner"></div>
              <p className="nexus-loading-text">Loading your transactions...</p>
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="nexus-transactions-grid">
              {filteredTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction._id}
                  transaction={transaction}
                />
              ))}
            </div>
          ) : (
            <div className="nexus-transactions-empty">
              <div className="nexus-empty-icon">
                <HistoryOutlined />
              </div>
              <h3 className="nexus-empty-title">No transactions found</h3>
              <p className="nexus-empty-description">
                {transactions.length === 0
                  ? "You haven't made any transactions yet. Start by making your first deposit!"
                  : "No transactions match your current filters."}
              </p>
              <div className="nexus-empty-actions">
                <button
                  className="nexus-action-button nexus-action-button--primary"
                  onClick={() => navigate("/deposit")}
                >
                  <PlusOutlined />
                  Make First Deposit
                </button>
                {(searchTerm || activeFilter !== "all") && (
                  <button
                    className="nexus-action-button nexus-action-button--success"
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
          <div className="nexus-help-section">
            <div className="nexus-help-header">
              <QuestionCircleOutlined />
              <h3>Need Help?</h3>
            </div>
            <div className="nexus-help-grid">
              <div className="nexus-help-item">
                <strong>Processing Times</strong>
                <p>Deposits: 1-2 hours • Withdrawals: 24-48 hours</p>
              </div>
              <div className="nexus-help-item">
                <strong>Transaction Fees</strong>
                <p>No deposit fees • Withdrawal fees may apply</p>
              </div>
              <div className="nexus-help-item">
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
