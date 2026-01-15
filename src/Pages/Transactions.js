import { useState, useEffect } from "react";
import {
  SearchOutlined,
  FilterOutlined,
  //   DownloadOutlined,
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
  CreditCardOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import "../styles/Transactions.css";
import Header from "../Commponets/Header";
import Footer from "../Commponets/Footer";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showValues, setShowValues] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showNewDepositModal, setShowNewDepositModal] = useState(false);
  const [showNewWithdrawModal, setShowNewWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // User's current balance (would come from API)
  const [userBalance] = useState({
    total: 3250.5,
    available: 2500.0,
    inInvestments: 750.5,
    currency: "USDT",
  });

  // Transaction types for user
  const transactionTypes = [
    { id: "all", label: "All", color: "#6B7280" },
    { id: "deposit", label: "Deposits", color: "#10B981" },
    { id: "withdraw", label: "Withdrawals", color: "#EF4444" },
    { id: "profit", label: "Profits", color: "#8B5CF6" },
  ];

  // Status types for user
  const statusTypes = [
    { id: "all", label: "All Status" },
    { id: "pending", label: "Pending" },
    { id: "completed", label: "Completed" },
    { id: "canceled", label: "Canceled" },
  ];

  // Mock user transactions data
  const mockUserTransactions = [
    {
      _id: "1",
      type: "deposit",
      currency: "USDT",
      requestedAmount: 500,
      creditedAmount: 500,
      status: "completed",
      createdAt: "2024-01-15T14:30:00Z",
      description: "Initial deposit via Bank Transfer",
      paymentMethod: "Bank Transfer",
      transactionHash: "0x1234567890abcdef",
    },
    {
      _id: "2",
      type: "withdraw",
      currency: "USDT",
      requestedAmount: 200,
      creditedAmount: 200,
      status: "pending",
      createdAt: "2024-01-16T10:15:00Z",
      description: "Withdrawal to bank account",
      paymentMethod: "Bank Transfer",
      transactionHash: "0x234567890abcdef1",
    },
    {
      _id: "3",
      type: "profit",
      currency: "USDT",
      requestedAmount: 75,
      creditedAmount: 75,
      status: "completed",
      createdAt: "2024-01-17T09:00:00Z",
      description: "Daily profit from Silver Plan",
      paymentMethod: "System",
      transactionHash: "TRX-PRO-001",
    },
    {
      _id: "4",
      type: "deposit",
      currency: "USDT",
      requestedAmount: 1000,
      creditedAmount: 1000,
      status: "completed",
      createdAt: "2024-01-18T16:45:00Z",
      description: "Additional deposit via Credit Card",
      paymentMethod: "Credit Card",
      transactionHash: "0x34567890abcdef12",
    },
    {
      _id: "5",
      type: "withdraw",
      currency: "USDT",
      requestedAmount: 150,
      creditedAmount: 0,
      status: "canceled",
      createdAt: "2024-01-19T11:20:00Z",
      description: "Withdrawal request canceled",
      paymentMethod: "Bank Transfer",
      transactionHash: "0x4567890abcdef123",
    },
    {
      _id: "6",
      type: "deposit",
      currency: "USDT",
      requestedAmount: 300,
      creditedAmount: 300,
      status: "pending",
      createdAt: "2024-01-20T13:10:00Z",
      description: "Deposit via Crypto Wallet",
      paymentMethod: "Crypto Wallet",
      transactionHash: "0x567890abcdef1234",
    },
    {
      _id: "7",
      type: "profit",
      currency: "USDT",
      requestedAmount: 50,
      creditedAmount: 50,
      status: "completed",
      createdAt: "2024-01-21T15:30:00Z",
      description: "Daily profit from Gold Plan",
      paymentMethod: "System",
      transactionHash: "TRX-PRO-002",
    },
    {
      _id: "8",
      type: "withdraw",
      currency: "USDT",
      requestedAmount: 400,
      creditedAmount: 400,
      status: "completed",
      createdAt: "2024-01-22T10:05:00Z",
      description: "Withdrawal to crypto wallet",
      paymentMethod: "Crypto Wallet",
      transactionHash: "0x67890abcdef12345",
    },
  ];

  // Fetch user transactions
  useEffect(() => {
    const fetchUserTransactions = async () => {
      setLoading(true);
      try {
        // In real app, you would fetch from your API with user token
        // const response = await axios.get('/api/user/transactions');
        // setTransactions(response.data);

        // Using mock data for now
        setTimeout(() => {
          setTransactions(mockUserTransactions);
          setFilteredTransactions(mockUserTransactions);
          setLoading(false);
        }, 2000);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setLoading(false);
      }
    };

    fetchUserTransactions();
  }, [mockUserTransactions]);

  // Filter transactions
  useEffect(() => {
    let result = transactions;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.description?.toLowerCase().includes(term) ||
          tx.paymentMethod?.toLowerCase().includes(term) ||
          tx.transactionHash?.toLowerCase().includes(term) ||
          tx._id.toLowerCase().includes(term)
      );
    }

    // Filter by type
    if (filterType !== "all") {
      result = result.filter((tx) => tx.type === filterType);
    }

    // Filter by status
    if (filterStatus !== "all") {
      result = result.filter((tx) => tx.status === filterStatus);
    }

    setFilteredTransactions(result);
  }, [searchTerm, filterType, filterStatus, transactions]);

  // Calculate user statistics
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
      if (tx.type === "deposit") {
        stats.totalDeposits += tx.creditedAmount || 0;
        if (tx.status === "pending") stats.pendingDeposits++;
      }
      if (tx.type === "withdraw") {
        stats.totalWithdrawals += tx.creditedAmount || 0;
        if (tx.status === "pending") stats.pendingWithdrawals++;
      }
      if (tx.type === "profit") {
        stats.totalProfits += tx.creditedAmount || 0;
      }
      if (tx.status === "completed") stats.totalCompleted++;
    });

    return stats;
  };

  const userStats = calculateStats();

  const formatCurrency = (amount) => {
    if (!showValues) return "●●●●";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
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
      case "canceled":
        return (
          <span className="status-badge canceled">
            <CloseCircleOutlined />
            Canceled
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "deposit":
        return <ArrowDownOutlined className="type-icon deposit" />;
      case "withdraw":
        return <ArrowUpOutlined className="type-icon withdraw" />;
      case "profit":
        return <DollarOutlined className="type-icon profit" />;
      default:
        return <DollarOutlined className="type-icon" />;
    }
  };

  const handleNewDeposit = async () => {
    if (!depositAmount || depositAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      // In real app, you would call your API
      // await axios.post('/api/user/deposit', { amount: depositAmount });

      // Create mock transaction
      const newDeposit = {
        _id: `temp-${Date.now()}`,
        type: "deposit",
        currency: "USDT",
        requestedAmount: parseFloat(depositAmount),
        creditedAmount: 0,
        status: "pending",
        createdAt: new Date().toISOString(),
        description: "New deposit request",
        paymentMethod: "Bank Transfer",
        transactionHash: `PENDING-${Date.now()}`,
      };

      setTransactions((prev) => [newDeposit, ...prev]);
      setDepositAmount("");
      setShowNewDepositModal(false);
      alert("Deposit request submitted successfully!");
    } catch (error) {
      console.error("Error creating deposit:", error);
      alert("Failed to create deposit request");
    }
  };

  const handleNewWithdrawal = async () => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (withdrawAmount > userBalance.available) {
      alert("Insufficient available balance");
      return;
    }

    try {
      // In real app, you would call your API
      // await axios.post('/api/user/withdraw', { amount: withdrawAmount });

      // Create mock transaction
      const newWithdrawal = {
        _id: `temp-${Date.now()}`,
        type: "withdraw",
        currency: "USDT",
        requestedAmount: parseFloat(withdrawAmount),
        creditedAmount: 0,
        status: "pending",
        createdAt: new Date().toISOString(),
        description: "New withdrawal request",
        paymentMethod: "Bank Transfer",
        transactionHash: `PENDING-${Date.now()}`,
      };

      setTransactions((prev) => [newWithdrawal, ...prev]);
      setWithdrawAmount("");
      setShowNewWithdrawModal(false);
      alert("Withdrawal request submitted successfully!");
    } catch (error) {
      console.error("Error creating withdrawal:", error);
      alert("Failed to create withdrawal request");
    }
  };

  const DepositModal = () => (
    <div
      className="modal-overlay"
      onClick={() => setShowNewDepositModal(false)}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Make a Deposit</h3>
          <button
            className="close-btn"
            onClick={() => setShowNewDepositModal(false)}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Amount to Deposit (USDT)</label>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Enter amount"
              min="10"
              step="0.01"
            />
            <small>Minimum deposit: $10 USDT</small>
          </div>

          <div className="payment-methods">
            <h4>Select Payment Method</h4>
            <div className="method-options">
              <label className="method-option">
                <input type="radio" name="method" defaultChecked />
                <CreditCardOutlined />
                <span>Credit/Debit Card</span>
              </label>
              <label className="method-option">
                <input type="radio" name="method" />
                <WalletOutlined />
                <span>Crypto Wallet</span>
              </label>
              <label className="method-option">
                <input type="radio" name="method" />
                <DollarOutlined />
                <span>Bank Transfer</span>
              </label>
            </div>
          </div>

          <div className="modal-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setShowNewDepositModal(false)}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleNewDeposit}>
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
          <div className="balance-info">
            <div className="balance-item">
              <span>Available Balance:</span>
              <span className="balance-amount">
                {formatCurrency(userBalance.available)} USDT
              </span>
            </div>
          </div>

          <div className="form-group">
            <label>Amount to Withdraw (USDT)</label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Enter amount"
              min="10"
              max={userBalance.available}
              step="0.01"
            />
            <small>Minimum withdrawal: $10 USDT</small>
            <button
              className="btn-text"
              onClick={() => setWithdrawAmount(userBalance.available)}
            >
              Withdraw All
            </button>
          </div>

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

          <div className="withdrawal-info">
            <QuestionCircleOutlined />
            <p>
              Withdrawals are processed within 24-48 hours. A small fee may
              apply.
            </p>
          </div>

          <div className="modal-actions">
            <button
              className="btn btn-secondary"
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

  return (
    <div className="user-transactions-container">
      {/* Header */}
      <Header />
      <div className="transactions-header">
        <div className="header-right">
          <button
            className="btn-icon"
            onClick={() => setShowValues(!showValues)}
            aria-label={showValues ? "Hide values" : "Show values"}
          >
            {showValues ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          </button>
        </div>
      </div>

      {/* Balance Overview */}
      <div className="balance-overview">
        <div className="balance-card total">
          <div className="balance-icon">
            <WalletOutlined />
          </div>
          <div className="balance-content">
            <div className="balance-label">Total Balance</div>
            <div className="balance-value">
              {showValues ? formatCurrency(userBalance.total) : "●●●●●●●"}
            </div>
            <div className="balance-subtext">Your total portfolio value</div>
          </div>
        </div>

        <div className="balance-card available">
          <div className="balance-icon">
            <DollarOutlined />
          </div>
          <div className="balance-content">
            <div className="balance-label">Available Balance</div>
            <div className="balance-value">
              {showValues ? formatCurrency(userBalance.available) : "●●●●●●●"}
            </div>
            <div className="balance-subtext">Available for withdrawal</div>
          </div>
        </div>

        <div className="balance-card actions">
          <div className="action-buttons">
            <button
              className="btn btn-success"
              onClick={() => setShowNewDepositModal(true)}
            >
              <ArrowDownOutlined />
              Deposit Funds
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowNewWithdrawModal(true)}
            >
              <ArrowUpOutlined />
              Withdraw Funds
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stats-card">
          <h3>Transaction Summary</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon deposit">
                <ArrowDownOutlined />
              </div>
              <div className="stat-content">
                <div className="stat-label">Total Deposits</div>
                <div className="stat-value">
                  {showValues
                    ? formatCurrency(userStats.totalDeposits)
                    : "●●●●●●"}
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
                  {showValues
                    ? formatCurrency(userStats.totalWithdrawals)
                    : "●●●●●●"}
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
                  {showValues
                    ? formatCurrency(userStats.totalProfits)
                    : "●●●●●●"}
                </div>
                <div className="stat-subtext">From your investments</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-container">
        <div className="search-filter">
          <SearchOutlined />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm("")}>
              ×
            </button>
          )}
        </div>

        <div className="filter-options">
          <div className="filter-group">
            <FilterOutlined />
            <span>Filter by:</span>
            <div className="filter-buttons">
              {transactionTypes.map((type) => (
                <button
                  key={type.id}
                  className={`type-filter-btn ${
                    filterType === type.id ? "active" : ""
                  }`}
                  style={{ "--type-color": type.color }}
                  onClick={() => setFilterType(type.id)}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span>Status:</span>
            <div className="filter-buttons">
              {statusTypes.map((status) => (
                <button
                  key={status.id}
                  className={`status-filter-btn ${
                    filterStatus === status.id ? "active" : ""
                  }`}
                  onClick={() => setFilterStatus(status.id)}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="transactions-table-container">
        <div className="table-header">
          <h3>Recent Transactions</h3>
          <span className="count-badge">
            {filteredTransactions.length} transactions
          </span>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your transactions...</p>
          </div>
        ) : (
          <div className="transactions-table">
            <div className="table-header-row">
              <div className="table-cell">Description</div>
              <div className="table-cell">Type</div>
              <div className="table-cell">Amount</div>
              <div className="table-cell">Status</div>
              <div className="table-cell">Date</div>
              <div className="table-cell">Details</div>
            </div>

            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <div key={tx._id} className="table-row">
                  <div className="table-cell description-cell">
                    <div
                      className="transaction-icon"
                      style={{
                        color:
                          tx.type === "deposit"
                            ? "#10B981"
                            : tx.type === "withdraw"
                            ? "#EF4444"
                            : "#8B5CF6",
                      }}
                    >
                      {getTypeIcon(tx.type)}
                    </div>
                    <div className="transaction-details">
                      <div className="transaction-title">{tx.description}</div>
                      <div className="transaction-subtext">
                        {tx.paymentMethod} • ID: {tx._id}
                      </div>
                      {tx.transactionHash && (
                        <div className="transaction-hash">
                          <CopyOutlined />
                          {tx.transactionHash.substring(0, 20)}...
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="table-cell">
                    <span className={`type-badge type-${tx.type}`}>
                      {tx.type.toUpperCase()}
                    </span>
                  </div>

                  <div className="table-cell amount-cell">
                    <div className={`amount ${tx.type}`}>
                      {tx.type === "deposit" || tx.type === "profit"
                        ? "+"
                        : "-"}
                      {showValues ? formatCurrency(tx.requestedAmount) : "●●●●"}{" "}
                      {tx.currency}
                    </div>
                    {tx.requestedAmount !== tx.creditedAmount &&
                      tx.creditedAmount > 0 && (
                        <div className="credited-amount">
                          Credited: {formatCurrency(tx.creditedAmount)}
                        </div>
                      )}
                  </div>

                  <div className="table-cell">{getStatusBadge(tx.status)}</div>

                  <div className="table-cell">{formatDate(tx.createdAt)}</div>

                  <div className="table-cell">
                    <button
                      className="btn-text"
                      onClick={() => {
                        // In real app, would open transaction details
                        alert(
                          `Transaction ID: ${tx._id}\nStatus: ${
                            tx.status
                          }\nAmount: ${formatCurrency(tx.requestedAmount)}`
                        );
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <HistoryOutlined className="empty-icon" />
                <h3>No transactions found</h3>
                <p>
                  Try adjusting your filters or make your first transaction!
                </p>
                <div className="empty-actions">
                  <button
                    className="btn btn-success"
                    onClick={() => setShowNewDepositModal(true)}
                  >
                    <PlusOutlined />
                    Make First Deposit
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="help-section">
        <QuestionCircleOutlined className="help-icon" />
        <div className="help-content">
          <h3>Need Help?</h3>
          <ul>
            <li>Deposits are usually processed within 1-2 hours</li>
            <li>Withdrawals take 24-48 hours to process</li>
            <li>Contact support for any transaction issues</li>
            <li>Keep your transaction IDs for reference</li>
          </ul>
        </div>
      </div>

      {/* Modals */}
      {showNewDepositModal && <DepositModal />}
      {showNewWithdrawModal && <WithdrawModal />}

      {/* footer */}
      <Footer />
    </div>
  );
};

export default Transactions;
