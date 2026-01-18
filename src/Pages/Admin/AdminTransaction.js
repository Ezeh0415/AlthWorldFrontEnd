import { useEffect, useState } from "react";
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
  SettingOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  SyncOutlined,
  LeftOutlined,
  RightOutlined,
  MoreOutlined,
  InfoCircleOutlined,
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

// ==============================
// UI COMPONENTS
// ==============================
const StatCard = ({ title, value, color, icon, suffix = "", loading }) => (
  <div className="stat-card">
    <div className="stat-card-header">
      <span className="stat-icon" style={{ background: color + "20", color }}>
        {icon}
      </span>
      <span className="stat-title">{title}</span>
    </div>
    <div className="stat-value" style={{ color }}>
      {loading ? (
        <div className="stat-loading">
          <LoadingOutlined />
        </div>
      ) : (
        <>
          {value?.toLocaleString() || 0} {suffix}
        </>
      )}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const statusConfig = {
    completed: { color: "#10b981", icon: <CheckCircleOutlined /> },
    pending: { color: "#f59e0b", icon: <ClockCircleOutlined /> },
    cancelled: { color: "#ef4444", icon: <CloseCircleOutlined /> },
    failed: { color: "#dc2626", icon: <CloseCircleOutlined /> },
    processing: { color: "#3b82f6", icon: <ClockCircleOutlined /> },
    refunded: { color: "#8b5cf6", icon: <CheckCircleOutlined /> },
  };

  const config = statusConfig[status] || {
    color: "#6b7280",
    icon: <InfoCircleOutlined />,
  };

  return (
    <span
      className="status-badge"
      style={{
        backgroundColor: config.color + "15",
        color: config.color,
        borderColor: config.color + "30",
      }}
    >
      {config.icon}
      <span>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown"}
      </span>
    </span>
  );
};

const TypeBadge = ({ type }) => {
  const typeConfig = {
    deposit: {
      color: "#10b981",
      icon: <ArrowDownOutlined />,
      label: "Deposit",
    },
    withdrawal: {
      color: "#ef4444",
      icon: <ArrowUpOutlined />,
      label: "Withdrawal",
    },
    investment: {
      color: "#3b82f6",
      icon: <DollarOutlined />,
      label: "Investment",
    },
    profit: { color: "#8b5cf6", icon: <DollarOutlined />, label: "Profit" },
    transfer: {
      color: "#f59e0b",
      icon: <ArrowUpOutlined />,
      label: "Transfer",
    },
  };

  const config = typeConfig[type] || {
    color: "#6b7280",
    icon: <DollarOutlined />,
    label: type || "Unknown",
  };

  return (
    <span
      className="type-badge"
      style={{
        backgroundColor: config.color + "15",
        color: config.color,
        borderColor: config.color + "30",
      }}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
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
  const [limit] = useState(10);
  const [transaction, setTransaction] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetchDashboardData();
  }, [page, statusFilter, typeFilter]);

  const fetchDashboardData = async () => {
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
      setTransaction(data);

      // Add pagination metadata
      if (data) {
        setTransaction((prev) => ({
          ...data,
          hasPrev: data.page > 1,
          hasNext: data.page < data.totalPages,
        }));
      }
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message || "Failed to load transactions");
    } finally {
      setLoading(false);
      fetchDashboardData();
      setModalVisible(false);
    }
  };

  const handleMarkComplete = async (userId, creditedAmount, transactionId) => {
    try {
      setLoadingAction(true);
      const data = { userId, creditedAmount, transactionId };
      const result = await ApiServices.ConfirmDeposit(data);

      if (result.success) {
        // Refresh data
        fetchDashboardData();
        setModalVisible(false);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingAction(false);
      fetchDashboardData();
      setModalVisible(false);
    }
  };

  const handleCancelTransaction = async (userId, transactionId) => {
    try {
      setLoadingAction(true);
      const data = { userId, transactionId };
      const result = await ApiServices.declineDeposit(data);

      if (result.success) {
        // Refresh data
        fetchDashboardData();
        setModalVisible(false);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleNext = () => {
    if (transaction?.hasNext) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (transaction?.hasPrev) {
      setPage((prev) => prev - 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    setPage(pageNumber);
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

  const renderPageNumbers = () => {
    if (!transaction?.totalPages) return null;

    const pages = [];
    const totalPages = transaction.totalPages;
    const current = transaction.page;

    // Show first page
    if (totalPages > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageClick(1)}
          className={`page-number ${current === 1 ? "active" : ""}`}
          disabled={loading}
        >
          1
        </button>,
      );
    }

    // Show ellipsis if needed
    if (current > 3) {
      pages.push(
        <span key="left-ellipsis" className="page-ellipsis">
          ...
        </span>,
      );
    }

    // Show current page and neighbors
    for (
      let i = Math.max(2, current - 1);
      i <= Math.min(totalPages - 1, current + 1);
      i++
    ) {
      if (i > 1 && i < totalPages) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageClick(i)}
            className={`page-number ${current === i ? "active" : ""}`}
            disabled={loading}
          >
            {i}
          </button>,
        );
      }
    }

    // Show ellipsis if needed
    if (current < totalPages - 2) {
      pages.push(
        <span key="right-ellipsis" className="page-ellipsis">
          ...
        </span>,
      );
    }

    // Show last page if there's more than one page
    if (totalPages > 1) {
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageClick(totalPages)}
          className={`page-number ${current === totalPages ? "active" : ""}`}
          disabled={loading}
        >
          {totalPages}
        </button>,
      );
    }

    return pages;
  };

  const viewTransactionDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setPage(1);
      fetchDashboardData();
    }
  };

  return (
    <div className="admin-transaction-container">
      {/* HEADER SECTION */}
      <div className="admin-transaction-header">
        <div className="header-left">
          <Link to="/adminHomePage" className="back-btn">
            <LeftOutlined />
            <span>Back to Dashboard</span>
          </Link>
          <div className="header-content">
            <h1>
              <DatabaseOutlined />
              Transaction Management
            </h1>
            <p>Monitor and manage all user transactions in real-time</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="action-btn refresh-btn"
            onClick={fetchDashboardData}
            disabled={loading}
          >
            <SyncOutlined spin={loading} />
            <span>Refresh</span>
          </button>
          <button className="action-btn export-btn">
            <DownloadOutlined />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* STATISTICS CARDS SECTION */}
      <div className="stats-grid">
        <StatCard
          title="Total Transactions"
          value={transaction?.total}
          color="#3b82f6"
          icon={<DatabaseOutlined />}
          loading={loading}
        />
        <StatCard
          title="Completed"
          value={counts?.completed}
          color="#10b981"
          icon={<CheckCircleOutlined />}
          loading={loading}
        />
        <StatCard
          title="Pending"
          value={counts?.pending}
          color="#f59e0b"
          icon={<ClockCircleOutlined />}
          loading={loading}
        />
        <StatCard
          title="Cancelled"
          value={counts?.cancelled}
          color="#ef4444"
          icon={<CloseCircleOutlined />}
          loading={loading}
        />
      </div>

      {/* FILTERS & SEARCH SECTION */}
      <div className="filters-card">
        <div className="filters-header">
          <h3>
            <FilterOutlined />
            Filters & Search
          </h3>
          <button
            className="clear-filters-btn"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setTypeFilter("all");
              setPage(1);
            }}
          >
            Clear All
          </button>
        </div>

        <div className="filters-content">
          <div className="search-box">
            <SearchOutlined />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="search-input"
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => setSearchQuery("")}
              >
                ×
              </button>
            )}
          </div>

          <div className="filter-selectors">
            <div className="filter-selector">
              <label>Status</label>
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="filter-selector">
              <label>Type</label>
              <select
                className="filter-select"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="investment">Investment</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner">
            <LoadingOutlined spin />
          </div>
          <p>Loading transactions...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <div className="error-icon">
            <ExclamationCircleOutlined />
          </div>
          <h3>Error Loading Transactions</h3>
          <p className="error-message">{error}</p>
          <button className="retry-btn" onClick={fetchDashboardData}>
            Retry
          </button>
        </div>
      ) : (
        <div className="transactions-card">
          <div className="table-header">
            <div className="table-title">
              <FileTextOutlined />
              <h3>Transactions</h3>
              <span className="total-count">
                {transaction?.total || 0} total
              </span>
            </div>

            <div className="table-summary">
              <span className="summary-item">
                <span className="summary-label">Showing</span>
                <span className="summary-value">
                  {Math.min(
                    ((transaction?.page || 1) - 1) * limit + 1,
                    transaction?.total || 0,
                  )}
                  -
                  {Math.min(
                    (transaction?.page || 1) * limit,
                    transaction?.total || 0,
                  )}
                </span>
              </span>
              <span className="summary-divider">•</span>
              <span className="summary-item">
                <span className="summary-label">Page</span>
                <span className="summary-value">
                  {transaction?.page || 1} of {transaction?.totalPages || 1}
                </span>
              </span>
            </div>
          </div>

          {transaction?.transactions?.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <DatabaseOutlined />
              </div>
              <h3>No Transactions Found</h3>
              <p>No transactions match your current filters</p>
              <button
                className="clear-filters-btn"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                  setPage(1);
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {/* TABLE */}
              <div className="table-container">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>TRANSACTION ID</th>
                      <th>USER</th>
                      <th>TYPE</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                      <th>DATE</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transaction?.transactions?.map((tx) => (
                      <tr key={tx._id}>
                        <td>
                          <div className="transaction-id-cell">
                            <span className="transaction-id">
                              {tx._id?.slice(-8).toUpperCase()}
                            </span>
                            <span className="transaction-time">
                              {formatTime(tx.createdAt)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="user-info-cell">
                            <div className="user-avatar">
                              <UserOutlined />
                            </div>
                            <div className="user-details">
                              <div className="user-name">
                                {tx?.fullName || "Unknown User"}
                              </div>
                              <div className="user-email">
                                {tx?.email || "No email"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <TypeBadge type={tx.type} />
                        </td>
                        <td>
                          <div className="amount-cell">
                            <span className="amount-value">
                              {formatCurrency(
                                tx.creditedAmount || tx.requestedAmount || 0,
                              )}
                            </span>
                            <span className="amount-currency">
                              {tx.currency?.toUpperCase() || "USD"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <StatusBadge status={tx.status} />
                        </td>
                        <td>
                          <div className="date-cell">
                            <div className="date-value">
                              {formatDate(tx.createdAt)}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-btn view-btn"
                              onClick={() => viewTransactionDetails(tx)}
                              title="View Details"
                            >
                              <EyeOutlined />
                            </button>
                            {tx.status === "pending" && (
                              <>
                                <button
                                  className="action-btn approve-btn"
                                  onClick={() =>
                                    handleMarkComplete(
                                      tx.userId,
                                      tx.creditedAmount,
                                      tx.transactionId,
                                    )
                                  }
                                  title="Approve"
                                  disabled={loadingAction}
                                >
                                  <CheckCircleOutlined />
                                </button>
                                <button
                                  className="action-btn reject-btn"
                                  onClick={() =>
                                    handleCancelTransaction(
                                      tx.userId,
                                      tx.transactionId,
                                    )
                                  }
                                  title="Reject"
                                  disabled={loadingAction}
                                >
                                  <CloseCircleOutlined />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION - ENHANCED */}
              {transaction?.totalPages > 1 && (
                <div className="pagination-container">
                  <div className="pagination-info">
                    Showing {(transaction.page - 1) * limit + 1} to{" "}
                    {Math.min(transaction.page * limit, transaction.total)} of{" "}
                    {transaction.total} entries
                  </div>

                  <div className="pagination-controls">
                    <button
                      className="pagination-btn prev-btn"
                      onClick={handlePrev}
                      disabled={!transaction?.hasPrev || loading}
                    >
                      <LeftOutlined />
                      Previous
                    </button>

                    <div className="page-numbers">{renderPageNumbers()}</div>

                    <button
                      className="pagination-btn next-btn"
                      onClick={handleNext}
                      disabled={!transaction?.hasNext || loading}
                    >
                      Next
                      <RightOutlined />
                    </button>
                  </div>

                  <div className="pagination-quick-nav">
                    <span>Go to page:</span>
                    <input
                      type="number"
                      min="1"
                      max={transaction?.totalPages}
                      value={page}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value >= 1 && value <= transaction.totalPages) {
                          setPage(value);
                        }
                      }}
                      className="page-input"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          fetchDashboardData();
                        }
                      }}
                    />
                    <button
                      className="go-btn"
                      onClick={fetchDashboardData}
                      disabled={loading}
                    >
                      Go
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
          className="modal-overlay"
          onClick={() => !loadingAction && setModalVisible(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <h3>
                  <FileTextOutlined />
                  Transaction Details
                </h3>
                <StatusBadge status={selectedTransaction.status} />
              </div>
              <button
                className="close-btn"
                onClick={() => setModalVisible(false)}
                disabled={loadingAction}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h4>
                  <SettingOutlined />
                  Transaction Information
                </h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Transaction ID:</span>
                    <span className="detail-value">
                      {selectedTransaction._id}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">
                      <TypeBadge type={selectedTransaction.type} />
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Amount:</span>
                    <span className="detail-value amount">
                      {formatCurrency(
                        selectedTransaction.creditedAmount ||
                          selectedTransaction.requestedAmount ||
                          0,
                      )}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Currency:</span>
                    <span className="detail-value">
                      {selectedTransaction.currency?.toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Created:</span>
                    <span className="detail-value">
                      {formatDate(selectedTransaction.createdAt)} at{" "}
                      {formatTime(selectedTransaction.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h4>
                  <UserOutlined />
                  User Information
                </h4>
                <div className="user-details-modal">
                  <div className="user-avatar-large">
                    <UserOutlined />
                  </div>
                  <div className="user-info-modal">
                    <div className="user-name-modal">
                      {selectedTransaction?.fullName}
                    </div>
                    <div className="user-email-modal">
                      {selectedTransaction?.email}
                    </div>
                    <div className="user-id-modal">
                      ID: {selectedTransaction.userId}
                    </div>
                  </div>
                </div>
              </div>

              {selectedTransaction.status === "pending" && (
                <div className="modal-actions">
                  <button
                    className="modal-action-btn approve-btn"
                    onClick={() =>
                      handleMarkComplete(
                        selectedTransaction.userId,
                        selectedTransaction.creditedAmount,
                        selectedTransaction.transactionId,
                      )
                    }
                    disabled={loadingAction}
                  >
                    <CheckCircleOutlined />
                    Approve Transaction
                  </button>
                  <button
                    className="modal-action-btn reject-btn"
                    onClick={() =>
                      handleCancelTransaction(
                        selectedTransaction.userId,
                        selectedTransaction.transactionId,
                      )
                    }
                    disabled={loadingAction}
                  >
                    <CloseCircleOutlined />
                    Reject Transaction
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransaction;
