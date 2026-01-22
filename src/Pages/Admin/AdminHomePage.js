import React, { useState, useEffect } from "react";
import {
  DashboardOutlined,
  UserOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  MenuOutlined,
  LogoutOutlined,
  SearchOutlined,
  WalletOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlusOutlined,
  SettingOutlined,
  BellOutlined,
  CaretDownOutlined,
  CreditCardOutlined,
  BankOutlined,
  HistoryOutlined,
  FilterOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import "../../styles/Admin/AdminHomePage.css";
import ApiServices from "../../Commponets/ApiService";
import { Link } from "react-router-dom";

const AdminHomePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showUserActions, setShowUserActions] = useState(null);

  // Responsive handling
  useEffect(() => {
    const checkScreenSize = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      if (isMobileView) {
        setIsSidebarOpen(false);
        setIsSearchExpanded(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isMobile &&
        isSidebarOpen &&
        !e.target.closest(".sidebar") &&
        !e.target.closest(".mobile-menu-toggle")
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMobile, isSidebarOpen]);

  const handleLogout = async () => {
    localStorage.clear();
    window.location.href = "/AdminLogin";
  };

  // Mock Data - Users as cards
  const users = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      status: "active",
      balance: "$1,500",
      registration: "2024-01-15",
      avatarColor: "#667eea",
      phone: "+1 (555) 123-4567",
      location: "New York, USA",
      lastActive: "2 hours ago",
      kycStatus: "verified",
      totalInvestments: "$5,200",
      totalWithdrawals: "$3,700",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      status: "pending",
      balance: "$2,800",
      registration: "2024-01-14",
      avatarColor: "#764ba2",
      phone: "+1 (555) 234-5678",
      location: "London, UK",
      lastActive: "5 hours ago",
      kycStatus: "pending",
      totalInvestments: "$1,000",
      totalWithdrawals: "$200",
    },
    {
      id: 3,
      name: "Robert Johnson",
      email: "robert@example.com",
      status: "active",
      balance: "$5,200",
      registration: "2024-01-13",
      avatarColor: "#f56565",
      phone: "+1 (555) 345-6789",
      location: "Sydney, Australia",
      lastActive: "30 minutes ago",
      kycStatus: "verified",
      totalInvestments: "$12,500",
      totalWithdrawals: "$7,300",
    },
    {
      id: 4,
      name: "Sarah Wilson",
      email: "sarah@example.com",
      status: "suspended",
      balance: "$0",
      registration: "2024-01-12",
      avatarColor: "#38b2ac",
      phone: "+1 (555) 456-7890",
      location: "Toronto, Canada",
      lastActive: "2 days ago",
      kycStatus: "rejected",
      totalInvestments: "$0",
      totalWithdrawals: "$0",
    },
    {
      id: 5,
      name: "Michael Brown",
      email: "michael@example.com",
      status: "active",
      balance: "$3,400",
      registration: "2024-01-11",
      avatarColor: "#ed8936",
      phone: "+1 (555) 567-8901",
      location: "Berlin, Germany",
      lastActive: "1 hour ago",
      kycStatus: "verified",
      totalInvestments: "$8,900",
      totalWithdrawals: "$5,500",
    },
    {
      id: 6,
      name: "Emily Davis",
      email: "emily@example.com",
      status: "pending",
      balance: "$1,200",
      registration: "2024-01-10",
      avatarColor: "#9f7aea",
      phone: "+1 (555) 678-9012",
      location: "Tokyo, Japan",
      lastActive: "3 hours ago",
      kycStatus: "pending",
      totalInvestments: "$2,400",
      totalWithdrawals: "$1,200",
    },
    {
      id: 7,
      name: "David Miller",
      email: "david@example.com",
      status: "active",
      balance: "$4,800",
      registration: "2024-01-09",
      avatarColor: "#4299e1",
      phone: "+1 (555) 789-0123",
      location: "Paris, France",
      lastActive: "15 minutes ago",
      kycStatus: "verified",
      totalInvestments: "$15,200",
      totalWithdrawals: "$10,400",
    },
    {
      id: 8,
      name: "Lisa Taylor",
      email: "lisa@example.com",
      status: "active",
      balance: "$2,100",
      registration: "2024-01-08",
      avatarColor: "#48bb78",
      phone: "+1 (555) 890-1234",
      location: "Singapore",
      lastActive: "45 minutes ago",
      kycStatus: "verified",
      totalInvestments: "$6,500",
      totalWithdrawals: "$4,400",
    },
  ];

  const filterOptions = [
    { id: "all", label: "All Users" },
    { id: "active", label: "Active" },
    { id: "pending", label: "Pending" },
    { id: "suspended", label: "Suspended" },
  ];

  const filteredUsers = users.filter((user) => {
    if (activeFilter !== "all" && user.status !== activeFilter) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone.includes(query) ||
        user.location.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const stats = {
    totalUsers: 12456,
    activeUsers: 8923,
    totalRevenue: 458920,
    pendingTransactions: 15,
    growthRate: 12.5,
    avgBalance: 2450,
    newUsersToday: 24,
    activeInvestments: 89,
    withdrawalsToday: 12,
    depositRequests: 8,
  };

  const recentActivities = [
    {
      id: 1,
      user: "John Doe",
      action: "Made deposit",
      amount: "$500",
      time: "10:30 AM",
      type: "deposit",
      status: "completed",
    },
    {
      id: 2,
      user: "Jane Smith",
      action: "Started investment",
      amount: "$1,000",
      time: "11:45 AM",
      type: "investment",
      status: "processing",
    },
    {
      id: 3,
      user: "Robert Johnson",
      action: "Withdrawal request",
      amount: "$300",
      time: "1:15 PM",
      type: "withdrawal",
      status: "pending",
    },
    {
      id: 4,
      user: "Sarah Wilson",
      action: "KYC Verification",
      time: "2:30 PM",
      type: "kyc",
      status: "rejected",
    },
    {
      id: 5,
      user: "Michael Brown",
      action: "Account upgrade",
      amount: "$50",
      time: "3:45 PM",
      type: "upgrade",
      status: "completed",
    },
  ];

  const getStatusBadge = (status) => {
    const config = {
      active: {
        color: "#10b981",
        bgColor: "#d1fae5",
        icon: <CheckCircleOutlined />,
        label: "Active",
      },
      pending: {
        color: "#f59e0b",
        bgColor: "#fef3c7",
        icon: <ClockCircleOutlined />,
        label: "Pending",
      },
      suspended: {
        color: "#ef4444",
        bgColor: "#fee2e2",
        icon: <ExclamationCircleOutlined />,
        label: "Suspended",
      },
      completed: {
        color: "#10b981",
        bgColor: "#d1fae5",
        icon: <CheckCircleOutlined />,
        label: "Completed",
      },
      processing: {
        color: "#3b82f6",
        bgColor: "#dbeafe",
        icon: <ClockCircleOutlined />,
        label: "Processing",
      },
      rejected: {
        color: "#ef4444",
        bgColor: "#fee2e2",
        icon: <ExclamationCircleOutlined />,
        label: "Rejected",
      },
    };

    const configItem = config[status] || config.active;

    return (
      <span
        className="status-badge"
        style={{
          color: configItem.color,
          backgroundColor: configItem.bgColor,
          borderColor: configItem.color,
        }}
      >
        {configItem.icon}
        <span>{configItem.label}</span>
      </span>
    );
  };

  const getActivityIcon = (type) => {
    const icons = {
      deposit: <ArrowDownOutlined style={{ color: "#10b981" }} />,
      withdrawal: <ArrowUpOutlined style={{ color: "#ef4444" }} />,
      investment: <DollarOutlined style={{ color: "#8b5cf6" }} />,
      kyc: <UserOutlined style={{ color: "#3b82f6" }} />,
      upgrade: <CreditCardOutlined style={{ color: "#f59e0b" }} />,
    };
    return icons[type] || <DollarOutlined />;
  };

  const StatCard = ({
    title,
    value,
    change,
    icon,
    color,
    prefix = "",
    suffix = "",
  }) => (
    <div className="stat-card">
      <div className="stat-header">
        <div
          className="stat-icon"
          style={{ backgroundColor: color + "20", color: color }}
        >
          {icon}
        </div>
        <div className="stat-change">
          {change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          <span style={{ color: change >= 0 ? "#10b981" : "#ef4444" }}>
            {Math.abs(change)}%
          </span>
        </div>
      </div>
      <div className="stat-info">
        <h3>
          {prefix}
          {value.toLocaleString()}
          {suffix}
        </h3>
        <p>{title}</p>
      </div>
    </div>
  );

  const UserCard = ({ user }) => {
    const isActive = showUserActions === user.id;

    return (
      <div className="user-card" key={user.id}>
        <div className="user-card-header">
          <div
            className="user-avatar"
            style={{ backgroundColor: user.avatarColor }}
          >
            {user.name.charAt(0)}
          </div>
          <div className="user-info">
            <div className="user-name-email">
              <h4>{user.name}</h4>
              <p className="user-email">{user.email}</p>
            </div>
            <div className="user-location">
              <span className="location-icon">📍</span>
              <span>{user.location}</span>
            </div>
          </div>
          <div className="user-status">
            {getStatusBadge(user.status)}
            <button
              className="user-actions-toggle"
              onClick={() => setShowUserActions(isActive ? null : user.id)}
            >
              <span>•••</span>
            </button>
          </div>
        </div>

        <div className="user-card-body">
          <div className="user-stats">
            <div className="user-stat">
              <span className="stat-label">Balance</span>
              <span className="stat-value">{user.balance}</span>
            </div>
            <div className="user-stat">
              <span className="stat-label">Invested</span>
              <span className="stat-value">{user.totalInvestments}</span>
            </div>
            <div className="user-stat">
              <span className="stat-label">Withdrawn</span>
              <span className="stat-value">{user.totalWithdrawals}</span>
            </div>
            <div className="user-stat">
              <span className="stat-label">KYC</span>
              <span className={`kyc-status ${user.kycStatus}`}>
                {user.kycStatus === "verified"
                  ? "✓"
                  : user.kycStatus === "pending"
                    ? "⏳"
                    : "✗"}
              </span>
            </div>
          </div>

          <div className="user-meta">
            <div className="meta-item">
              <span className="meta-label">Phone</span>
              <span className="meta-value">{user.phone}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Joined</span>
              <span className="meta-value">{user.registration}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Last Active</span>
              <span className="meta-value">{user.lastActive}</span>
            </div>
          </div>
        </div>

        <div className="user-card-footer">
          <div className={`user-actions ${isActive ? "show" : ""}`}>
            <button className="action-btn view" title="View Profile">
              <EyeOutlined />
              <span>View</span>
            </button>
            <button className="action-btn edit" title="Edit User">
              <EditOutlined />
              <span>Edit</span>
            </button>
            <button className="action-btn message" title="Send Message">
              <span>💬</span>
              <span>Message</span>
            </button>
            <button className="action-btn delete" title="Delete User">
              <DeleteOutlined />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ActivityCard = ({ activity }) => (
    <div className="activity-card" key={activity.id}>
      <div className="activity-icon">{getActivityIcon(activity.type)}</div>
      <div className="activity-content">
        <div className="activity-header">
          <span className="user-name">{activity.user}</span>
          <span className="activity-action">{activity.action}</span>
          {activity.amount && (
            <span className="activity-amount">{activity.amount}</span>
          )}
        </div>
        <div className="activity-footer">
          <span className="activity-time">{activity.time}</span>
          {getStatusBadge(activity.status)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-container">
      {/* Mobile Menu Toggle */}
      {isMobile && (
        <button
          className="mobile-menu-toggle"
          onClick={(e) => {
            e.stopPropagation();
            setIsSidebarOpen(!isSidebarOpen);
          }}
        >
          <MenuOutlined />
        </button>
      )}

      {/* Overlay for mobile sidebar */}
      {isMobile && isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar ${isSidebarOpen ? "open" : ""} ${isMobile ? "mobile" : ""}`}
      >
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <DashboardOutlined />
            </div>
            <div className="logo-text">
              <h2>Admin Panel</h2>
              <p>v1.0.0</p>
            </div>
          </div>
          {isMobile && (
            <button
              className="close-btn"
              onClick={() => setIsSidebarOpen(false)}
            >
              ×
            </button>
          )}
        </div>

        <div className="sidebar-menu">
          <div className="menu-section">
            <h3 className="section-title">DASHBOARD</h3>
            <button
              className={`menu-btn ${activeSection === "users" ? "active" : ""}`}
              onClick={() => {
                setActiveSection("users");
                if (isMobile) setIsSidebarOpen(false);
              }}
            >
              <UserOutlined />
              <Link className="link" to="/adminHomePage">
                Users
              </Link>
              <span className="count-badge">{users.length}</span>
            </button>

            <button
              className={`menu-btn ${activeSection === "transactions" ? "active" : ""}`}
              onClick={() => {
                setActiveSection("transactions");
                if (isMobile) setIsSidebarOpen(false);
              }}
            >
              <DollarOutlined />
              <Link className="link" to="/adminTransactions">
                Transactions
              </Link>
              <span className="count-badge">{stats.pendingTransactions}</span>
            </button>

            <button
              className={`menu-btn ${activeSection === "investments" ? "active" : ""}`}
              onClick={() => {
                setActiveSection("investments");
                if (isMobile) setIsSidebarOpen(false);
              }}
            >
              <ShoppingCartOutlined />
              <Link className="link" to="/adminInvestment">
                Investments
              </Link>
              <span className="count-badge">89</span>
            </button>
          </div>

          <div className="menu-section">
            <h3 className="section-title">MANAGEMENT</h3>
            <button
              className={`menu-btn ${activeSection === "AddWallet" ? "active" : ""}`}
              onClick={() => {
                setActiveSection("AddWallet");
                if (isMobile) setIsSidebarOpen(false);
              }}
            >
              <WalletOutlined />
              <Link className="link" to="/adminAddWallet">
                Add Wallet
              </Link>
              <span className="count-badge">3</span>
            </button>

            <button
              className={`menu-btn ${activeSection === "settings" ? "active" : ""}`}
              onClick={() => {
                setActiveSection("settings");
                if (isMobile) setIsSidebarOpen(false);
              }}
            >
              <SettingOutlined />
              <Link className="link" to="/adminSettings">
                Settings
              </Link>
            </button>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar" style={{ backgroundColor: "#667eea" }}>
              A
            </div>
            <div className="user-info">
              <h4>Admin User</h4>
              <p>admin@example.com</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogoutOutlined />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Navigation */}
        <div className="top-nav">
          <div className="nav-left">
            <h1>Dashboard</h1>
            <p>Welcome back, Admin</p>
          </div>

          <div className="nav-right">
            <div
              className={`search-container ${isSearchExpanded ? "expanded" : ""}`}
            >
              {!isMobile && (
                <>
                  <SearchOutlined />
                  <input
                    type="text"
                    placeholder="Search users, transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </>
              )}

              {isMobile && isSearchExpanded && (
                <div className="mobile-search-input">
                  <SearchOutlined />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <button
                    className="close-search"
                    onClick={() => setIsSearchExpanded(false)}
                  >
                    ×
                  </button>
                </div>
              )}

              {isMobile && !isSearchExpanded && (
                <button
                  className="mobile-search-btn"
                  onClick={() => setIsSearchExpanded(true)}
                >
                  <SearchOutlined />
                </button>
              )}
            </div>

            <div className="notification-bell">
              <BellOutlined />
              <span className="notification-badge">3</span>
            </div>

            <div className="user-dropdown">
              <div
                className="avatar-small"
                style={{ backgroundColor: "#667eea" }}
              >
                A
              </div>
              {!isMobile && <CaretDownOutlined />}
            </div>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="stats-grid">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            change={12.5}
            icon={<TeamOutlined />}
            color="#667eea"
          />

          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            change={8.2}
            icon={<UserOutlined />}
            color="#10b981"
          />

          <StatCard
            title="Total Revenue"
            value={stats.totalRevenue}
            change={15.3}
            icon={<DollarOutlined />}
            color="#f59e0b"
            prefix="$"
          />

          <StatCard
            title="Avg Balance"
            value={stats.avgBalance}
            change={5.7}
            icon={<WalletOutlined />}
            color="#9f7aea"
            prefix="$"
          />
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filter-tabs">
            {filterOptions.map((filter) => (
              <button
                key={filter.id}
                className={`filter-tab ${activeFilter === filter.id ? "active" : ""}`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
                {filter.id === "all" && (
                  <span className="filter-count">{users.length}</span>
                )}
              </button>
            ))}
          </div>

          <div className="filter-actions">
            <button className="btn-icon">
              <FilterOutlined />
              <span>More Filters</span>
            </button>
            <button className="btn-icon">
              <DownloadOutlined />
              <span>Export</span>
            </button>
            <button className="btn-primary">
              <PlusOutlined />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Main Content Area - Cards Grid */}
        <div className="content-grid">
          {/* Users Cards Section */}
          <div className="users-section">
            <div className="section-header">
              <h2>Users Overview</h2>
              <div className="results-info">
                <span className="results-count">
                  Showing {filteredUsers.length} of {users.length} users
                </span>
                {(searchQuery || activeFilter !== "all") && (
                  <button
                    className="btn-text"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveFilter("all");
                    }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {filteredUsers.length > 0 ? (
              <div className="users-grid">
                {filteredUsers.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <UserOutlined />
                <h3>No users found</h3>
                <p>
                  {searchQuery
                    ? "No users match your search criteria"
                    : "No users available with the selected filter"}
                </p>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveFilter("all");
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Sidebar Cards */}
          <div className="sidebar-cards">
            {/* Recent Activity Card */}
            <div className="sidebar-card activity-card">
              <div className="card-header">
                <h2>Recent Activity</h2>
                <button className="btn-text">View All</button>
              </div>

              <div className="activity-list">
                {recentActivities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="sidebar-card quick-stats-card">
              <div className="card-header">
                <h2>Quick Stats</h2>
                <span className="update-time">Updated just now</span>
              </div>

              <div className="stats-list">
                <div className="stat-item">
                  <div className="stat-label">
                    <span
                      className="stat-dot"
                      style={{ backgroundColor: "#667eea" }}
                    ></span>
                    <span>New Users Today</span>
                  </div>
                  <div className="stat-value">{stats.newUsersToday}</div>
                </div>

                <div className="stat-item">
                  <div className="stat-label">
                    <span
                      className="stat-dot"
                      style={{ backgroundColor: "#10b981" }}
                    ></span>
                    <span>Pending Transactions</span>
                  </div>
                  <div className="stat-value">{stats.pendingTransactions}</div>
                </div>

                <div className="stat-item">
                  <div className="stat-label">
                    <span
                      className="stat-dot"
                      style={{ backgroundColor: "#f59e0b" }}
                    ></span>
                    <span>Active Investments</span>
                  </div>
                  <div className="stat-value">{stats.activeInvestments}</div>
                </div>

                <div className="stat-item">
                  <div className="stat-label">
                    <span
                      className="stat-dot"
                      style={{ backgroundColor: "#9f7aea" }}
                    ></span>
                    <span>Withdrawals Today</span>
                  </div>
                  <div className="stat-value">{stats.withdrawalsToday}</div>
                </div>

                <div className="stat-item">
                  <div className="stat-label">
                    <span
                      className="stat-dot"
                      style={{ backgroundColor: "#4299e1" }}
                    ></span>
                    <span>Deposit Requests</span>
                  </div>
                  <div className="stat-value">{stats.depositRequests}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <p>© 2024 Admin Panel. All rights reserved.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#help">Help Center</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;
