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
  CloseOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlusOutlined,
  SettingOutlined,
  BellOutlined,
  CaretDownOutlined,
  CreditCardOutlined,
  LineChartOutlined,
  LoadingOutlined,
  FilterOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  UserAddOutlined,
  TransactionOutlined,
  SafetyOutlined,
  AreaChartOutlined,
} from "@ant-design/icons";
import "../../styles/Admin/AdminHomePage.css";
import ApiServices from "../../Commponets/ApiService";
import { Link, useNavigate } from "react-router-dom";

const AdminHomePage = () => {
  // State Management
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showUserActions, setShowUserActions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setErrors] = useState();

  // Data States
  const [dashboardData, setDashboardData] = useState({
    users: [],
    totalInvestment: 0,
    totalUser: 0,
  });

  const navigate = useNavigate();

  // Authentication Check
  // const checkAuth = () => {
  //   const role = ApiServices.isAdmin();
  //   const token = ApiServices.isAuthenticated();

  //   if (!token || role !== "admin") {
  //     navigate("/AdminLogin");
  //     return false;
  //   }
  //   return true;
  // };

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    // if (!checkAuth()) return;

    try {
      setLoading(true);
      const response = await ApiServices.dashboardAdminUsers();

      if (response && response.data) {
        setDashboardData({
          users: response.data.users || [],
          totalInvestment: response.data.totalInvestment || 0,
          totalUser: response.data.totalUser || 0,
        });
      }
    } catch (err) {
      setErrors("Error fetching dashboard data:");
      if (
        err.message.includes("Unauthorized") ||
        err.response?.status === 401
      ) {
        localStorage.clear();
        navigate("/AdminLogin");
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial Data Fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Responsive Handling
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

  // Handlers
  const handleLogout = () => {
    localStorage.clear();
    navigate("/AdminLogin");
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Filter users
  const filterOptions = [
    { id: "all", label: "All Users", count: dashboardData.users.length },
    {
      id: "admin",
      label: "Admins",
      count: dashboardData.users.filter((u) => u.role === "admin").length,
    },
    {
      id: "user",
      label: "Users",
      count: dashboardData.users.filter((u) => u.role === "user").length,
    },
  ];

  const filteredUsers = dashboardData.users.filter((user) => {
    if (activeFilter !== "all" && user.role !== activeFilter) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        (user.fullName || "").toLowerCase().includes(query) ||
        (user.email || "").toLowerCase().includes(query) ||
        (user.userName || "").toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Helper Functions
  const getRoleBadge = (role) => {
    const config = {
      admin: {
        color: "#8b5cf6",
        bgColor: "#ede9fe",
        icon: <SafetyOutlined />,
        label: "Admin",
      },
      user: {
        color: "#10b981",
        bgColor: "#d1fae5",
        icon: <UserOutlined />,
        label: "User",
      },
    };

    const configItem = config[role] || config.user;

    return (
      <span
        className="role-badge"
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getAvatarColor = (name) => {
    const colors = [
      "#667eea",
      "#764ba2",
      "#f56565",
      "#38b2ac",
      "#ed8936",
      "#9f7aea",
      "#4299e1",
      "#48bb78",
    ];
    const index = name?.length % colors.length || 0;
    return colors[index];
  };

  // Dashboard Stats Cards
  const StatCard = ({
    title,
    value,
    icon,
    color,
    trend,
    isCurrency = false,
  }) => (
    <div className="stat-card modern">
      <div
        className="stat-icon-wrapper"
        style={{ backgroundColor: `${color}15` }}
      >
        <div className="stat-icon" style={{ color }}>
          {icon}
        </div>
      </div>
      <div className="stat-content">
        <h3 className="stat-value">
          {isCurrency ? formatCurrency(value) : value}
        </h3>
        <p className="stat-title">{title}</p>
        {trend && (
          <div className="stat-trend">
            <ArrowUpOutlined style={{ color: "#10b981" }} />
            <span style={{ color: "#10b981" }}>{trend}%</span>
            <span className="trend-label"> vs last month</span>
          </div>
        )}
      </div>
    </div>
  );

  // User Card Component
  const UserCard = ({ user }) => {
    const isActive = showUserActions === user._id;
    const avatarColor = getAvatarColor(user.fullName);

    return (
      <div className="user-card modern">
        <div className="user-card-header">
          <div className="user-avatar" style={{ backgroundColor: avatarColor }}>
            {user.fullName?.charAt(0) || "U"}
          </div>
          <div className="user-main-info">
            <div className="user-name-email">
              <h4>{user.fullName || "No Name"}</h4>
              <p className="user-email">{user.email}</p>
            </div>
            <div className="user-meta">
              <span className="user-username">@{user.userName}</span>
              {getRoleBadge(user.role)}
            </div>
          </div>
          <button
            className="user-actions-toggle"
            onClick={() => setShowUserActions(isActive ? null : user._id)}
          >
            <span>•••</span>
          </button>
        </div>

        <div className="user-card-body">
          <div className="user-details-grid">
            <div className="detail-item">
              <span className="detail-label">User ID</span>
              <span className="detail-value truncate">
                {user._id.substring(0, 8)}...
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Created</span>
              <span className="detail-value">
                {new Date(user.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* <div className="user-card-footer">
          <div className="user-actions">
            <button className="action-btn view" title="View Details">
              <EyeOutlined />
            </button>
            <button className="action-btn edit" title="Edit User">
              <EditOutlined />
            </button>
            <button className="action-btn message" title="Send Message">
              <span>✉️</span>
            </button>
            {user.role !== "admin" && (
              <button className="action-btn delete" title="Delete User">
                <DeleteOutlined />
              </button>
            )}
          </div>
        </div> */}
      </div>
    );
  };

  return (
    <div className="admin-container modern">
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

      {/* Modern Sidebar */}
      <div
        className={`sidebar modern ${isSidebarOpen ? "open" : ""} ${isMobile ? "mobile" : ""}`}
      >
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon gradient">
              <DashboardOutlined />
            </div>
            <div className="logo-text">
              <h2>AdminHub</h2>
              <p>Dashboard v2.0</p>
            </div>
          </div>
        </div>

        <div className="sidebar-menu">
          <div className="menu-section">
            <h3 className="section-title">MAIN</h3>
            <Link to="/adminHomePage" className="menu-btn active">
              <DashboardOutlined />
              <span>Dashboard</span>
            </Link>

            

            <Link to="/adminTransactions" className="menu-btn">
              <TransactionOutlined />
              <span>Transactions</span>
            </Link>

            <Link to="/adminInvestment" className="menu-btn">
              <AreaChartOutlined />
              <span>Investments</span>
              <span className="count-badge">
                {dashboardData.totalInvestment}
              </span>
            </Link>
          </div>

          <div className="menu-section">
            <h3 className="section-title">TOOLS</h3>
            <Link to="/adminAddWallet" className="menu-btn">
              <WalletOutlined />
              <span>Wallets</span>
            </Link>

            {/* <Link to="/adminSettings" className="menu-btn">
              <SettingOutlined />
              <span>Settings</span>
            </Link> */}

            <button className="menu-btn" onClick={handleRefresh}>
              <LoadingOutlined />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar gradient">A</div>
            <div className="user-info">
              <h4>Administrator</h4>
              <p>System Admin</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogoutOutlined />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content modern">
        {/* Top Navigation */}
        <div className="top-nav">
          <div className="nav-left">
            <h1>Dashboard Overview</h1>
            <p className="welcome-text">
              Welcome back! Here's what's happening today.
            </p>
          </div>

          <div className="nav-right">
            <div
              className={`search-container ${isSearchExpanded ? "expanded" : ""}`}
            >
              <SearchOutlined />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

            <div className="notification-bell">
              <BellOutlined />
              <span className="notification-badge">3</span>
            </div>

            <button
              className="btn-primary add-user-btn"
              onClick={handleRefresh}
            >
              <LoadingOutlined />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview">
          <h2 className="section-title">Platform Overview</h2>
          <div className="stats-grid modern">
            <StatCard
              title="Total Users"
              value={dashboardData.totalUser}
              icon={<TeamOutlined />}
              color="#667eea"
              trend={12.5}
            />

            <StatCard
              title="Total Investment"
              value={dashboardData.totalInvestment}
              icon={<DollarOutlined />}
              color="#10b981"
              trend={18.2}
              isCurrency={true}
            />

            <StatCard
              title="Active Users"
              value={filteredUsers.length}
              icon={<UserOutlined />}
              color="#f59e0b"
              trend={8.7}
            />

            {/* <StatCard
              title="Avg. Investment"
              value={
                dashboardData.totalUser > 0
                  ? dashboardData.totalInvestment / dashboardData.totalUser
                  : 0
              }
              icon={<LineChartOutlined />}
              color="#9f7aea"
              trend={5.3}
              isCurrency={true}
            /> */}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="content-wrapper">
          {/* Users Section Header */}
          <div className="section-header">
            <div className="header-left">
              <h2>User Management</h2>
              <p className="subtitle">
                {filteredUsers.length} user
                {filteredUsers.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="header-right">
              <div className="filter-tabs">
                {filterOptions.map((filter) => (
                  <button
                    key={filter.id}
                    className={`filter-tab ${activeFilter === filter.id ? "active" : ""}`}
                    onClick={() => setActiveFilter(filter.id)}
                  >
                    {filter.label}
                    <span className="tab-count">{filter.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Users Grid */}
          {loading ? (
            <div className="loading-container">
              <LoadingOutlined
                spin
                style={{ fontSize: 48, color: "#667eea" }}
              />
              <p>Loading dashboard data...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <TeamOutlined style={{ fontSize: 64, color: "#9ca3af" }} />
              <h3>No users found</h3>
              <p>
                {searchQuery
                  ? "No users match your search criteria"
                  : "No users available in the system"}
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
          ) : (
            <div className="users-grid modern">
              {filteredUsers.map((user) => (
                <UserCard key={user._id} user={user} />
              ))}
            </div>
          )}

          {/* Summary Footer */}
          <div className="summary-footer">
            <div className="summary-item">
              <div className="summary-content">
                <h4>Data Summary</h4>
                <p>
                  Showing {filteredUsers.length} of {dashboardData.totalUser}{" "}
                  total users
                </p>
              </div>
            </div>

            <div className="summary-actions">
              <button className="btn-primary" onClick={handleRefresh}>
                <LoadingOutlined />
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="footer modern">
          <p>
            © {new Date().getFullYear()} AdminHub Dashboard. All rights
            reserved.
          </p>
          <div className="footer-links">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            <div className="footer-actions">
              <a href="#help">Help</a>
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;
