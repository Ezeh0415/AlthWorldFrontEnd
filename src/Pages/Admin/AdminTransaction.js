import React, { useEffect, useState } from "react";
import {
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  UserOutlined,
  MailOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  SyncOutlined,
  LeftOutlined,
  RightOutlined,
  InfoCircleOutlined,
  WalletOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  PercentageOutlined,
  TagOutlined,
} from "@ant-design/icons";
import "../../styles/Admin/AdminTransaction.css";
import ApiServices from "../../Commponets/ApiService";
import { Link } from "react-router-dom";

// ==============================
// FORMATTING FUNCTIONS
// ==============================
const formatCurrency = (amount) => {
  const amountInDollars = amount / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountInDollars);
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTimeAgo = (dateString) => {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  return formatDate(dateString);
};

// ==============================
// UI COMPONENTS
// ==============================
const StatCard = ({ title, value, iconType, loading, change, totalAmount }) => {
  const getIconClass = () => {
    switch (iconType) {
      case "total":
        return "aura-stat-card__icon aura-stat-card__icon--primary";
      case "completed":
        return "aura-stat-card__icon aura-stat-card__icon--success";
      case "pending":
        return "aura-stat-card__icon aura-stat-card__icon--warning";
      case "amount":
        return "aura-stat-card__icon aura-stat-card__icon--teal";
      default:
        return "aura-stat-card__icon";
    }
  };

  const getTrendClass = () => {
    if (!change) return "";
    return change > 0
      ? "aura-stat-card__trend aura-stat-card__trend--positive"
      : "aura-stat-card__trend aura-stat-card__trend--negative";
  };

  return (
    <div className="aura-stat-card">
      <div className="aura-stat-card__header">
        <div className={getIconClass()}>
          {iconType === "total" ? (
            <DatabaseOutlined />
          ) : iconType === "completed" ? (
            <CheckCircleOutlined />
          ) : iconType === "pending" ? (
            <ClockCircleOutlined />
          ) : (
            <CreditCardOutlined />
          )}
        </div>
        {change && (
          <div className={getTrendClass()}>
            {change > 0 ? (
              <>
                <ArrowUpOutlined /> {change}%
              </>
            ) : (
              <>
                <ArrowDownOutlined /> {Math.abs(change)}%
              </>
            )}
          </div>
        )}
      </div>
      <div className="aura-stat-card__body">
        <div className="aura-stat-card__value">
          {loading ? (
            <div className="aura-loading__text">...</div>
          ) : iconType === "amount" ? (
            formatCurrency(totalAmount)
          ) : (
            value?.toLocaleString() || 0
          )}
        </div>
        <p className="aura-stat-card__title">{title}</p>
        {iconType === "amount" && (
          <div className="aura-stat-card__subtext">Total processed amount</div>
        )}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const getBadgeClass = () => {
    switch (status) {
      case "completed":
        return "aura-badge aura-badge--success";
      case "pending":
        return "aura-badge aura-badge--pending";
      case "cancelled":
      case "failed":
        return "aura-badge aura-badge--failed";
      case "processing":
        return "aura-badge aura-badge--processing";
      default:
        return "aura-badge aura-badge--pending";
    }
  };

  const getIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircleOutlined />;
      case "pending":
      case "processing":
        return <ClockCircleOutlined />;
      case "cancelled":
      case "failed":
        return <CloseCircleOutlined />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  const getLabel = () => {
    switch (status) {
      case "completed":
        return "Completed";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      case "failed":
        return "Failed";
      case "processing":
        return "Processing";
      default:
        return "Unknown";
    }
  };

  return (
    <span className={getBadgeClass()}>
      {getIcon()}
      <span>{getLabel()}</span>
    </span>
  );
};

const TypeBadge = ({ type }) => {
  const getBadgeClass = () => {
    switch (type) {
      case "deposit":
        return "aura-badge aura-badge--deposit";
      case "withdrawal":
        return "aura-badge aura-badge--withdrawal";
      case "investment":
        return "aura-badge aura-badge--investment";
      case "profit":
        return "aura-badge aura-badge--profit";
      default:
        return "aura-badge";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "deposit":
        return <ArrowDownOutlined />;
      case "withdrawal":
        return <ArrowUpOutlined />;
      case "investment":
        return <DollarOutlined />;
      case "profit":
        return <PercentageOutlined />;
      default:
        return <CreditCardOutlined />;
    }
  };

  return (
    <span className={getBadgeClass()}>
      {getIcon()}
      <span>{type?.charAt(0).toUpperCase() + type?.slice(1) || "Unknown"}</span>
    </span>
  );
};

// Transaction Card Component
const TransactionCard = ({
  transaction,
  onViewDetails,
  onApprove,
  onReject,
  loadingAction,
}) => {
  const isPending = transaction.status === "pending";

  const getTransactionIconClass = () => {
    switch (transaction.type) {
      case "deposit":
        return "aura-transaction-icon aura-transaction-icon--deposit";
      case "withdrawal":
        return "aura-transaction-icon aura-transaction-icon--withdrawal";
      case "investment":
        return "aura-transaction-icon aura-transaction-icon--investment";
      case "profit":
        return "aura-transaction-icon aura-transaction-icon--profit";
      default:
        return "aura-transaction-icon aura-transaction-icon--deposit";
    }
  };

  const getTransactionIcon = () => {
    switch (transaction.type) {
      case "deposit":
        return <ArrowDownOutlined />;
      case "withdrawal":
        return <ArrowUpOutlined />;
      case "investment":
        return <DollarOutlined />;
      case "profit":
        return <PercentageOutlined />;
      default:
        return <CreditCardOutlined />;
    }
  };

  const getActionButtonText = () => {
    if (transaction.type === "withdrawal") return "Complete";
    if (transaction.type === "deposit") return "Confirm";
    return "Approve";
  };

  return (
    <div className="aura-transaction-card">
      <div className="aura-transaction-card__header">
        <div className="aura-transaction-card__left">
          <div className={getTransactionIconClass()}>
            {getTransactionIcon()}
          </div>
          <div className="aura-transaction-info">
            <h4>{transaction.description || "Transaction"}</h4>
            <div className="aura-transaction-meta">
              <div className="aura-transaction-meta__item">
                <TagOutlined />
                <span>{transaction._id?.slice(-8).toUpperCase()}</span>
              </div>
              <div className="aura-transaction-meta__item">
                <CalendarOutlined />
                <span>{getTimeAgo(transaction.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
        <StatusBadge status={transaction.status} />
      </div>

      <div className="aura-transaction-card__body">
        <div className="aura-user-info">
          <div className="aura-user-avatar">
            <UserOutlined />
          </div>
          <div className="aura-user-details">
            <h5>{transaction.fullName || "Unknown User"}</h5>
            <p className="aura-user-email">
              <MailOutlined />
              {transaction.email || "No email"}
            </p>
          </div>
        </div>

        <div className="aura-transaction-details">
          <div className="aura-detail-item">
            <span className="aura-detail-label">Amount</span>
            <div className="aura-detail-value aura-detail-value--amount">
              {formatCurrency(
                transaction.creditedAmount ||
                  transaction.requestedAmount ||
                  transaction.amount ||
                  0,
              )}
            </div>
          </div>
          <div className="aura-detail-item">
            <span className="aura-detail-label">Type</span>
            <div className="aura-detail-value">
              <TypeBadge type={transaction.type} />
            </div>
          </div>
          <div className="aura-detail-item">
            <span className="aura-detail-label">Date</span>
            <div className="aura-detail-value">
              {formatDate(transaction.createdAt)}
            </div>
          </div>
          <div className="aura-detail-item">
            <span className="aura-detail-label">Time</span>
            <div className="aura-detail-value">
              {formatTime(transaction.createdAt)}
            </div>
          </div>
        </div>

        {transaction.walletAddress && (
          <div className="aura-wallet-info">
            <WalletOutlined />
            <span className="aura-truncate">{transaction.walletAddress}</span>
          </div>
        )}
      </div>

      <div className="aura-transaction-card__footer">
        <button
          className="aura-action-button aura-action-button--view"
          onClick={() => onViewDetails(transaction)}
          disabled={loadingAction}
        >
          <EyeOutlined />
          <span>Details</span>
        </button>

        {isPending && (
          <div className="aura-action-buttons">
            <button
              className="aura-action-button aura-action-button--approve"
              onClick={() => onApprove(transaction)}
              disabled={loadingAction}
            >
              <CheckCircleOutlined />
              <span>{getActionButtonText()}</span>
            </button>
            <button
              className="aura-action-button aura-action-button--reject"
              onClick={() => onReject(transaction)}
              disabled={loadingAction}
            >
              <CloseCircleOutlined />
              <span>Reject</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ==============================
// MAIN COMPONENT
// ==============================
const AdminTransaction = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [transaction, setTransaction] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [isMobileView, setIsMobileView] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const fetchDashboardData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: page,
        limit: limit,
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(typeFilter !== "all" && { type: typeFilter }),
        ...(searchQuery && { search: searchQuery }),
      };

      const data = await ApiServices.getTransactions(params);

      if (data) {
        setTransaction({
          ...data,
          hasPrev: data.page > 1,
          hasNext: data.page < data.totalPages,
        });
      }
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [limit, page, searchQuery, statusFilter, typeFilter]);

  useEffect(() => {
    fetchDashboardData();
  }, [page, statusFilter, typeFilter, fetchDashboardData]);

  const handleMarkComplete = async (transaction) => {
    try {
      setActionLoadingId(transaction._id);
      setLoadingAction(true);
      setError(null);

      const transactionId = transaction.transactionId;
      const userId = transaction.userId;
      const amount =
        transaction.creditedAmount ||
        transaction.requestedAmount ||
        transaction.amount ||
        0;

    

      let result;

      if (transaction.type === "withdraw") {
        const data = { userId, creditedAmount: amount, transactionId };
        result = await ApiServices.confirmWithdraw(data);
      } else if (transaction.type === "deposit") {
        const data = {
          userId,
          creditedAmount: amount,
          transactionId,
        };
        result = await ApiServices.ConfirmDeposit(data);
      } else {
        throw new Error(`Cannot process ${transaction.type} transaction`);
      }

      if (result && result.success) {
        fetchDashboardData();
        setModalVisible(false);
        console.log(`${transaction.type} processed successfully`);
      }
    } catch (err) {
      console.error(`Process ${transaction.type} error:`, err);
      setError(err.message || `Failed to process ${transaction.type}`);
    } finally {
      setLoadingAction(false);
      setActionLoadingId(null);
    }
  };

  const handleCancelTransaction = async (transaction) => {
    try {
      setActionLoadingId(transaction._id);
      setLoadingAction(true);
      setError(null);

      const transactionId = transaction._id;
      const userId = transaction.userId;

      console.log("Cancelling transaction:", {
        type: transaction.type,
        transactionId,
        userId,
      });

      let result;

      if (transaction.type === "withdrawal") {
        const data = { userId, transactionId };
        result = await ApiServices.declineWithdraw(data);
      } else if (transaction.type === "deposit") {
        const data = { userId, transactionId };
        result = await ApiServices.declineDeposit(data);
      } else {
        throw new Error(`Cannot cancel ${transaction.type} transaction`);
      }

      if (result && result.success) {
        fetchDashboardData();
        setModalVisible(false);
        console.log(`${transaction.type} cancelled successfully`);
      }
    } catch (err) {
      console.error(`Cancel ${transaction.type} error:`, err);
      setError(err.message || `Failed to cancel ${transaction.type}`);
    } finally {
      setLoadingAction(false);
      setActionLoadingId(null);
    }
  };

  const handleNext = () => {
    if (transaction?.hasNext) {
      setPage((prev) => prev + 1);
      // Scroll to top smoothly
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handlePrev = () => {
    if (transaction?.hasPrev) {
      setPage((prev) => prev - 1);

      // Scroll to top smoothly
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handlePageClick = (pageNumber) => {
    setPage(pageNumber);
    // Scroll to top smoothly
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const getTransactionCounts = (transactions) => {
    const allTransactions = transactions || [];

    return {
      total: allTransactions.length,
      completed: allTransactions.filter((t) => t.status === "completed").length,
      pending: allTransactions.filter((t) => t.status === "pending").length,
      cancelled: allTransactions.filter(
        (t) => t.status === "cancelled" || t.status === "canceled",
      ).length,
      failed: allTransactions.filter((t) => t.status === "failed").length,
      processing: allTransactions.filter((t) => t.status === "processing")
        .length,
      refunded: allTransactions.filter((t) => t.status === "refunded").length,
    };
  };

  const counts = getTransactionCounts(transaction?.transactions);

  const viewTransactionDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  // const handleSearch = (e) => {
  //   if (e.key === "Enter") {
  //     setPage(1);
  //     fetchDashboardData();
  //   }
  // };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setPage(1);
  };

  const getTotalAmount = () => {
    if (!transaction?.transactions) return 0;
    return transaction.transactions.reduce((sum, tx) => {
      const amount = tx.creditedAmount || tx.requestedAmount || tx.amount || 0;
      return sum + amount;
    }, 0);
  };

  const getActionText = () => {
    if (!selectedTransaction) return "";
    if (selectedTransaction.type === "withdrawal") return "Complete Withdrawal";
    if (selectedTransaction.type === "deposit") return "Confirm Deposit";
    return "Approve Transaction";
  };

  const getRejectText = () => {
    if (!selectedTransaction) return "";
    if (selectedTransaction.type === "withdrawal") return "Decline Withdrawal";
    if (selectedTransaction.type === "deposit") return "Reject Deposit";
    return "Reject Transaction";
  };

  return (
    <div className="aura-admin-transactions">
      {/* MOBILE HEADER */}
      {isMobileView && (
        <div className="aura-mobile-chrome">
          <Link to="/adminHomePage" className="aura-mobile-chrome__back">
            <LeftOutlined />
          </Link>
          <h1 className="aura-mobile-chrome__title">Transactions</h1>
          <div className="aura-mobile-chrome__actions">
            <button
              className="aura-mobile-chrome__button"
              onClick={fetchDashboardData}
              disabled={loading}
            >
              <SyncOutlined spin={loading} />
            </button>
            <button className="aura-mobile-chrome__button">
              <DownloadOutlined />
            </button>
          </div>
        </div>
      )}

      <main className="aura-content">
        {/* DESKTOP HEADER */}
        {!isMobileView && (
          <div className="aura-desktop-header">
            <div className="aura-page-header">
              <div className="aura-page-header__main">
                <h1>
                  <DatabaseOutlined />
                  Transaction Management
                </h1>
                <p className="aura-page-header__subtitle">
                  Monitor and manage all user transactions in real-time
                </p>
              </div>
              <div className="aura-page-header__actions">
                <button
                  className={`aura-icon-button ${viewMode === "grid" ? "aura-icon-button--active" : ""}`}
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                >
                  ◼
                </button>
                <button
                  className={`aura-icon-button ${viewMode === "list" ? "aura-icon-button--active" : ""}`}
                  onClick={() => setViewMode("list")}
                  title="List View"
                >
                  ☰
                </button>
                <button
                  className="aura-icon-button"
                  onClick={fetchDashboardData}
                  disabled={loading}
                  title="Refresh"
                >
                  <SyncOutlined spin={loading} />
                </button>
                <button className="aura-icon-button" title="Export">
                  <DownloadOutlined />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STATISTICS CARDS */}
        <div className="aura-stats-grid">
          <StatCard
            title="Total Transactions"
            value={transaction?.total || 0}
            iconType="total"
            loading={loading}
            change={12.5}
          />
          <StatCard
            title="Completed"
            value={counts?.completed || 0}
            iconType="completed"
            loading={loading}
            change={8.2}
          />
          <StatCard
            title="Pending"
            value={counts?.pending || 0}
            iconType="pending"
            loading={loading}
            change={-3.1}
          />
          <StatCard
            title="Total Amount"
            iconType="amount"
            loading={loading}
            totalAmount={getTotalAmount()}
            change={15.3}
          />
        </div>

        {/* FILTERS & SEARCH */}
        {/* <div className="aura-filters-card">
          <div className="aura-filters-card__header">
            <h3 className="aura-filters-card__title">
              <FilterOutlined />
              Filters & Search
            </h3>
            <button className="aura-clear-filters" onClick={clearFilters}>
              Clear All
            </button>
          </div>

          <div className="aura-search-box">
            <span className="aura-search-icon">
              <SearchOutlined />
            </span>
            <input
              type="text"
              className="aura-search-input"
              placeholder="Search transactions, users, or IDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
            {searchQuery && (
              <button
                className="aura-search-clear"
                onClick={() => setSearchQuery("")}
              >
                ×
              </button>
            )}
          </div>

          <div className="aura-filter-groups">
            <div className="aura-filter-group">
              <h4 className="aura-filter-group__title">Status Filter</h4>
              <div className="aura-filter-buttons">
                {["all", "completed", "pending", "cancelled", "failed"].map(
                  (status) => (
                    <button
                      key={status}
                      className={`aura-filter-button ${statusFilter === status ? "aura-filter-button--active" : ""}`}
                      onClick={() => {
                        setStatusFilter(status);
                        setPage(1);
                      }}
                    >
                      <StatusBadge status={status === "all" ? null : status} />
                      <span>{status === "all" ? "All Status" : status}</span>
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="aura-filter-group">
              <h4 className="aura-filter-group__title">Type Filter</h4>
              <div className="aura-filter-buttons">
                {["all", "deposit", "withdrawal", "investment", "profit"].map(
                  (type) => (
                    <button
                      key={type}
                      className={`aura-filter-button ${typeFilter === type ? "aura-filter-button--active" : ""}`}
                      onClick={() => {
                        setTypeFilter(type);
                        setPage(1);
                      }}
                    >
                      <TypeBadge type={type === "all" ? null : type} />
                      <span>{type === "all" ? "All Types" : type}</span>
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        </div> */}

        {/* MAIN CONTENT */}
        {loading ? (
          <div className="aura-loading">
            <div className="aura-loading__spinner"></div>
            <p className="aura-loading__text">Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="aura-error">
            <div className="aura-error__icon">
              <ExclamationCircleOutlined />
            </div>
            <h3 className="aura-error__title">Error Loading Transactions</h3>
            <p className="aura-error__message">{error}</p>
            <button className="aura-retry-button" onClick={fetchDashboardData}>
              <SyncOutlined />
              Retry
            </button>
          </div>
        ) : (
          <div>
            <div className="aura-transactions-header">
              <div>
                <h3 className="aura-transactions-title">
                  <FileTextOutlined />
                  Recent Transactions
                </h3>
                <span className="aura-transactions-count">
                  {transaction?.total || 0} transactions found
                </span>
              </div>
              {!isMobileView && (
                <div className="aura-view-toggle">
                  <button
                    className={`aura-view-toggle__button ${viewMode === "grid" ? "aura-view-toggle__button--active" : ""}`}
                    onClick={() => setViewMode("grid")}
                  >
                    Grid
                  </button>
                  <button
                    className={`aura-view-toggle__button ${viewMode === "list" ? "aura-view-toggle__button--active" : ""}`}
                    onClick={() => setViewMode("list")}
                  >
                    List
                  </button>
                </div>
              )}
            </div>

            {transaction?.transactions?.length === 0 ? (
              <div className="aura-empty">
                <div className="aura-empty__icon">
                  <DatabaseOutlined />
                </div>
                <h3 className="aura-empty__title">No Transactions Found</h3>
                <p className="aura-empty__message">
                  No transactions match your current filters
                </p>
                <button className="aura-clear-filters" onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div
                  className={`aura-transactions-grid ${viewMode === "list" ? "aura-transactions-grid--list" : ""}`}
                >
                  {transaction?.transactions?.map((tx) => (
                    <TransactionCard
                      key={tx._id}
                      transaction={tx}
                      onViewDetails={viewTransactionDetails}
                      onApprove={handleMarkComplete}
                      onReject={handleCancelTransaction}
                      loadingAction={
                        loadingAction && actionLoadingId === tx._id
                      }
                    />
                  ))}
                </div>

                {transaction?.totalPages > 1 && (
                  <div className="aura-pagination">
                    <div className="aura-pagination__info">
                      Showing {(transaction.page - 1) * limit + 1} to{" "}
                      {Math.min(transaction.page * limit, transaction.total)} of{" "}
                      {transaction.total} entries
                    </div>

                    <div className="aura-pagination__controls">
                      <button
                        className="aura-pagination__button"
                        onClick={handlePrev}
                        disabled={!transaction?.hasPrev || loading}
                      >
                        <LeftOutlined />
                        Previous
                      </button>

                      <div className="aura-pagination__numbers">
                        {Array.from(
                          { length: Math.min(5, transaction.totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (transaction.totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (transaction.page <= 3) {
                              pageNum = i + 1;
                            } else if (
                              transaction.page >=
                              transaction.totalPages - 2
                            ) {
                              pageNum = transaction.totalPages - 4 + i;
                            } else {
                              pageNum = transaction.page - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageClick(pageNum)}
                                className={`aura-pagination__number ${transaction.page === pageNum ? "aura-pagination__number--active" : ""}`}
                                disabled={loading}
                              >
                                {pageNum}
                              </button>
                            );
                          },
                        )}
                      </div>

                      <button
                        className="aura-pagination__button"
                        onClick={handleNext}
                        disabled={!transaction?.hasNext || loading}
                      >
                        Next
                        <RightOutlined />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TRANSACTION DETAILS MODAL */}
        {modalVisible && selectedTransaction && (
          <div
            className="aura-modal-overlay"
            onClick={() => !loadingAction && setModalVisible(false)}
          >
            <div className="aura-modal" onClick={(e) => e.stopPropagation()}>
              <div className="aura-modal__header">
                <div className="aura-modal__title">
                  <FileTextOutlined />
                  Transaction Details
                </div>
                <button
                  className="aura-modal__close"
                  onClick={() => setModalVisible(false)}
                  disabled={loadingAction}
                >
                  ×
                </button>
              </div>

              <div className="aura-modal__body">
                <div className="aura-transaction-overview">
                  <div className="aura-transaction-icon-large">
                    {selectedTransaction.type === "deposit" ? (
                      <ArrowDownOutlined />
                    ) : selectedTransaction.type === "withdrawal" ? (
                      <ArrowUpOutlined />
                    ) : selectedTransaction.type === "investment" ? (
                      <DollarOutlined />
                    ) : (
                      <CreditCardOutlined />
                    )}
                  </div>
                  <div className="aura-transaction-amount-large">
                    <div className="aura-detail-value aura-detail-value--amount">
                      {formatCurrency(
                        selectedTransaction.creditedAmount ||
                          selectedTransaction.requestedAmount ||
                          selectedTransaction.amount ||
                          0,
                      )}
                    </div>
                    <div className="aura-transaction-type-large">
                      <TypeBadge type={selectedTransaction.type} />
                    </div>
                  </div>
                </div>

                <div className="aura-details-grid">
                  <div className="aura-detail-group">
                    <h4>Transaction Information</h4>
                    <div className="aura-modal-detail">
                      <span className="aura-modal-detail__label">
                        <TagOutlined />
                        Transaction ID
                      </span>
                      <span className="aura-modal-detail__value aura-modal-detail__value--code">
                        {selectedTransaction._id}
                      </span>
                    </div>
                    <div className="aura-modal-detail">
                      <span className="aura-modal-detail__label">
                        <CalendarOutlined />
                        Date & Time
                      </span>
                      <span className="aura-modal-detail__value">
                        {formatDate(selectedTransaction.createdAt)} at{" "}
                        {formatTime(selectedTransaction.createdAt)}
                      </span>
                    </div>
                    {selectedTransaction.walletAddress && (
                      <div className="aura-modal-detail">
                        <span className="aura-modal-detail__label">
                          <WalletOutlined />
                          Wallet Address
                        </span>
                        <span className="aura-modal-detail__value aura-modal-detail__value--code">
                          {selectedTransaction.walletAddress}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="aura-detail-group">
                    <h4>User Information</h4>
                    <div className="aura-user-details-modal">
                      <div className="aura-user-avatar-large">
                        <UserOutlined />
                      </div>
                      <div className="aura-user-info-modal">
                        <h5>{selectedTransaction?.fullName}</h5>
                        <div className="aura-user-email-modal">
                          <MailOutlined />
                          {selectedTransaction?.email}
                        </div>
                        <div className="aura-user-id-modal">
                          <UserOutlined />
                          ID: {selectedTransaction.userId}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedTransaction.status === "pending" && (
                  <div className="aura-modal__actions">
                    <button
                      className="aura-modal__button aura-modal__button--approve"
                      onClick={() => handleMarkComplete(selectedTransaction)}
                      disabled={loadingAction}
                    >
                      <CheckCircleOutlined />
                      {getActionText()}
                    </button>
                    <button
                      className="aura-modal__button aura-modal__button--reject"
                      onClick={() =>
                        handleCancelTransaction(selectedTransaction)
                      }
                      disabled={loadingAction}
                    >
                      <CloseCircleOutlined />
                      {getRejectText()}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminTransaction;
