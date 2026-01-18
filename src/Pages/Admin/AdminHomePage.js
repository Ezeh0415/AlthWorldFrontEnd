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
} from "@ant-design/icons";
import "../../styles/Admin/AdminHomePage.css";
import ApiServices from "../../Commponets/ApiService";
import { Link } from "react-router-dom";

const AdminHomePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New user registered", time: "5 min ago", unread: true },
    { id: 2, message: "Transaction completed", time: "1 hour ago", unread: true },
    { id: 3, message: "System update available", time: "2 hours ago", unread: false },
  ]);

  // Responsive handling
  useEffect(() => {
    const checkScreenSize = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      setIsSidebarOpen(!isMobileView); // Open on desktop, closed on mobile
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
    await ApiServices.logOut();
    window.location.href = "/AdminLogin";
  };

  // Mock Data
  const users = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      status: "active",
      balance: "$1,500",
      registration: "2024-01-15",
      avatarColor: "#667eea",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      status: "pending",
      balance: "$2,800",
      registration: "2024-01-14",
      avatarColor: "#764ba2",
    },
    {
      id: 3,
      name: "Robert Johnson",
      email: "robert@example.com",
      status: "active",
      balance: "$5,200",
      registration: "2024-01-13",
      avatarColor: "#f56565",
    },
    {
      id: 4,
      name: "Sarah Wilson",
      email: "sarah@example.com",
      status: "suspended",
      balance: "$0",
      registration: "2024-01-12",
      avatarColor: "#38b2ac",
    },
    {
      id: 5,
      name: "Michael Brown",
      email: "michael@example.com",
      status: "active",
      balance: "$3,400",
      registration: "2024-01-11",
      avatarColor: "#ed8936",
    },
    {
      id: 6,
      name: "Emily Davis",
      email: "emily@example.com",
      status: "pending",
      balance: "$1,200",
      registration: "2024-01-10",
      avatarColor: "#9f7aea",
    },
  ];

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalUsers: 12456,
    activeUsers: 8923,
    totalRevenue: 458920,
    pendingTransactions: 15,
    growthRate: 12.5,
    avgBalance: 2450,
  };

  const recentActivities = [
    { id: 1, user: "John Doe", action: "Made deposit", amount: "$500", time: "10:30 AM" },
    { id: 2, user: "Jane Smith", action: "Started investment", amount: "$1,000", time: "11:45 AM" },
    { id: 3, user: "Robert Johnson", action: "Withdrawal", amount: "$300", time: "1:15 PM" },
    { id: 4, user: "Sarah Wilson", action: "Updated profile", time: "2:30 PM" },
  ];

  const getStatusBadge = (status) => {
    const config = {
      active: { 
        color: "#10b981", 
        bgColor: "#d1fae5",
        icon: <CheckCircleOutlined /> 
      },
      pending: { 
        color: "#f59e0b", 
        bgColor: "#fef3c7",
        icon: <ClockCircleOutlined /> 
      },
      suspended: { 
        color: "#ef4444", 
        bgColor: "#fee2e2",
        icon: <ExclamationCircleOutlined /> 
      },
    };

    const configItem = config[status] || config.active;

    return (
      <span 
        className="status-badge" 
        style={{ 
          color: configItem.color,
          backgroundColor: configItem.bgColor,
          borderColor: configItem.color 
        }}
      >
        {configItem.icon}
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </span>
    );
  };

  const StatCard = ({ title, value, change, icon, color }) => (
    <div className="stat-card">
      <div className="stat-header">
        <div className="stat-icon" style={{ backgroundColor: color + '20', color: color }}>
          {icon}
        </div>
        <div className="stat-change">
          {change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          <span style={{ color: change >= 0 ? '#10b981' : '#ef4444' }}>
            {Math.abs(change)}%
          </span>
        </div>
      </div>
      <div className="stat-info">
        <h3>{value.toLocaleString()}</h3>
        <p>{title}</p>
      </div>
    </div>
  );

  return (
    <div className="admin-container">
      {/* Mobile Menu Toggle */}
      {isMobile && (
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
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
              <span className="count-badge">3</span>
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
            <div className="avatar" style={{ backgroundColor: '#667eea' }}>
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
            <div className="search-container">
              <SearchOutlined />
              <input 
                type="text" 
                placeholder="Search users, transactions..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="notification-bell">
              <BellOutlined />
              {notifications.filter(n => n.unread).length > 0 && (
                <span className="notification-badge">
                  {notifications.filter(n => n.unread).length}
                </span>
              )}
            </div>
            
            <div className="user-dropdown">
              <div className="avatar-small" style={{ backgroundColor: '#667eea' }}>
                A
              </div>
              <CaretDownOutlined />
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
          />
          
          <StatCard 
            title="Avg Balance" 
            value={stats.avgBalance} 
            change={5.7}
            icon={<WalletOutlined />}
            color="#9f7aea"
          />
        </div>

        {/* Main Content Area */}
        <div className="content-grid">
          {/* Users Table */}
          <div className="content-card table-section">
            <div className="card-header">
              <h2>Users Overview</h2>
              <button className="btn-primary">
                <PlusOutlined />
                Add User
              </button>
            </div>
            
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Balance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-info">
                          <div className="avatar" style={{ backgroundColor: user.avatarColor }}>
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="user-name">{user.name}</div>
                            <div className="user-date">Joined {user.registration}</div>
                          </div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{getStatusBadge(user.status)}</td>
                      <td className="balance">{user.balance}</td>
                      <td>
                        <div className="action-btns">
                          <button className="action-btn view" title="View">
                            <EyeOutlined />
                          </button>
                          <button className="action-btn edit" title="Edit">
                            <EditOutlined />
                          </button>
                          <button className="action-btn delete" title="Delete">
                            <DeleteOutlined />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredUsers.length === 0 && (
              <div className="empty-state">
                <UserOutlined />
                <p>No users found matching your search</p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="content-card activity-section">
            <div className="card-header">
              <h2>Recent Activity</h2>
              <button className="btn-text">View All</button>
            </div>
            
            <div className="activity-list">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    <div className="avatar-small" style={{ backgroundColor: '#667eea' }}>
                      {activity.user.charAt(0)}
                    </div>
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">
                      <span className="user-name">{activity.user}</span>
                      <span className="activity-action">{activity.action}</span>
                      {activity.amount && (
                        <span className="activity-amount">{activity.amount}</span>
                      )}
                    </div>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="content-card quick-stats">
            <div className="card-header">
              <h2>Quick Stats</h2>
            </div>
            
            <div className="stats-list">
              <div className="stat-item">
                <div className="stat-label">
                  <span className="stat-dot" style={{ backgroundColor: '#667eea' }}></span>
                  <span>New Users Today</span>
                </div>
                <div className="stat-value">24</div>
              </div>
              
              <div className="stat-item">
                <div className="stat-label">
                  <span className="stat-dot" style={{ backgroundColor: '#10b981' }}></span>
                  <span>Pending Transactions</span>
                </div>
                <div className="stat-value">{stats.pendingTransactions}</div>
              </div>
              
              <div className="stat-item">
                <div className="stat-label">
                  <span className="stat-dot" style={{ backgroundColor: '#f59e0b' }}></span>
                  <span>Active Investments</span>
                </div>
                <div className="stat-value">89</div>
              </div>
              
              <div className="stat-item">
                <div className="stat-label">
                  <span className="stat-dot" style={{ backgroundColor: '#9f7aea' }}></span>
                  <span>Withdrawals Today</span>
                </div>
                <div className="stat-value">12</div>
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