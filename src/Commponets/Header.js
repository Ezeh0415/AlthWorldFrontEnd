import React, { useState, useEffect, useRef } from "react";
import {
  MenuOutlined,
  CloseOutlined,
  BellOutlined,
  SearchOutlined,
  UserOutlined,
  DownOutlined,
  SettingOutlined,
  LogoutOutlined,
  HomeOutlined,
  WalletOutlined,
  RiseOutlined,
  FileTextOutlined,
  UserOutlined as UserCircleOutlined,
} from "@ant-design/icons";
import "../styles/Header.css";
import logo from "../Assets/logo.svg";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [notifications] = useState(3);

  const profileRef = useRef(null);
  const menuRef = useRef(null);
  const Navigate = useNavigate();

  const navItems = [
    { id: 1, label: "Dashboard", icon: <HomeOutlined />, path: "/" },
    { id: 2, label: "Wallet", icon: <WalletOutlined />, path: "/wallet" },
    {
      id: 3,
      label: "Investments",
      icon: <RiseOutlined />,
      path: "/investments",
    },
    {
      id: 4,
      label: "Transactions",
      icon: <FileTextOutlined />,
      path: "/transactions",
    },
    { id: 5, label: "Profile", icon: <UserCircleOutlined />, path: "/profile" },
  ];

  const userData = {
    name: "John Doe",
    email: "john@example.com",
    tier: "Premium Tier",
    avatarColor: "linear-gradient(135deg, #22c55e, #3b82f6)",
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !event.target.closest(".menu-toggle")
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, []);

  const handleNavClick = (label, path) => {
    setActiveNav(label);
    setIsMenuOpen(false);
    Navigate(`${path}`);
    console.log(`Navigating to ${path}`);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      console.log(`Searching for: ${searchQuery}`);
    }
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    setIsMenuOpen(false);
    localStorage.clear();
    Navigate("/login");
  };

  const handleNotificationClick = () => {
    console.log("Opening notifications...");
  };

  const handleProfileClick = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleOverlayClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="header" role="banner">
        <div className="header-left">
          <div className="logo-container">
            <img
              src={logo}
              alt="Crypto Invest Logo"
              className="header-logo"
              aria-label="Crypto Invest Logo"
            />
            <span className="logo-text">AllthWorld</span>
          </div>

          <nav className="header-nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-link ${
                  activeNav === item.label ? "active" : ""
                }`}
                onClick={() => handleNavClick(item.label, item.path)}
                aria-current={activeNav === item.label ? "page" : undefined}
                aria-label={`Navigate to ${item.label}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="header-right">
      <button
            className="icon-btn notification-btn"
            onClick={handleNotificationClick}
            aria-label={`Notifications, ${notifications} unread`}
          >
            <BellOutlined />
            {notifications > 0 && (
              <span
                className="notification-badge"
                aria-label={`${notifications} unread notifications`}
              >
                {notifications}
              </span>
            )}
          </button>

          <div className="profile-container" ref={profileRef}>
            <button
              className="profile-btn"
              onClick={handleProfileClick}
              aria-expanded={isProfileOpen}
              aria-label="User profile menu"
              aria-haspopup="true"
            >
              <div
                className="avatar"
                style={{ background: userData.avatarColor }}
                aria-hidden="true"
              >
                <UserOutlined />
              </div>
              <div className="profile-info">
                <span className="profile-name">{userData.name}</span>
              </div>
              <DownOutlined
                className={`dropdown-icon ${isProfileOpen ? "rotate" : ""}`}
                aria-hidden="true"
              />
            </button>

            {isProfileOpen && (
              <div
                className="profile-dropdown"
                role="menu"
                aria-label="User menu"
              >
                <div className="dropdown-header">
                  <div
                    className="dropdown-avatar"
                    style={{ background: userData.avatarColor }}
                    aria-hidden="true"
                  >
                    <UserOutlined />
                  </div>
                  <div>
                    <p className="dropdown-name">{userData.name}</p>
                    <p className="dropdown-email">{userData.email}</p>
                  </div>
                </div>
                <div className="dropdown-divider" aria-hidden="true" />

                <button
                  className="dropdown-item"
                  role="menuitem"
                  onClick={() => handleNavClick("Profile", "/profile")}
                >
                  <UserCircleOutlined />
                  <span>My Profile</span>
                </button>

                <button
                  className="dropdown-item"
                  role="menuitem"
                  onClick={() => console.log("Settings clicked")}
                >
                  <SettingOutlined />
                  <span>Settings</span>
                </button>

                <div className="dropdown-divider" aria-hidden="true" />

                <button
                  className="dropdown-item logout"
                  role="menuitem"
                  onClick={handleLogout}
                  aria-label="Log out"
                >
                  <LogoutOutlined />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          <button
            className="menu-toggle"
            onClick={handleMenuToggle}
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={`mobile-menu ${isMenuOpen ? "open" : ""}`}
        ref={menuRef}
        aria-hidden={!isMenuOpen}
      >
        <div className="mobile-menu-header">
          <div className="mobile-profile">
            <div
              className="mobile-avatar"
              style={{ background: userData.avatarColor }}
              aria-hidden="true"
            >
              <UserOutlined />
            </div>
            <div>
              <p className="mobile-name">{userData.name}</p>
              <p className="mobile-email">{userData.tier}</p>
            </div>
          </div>
        </div>

        <div className="mobile-search">
          <div className="mobile-search-icon">
            <SearchOutlined />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="mobile-search-input"
            value={searchQuery}
            onChange={handleSearch}
            onKeyDown={handleSearchSubmit}
            aria-label="Search"
          />
        </div>

        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`mobile-nav-link ${
                activeNav === item.label ? "active" : ""
              }`}
              onClick={() => handleNavClick(item.label, item.path)}
              aria-current={activeNav === item.label ? "page" : undefined}
            >
              <span className="mobile-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mobile-menu-footer">
          <button
            className="mobile-menu-item logout"
            onClick={handleLogout}
            aria-label="Log out"
          >
            <LogoutOutlined />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div
          className="menu-overlay"
          onClick={handleOverlayClick}
          aria-label="Close menu"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleOverlayClick()}
        />
      )}
    </>
  );
};

export default Header;
