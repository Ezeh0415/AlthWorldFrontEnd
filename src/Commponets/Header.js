import React, { useState, useEffect, useRef } from "react";
import {
  MenuOutlined,
  CloseOutlined,
  BellOutlined,
  SearchOutlined,
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
  HomeOutlined,
  WalletOutlined,
  RiseOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import "../styles/Header.css";
import logo from "../Assets/ChatGPT Image Jan 22, 2026, 12_37_21 AM.png";
import { useNavigate } from "react-router-dom";
import ApiService from "./ApiService";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [notifications] = useState(3);

  const profileRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

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
    // { id: 5, label: "Profile", icon: <UserCircleOutlined />, path: "/profile" },
  ];

  const userStr = ApiService.getUser();
  const userData = {
    name: userStr?.fullName || "User",
    email: userStr?.email || "user@example.com",
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
        !event.target.closest(".header__mobile-toggle")
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
    navigate(path);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      console.log(`Searching for: ${searchQuery}`);
      // Implement search functionality
    }
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    setIsMenuOpen(false);
    navigate("/login");
    localStorage.clear();
  };

  return (
    <>
      {/* Main Header */}
      <header className="header header--main" role="banner">
        <div className="header__container">
          {/* Left Section - Logo & Navigation */}
          <div className="header__left-section">
            {/* Logo */}
            <div className="header__brand">
              <img
                src={logo}
                alt="Crypto Invest Logo"
                className="header__logo"
                aria-label="AllthWorld Logo"
              />
              {/* <span className="header__brand-name">AllthWorld</span> */}
            </div>

            {/* Desktop Navigation */}
            <nav
              className="header__desktop-nav"
              aria-label="Primary Navigation"
            >
              <ul className="header__nav-list">
                {navItems.map((item) => (
                  <li key={item.id} className="header__nav-item">
                    <button
                      className={`header__nav-button ${
                        activeNav === item.label
                          ? "header__nav-button--active"
                          : ""
                      }`}
                      onClick={() => handleNavClick(item.label, item.path)}
                      aria-current={
                        activeNav === item.label ? "page" : undefined
                      }
                      aria-label={`Go to ${item.label}`}
                    >
                      <span className="header__nav-icon">{item.icon}</span>
                      <span className="header__nav-label">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Right Section - Search & User Controls */}
          <div className="header__right-section">
            {/* Search Bar (Desktop) */}
            {/* <div className="header__search-wrapper header__search-wrapper--desktop">
              <SearchOutlined className="header__search-icon" />
              <input
                type="search"
                placeholder="Search transactions, assets..."
                className="header__search-input"
                value={searchQuery}
                onChange={handleSearch}
                onKeyDown={handleSearchSubmit}
                aria-label="Search"
              />
            </div> */}

            {/* Notifications */}
            <button
              className="header__action-button header__action-button--notifications"
              onClick={() => console.log("Notifications clicked")}
              aria-label={`Notifications, ${notifications} unread`}
            >
              <BellOutlined className="header__action-icon" />
              {notifications > 0 && (
                <span
                  className="header__notification-badge"
                  aria-label={`${notifications} unread`}
                >
                  {notifications}
                </span>
              )}
            </button>

            {/* User Profile Dropdown */}
            <div className="header__user-profile" ref={profileRef}>
              <button
                className="header__user-trigger"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                aria-expanded={isProfileOpen}
                aria-label="User profile menu"
                aria-haspopup="true"
              >
                <div
                  className="header__user-avatar"
                  style={{ background: userData.avatarColor }}
                  aria-hidden="true"
                >
                  <UserOutlined className="header__avatar-icon" />
                </div>
                <div className="header__user-info">
                  <span className="header__user-name">{userData.name}</span>
                  <span className="header__user-email">{userData.email}</span>
                </div>
                <DownOutlined
                  className={`header__dropdown-arrow ${
                    isProfileOpen ? "header__dropdown-arrow--open" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div
                  className="header__dropdown-menu"
                  role="menu"
                  aria-label="User menu"
                >
                  <div className="header__dropdown-header">
                    <div
                      className="header__dropdown-avatar"
                      style={{ background: userData.avatarColor }}
                      aria-hidden="true"
                    >
                      <UserOutlined className="header__dropdown-avatar-icon" />
                    </div>
                    <div className="header__dropdown-user-info">
                      <p className="header__dropdown-name">{userData.name}</p>
                      <p className="header__dropdown-email">{userData.email}</p>
                    </div>
                  </div>

                  <div
                    className="header__dropdown-divider"
                    aria-hidden="true"
                  />

                  {/* <button
                    className="header__dropdown-item"
                    role="menuitem"
                    onClick={() => handleNavClick("Profile", "/profile")}
                  >
                    <UserCircleOutlined className="header__dropdown-item-icon" />
                    <span className="header__dropdown-item-text">
                      My Profile
                    </span>
                  </button> */}

                  {/* <button
                    className="header__dropdown-item"
                    role="menuitem"
                    onClick={() => console.log("Settings clicked")}
                  >
                    <SettingOutlined className="header__dropdown-item-icon" />
                    <span className="header__dropdown-item-text">Settings</span>
                  </button> */}

                  <div
                    className="header__dropdown-divider"
                    aria-hidden="true"
                  />

                  <button
                    className="header__dropdown-item header__dropdown-item--logout"
                    role="menuitem"
                    onClick={handleLogout}
                    aria-label="Log out"
                  >
                    <LogoutOutlined className="header__dropdown-item-icon" />
                    <span className="header__dropdown-item-text">Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="header__mobile-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-label="Toggle mobile menu"
              aria-controls="mobile-navigation"
            >
              {isMenuOpen ? (
                <CloseOutlined className="header__toggle-icon" />
              ) : (
                <MenuOutlined className="header__toggle-icon" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {isMenuOpen && (
        <div
          className="header__mobile-overlay"
          onClick={() => setIsMenuOpen(false)}
          aria-label="Close mobile menu"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation Panel */}
      <div
        id="mobile-navigation"
        className={`header__mobile-panel ${isMenuOpen ? "header__mobile-panel--open" : ""}`}
        ref={menuRef}
        aria-hidden={!isMenuOpen}
      >
        {/* Mobile Header */}
        <div className="header__mobile-header">
          <div className="header__mobile-user">
            <div
              className="header__mobile-avatar"
              style={{ background: userData.avatarColor }}
              aria-hidden="true"
            >
              <UserOutlined className="header__mobile-avatar-icon" />
            </div>
            <div className="header__mobile-user-details">
              <p className="header__mobile-user-name">{userData.name}</p>
              <p className="header__mobile-user-tier">
                {userData.tier || "Standard User"}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="header__mobile-search">
          <SearchOutlined className="header__mobile-search-icon" />
          <input
            type="search"
            placeholder="Search..."
            className="header__mobile-search-input"
            value={searchQuery}
            onChange={handleSearch}
            onKeyDown={handleSearchSubmit}
            aria-label="Search"
          />
        </div>

        {/* Mobile Navigation */}
        <nav className="header__mobile-nav" aria-label="Mobile Navigation">
          <ul className="header__mobile-nav-list">
            {navItems.map((item) => (
              <li key={item.id} className="header__mobile-nav-item">
                <button
                  className={`header__mobile-nav-button ${
                    activeNav === item.label
                      ? "header__mobile-nav-button--active"
                      : ""
                  }`}
                  onClick={() => handleNavClick(item.label, item.path)}
                  aria-current={activeNav === item.label ? "page" : undefined}
                >
                  <span className="header__mobile-nav-icon">{item.icon}</span>
                  <span className="header__mobile-nav-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Footer */}
        <div className="header__mobile-footer">
          <button
            className="header__mobile-logout-button"
            onClick={handleLogout}
            aria-label="Log out"
          >
            <LogoutOutlined className="header__mobile-logout-icon" />
            <span className="header__mobile-logout-text">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;
