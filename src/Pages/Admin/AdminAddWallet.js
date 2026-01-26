import React, { useState, useEffect } from "react";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  WalletOutlined,
  SearchOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
  SaveOutlined,
  CloseOutlined,
  CopyOutlined,
  SafetyOutlined,
  QrcodeOutlined,
  DollarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "../../styles/Admin/AdminAddWallet.css";
import ApiServices from "../../Commponets/ApiService";

const AdminAddWallet = () => {
  // State Management
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [showSecretAddresses, setShowSecretAddresses] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    cryptoName: "",
    cryptoAddress: "",
  });

  // Popular cryptocurrencies for suggestions
  const cryptoOptions = [
    { value: "BTC", label: "Bitcoin (BTC)", icon: "₿" },
    { value: "ETH", label: "Ethereum (ETH)", icon: "Ξ" },
    { value: "USDT", label: "Tether (USDT)", icon: "₮" },
    { value: "BNB", label: "BNB (BNB)", icon: "ⓑ" },
    { value: "SOL", label: "Solana (SOL)", icon: "◎" },
    { value: "XRP", label: "Ripple (XRP)", icon: "✕" },
    { value: "ADA", label: "Cardano (ADA)", icon: "A" },
    { value: "DOGE", label: "Dogecoin (DOGE)", icon: "Ð" },
    { value: "DOT", label: "Polkadot (DOT)", icon: "●" },
    { value: "SHIB", label: "Shiba Inu (SHIB)", icon: "🐕" },
    { value: "TRX", label: "Tron (TRX)", icon: "⟠" },
    { value: "LTC", label: "Litecoin (LTC)", icon: "Ł" },
  ];

  // Check mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load wallets
  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Replace with your actual API call
      const response = await ApiServices.getWallets();
      if (response && response.data) {
        setWallets(response.data);
      }
    } catch (err) {
      console.error("Error fetching wallets:", err);
      setError("Failed to load wallets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCryptoSelect = (cryptoValue) => {
    const selectedCrypto = cryptoOptions.find((c) => c.value === cryptoValue);
    setFormData((prev) => ({
      ...prev,
      cryptoName: selectedCrypto ? selectedCrypto.label : cryptoValue,
    }));
  };

  const handleCopyAddress = (address) => {
    navigator.clipboard
      .writeText(address)
      .then(() => {
        setSuccess("Address copied to clipboard!");
        setTimeout(() => setSuccess(null), 3000);
      })
      .catch((err) => {
        setError("Failed to copy address");
        console.error("Copy error:", err);
      });
  };

  const handleToggleAddress = (walletId) => {
    setShowSecretAddresses((prev) => ({
      ...prev,
      [walletId]: !prev[walletId],
    }));
  };

  const validateForm = () => {
    if (!formData.cryptoName.trim()) {
      setError("Please enter a crypto name");
      return false;
    }
    if (!formData.cryptoAddress.trim()) {
      setError("Please enter a wallet address");
      return false;
    }
    // Basic address validation (can be enhanced for specific cryptos)
    if (formData.cryptoAddress.length < 26) {
      setError("Please enter a valid wallet address");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setActionLoading(true);
      setError(null);

      if (editingWallet) {
        // Update wallet
        const updateData = {
          userId: editingWallet._id, // Assuming wallet object has userId
          cryptoAddress: formData.cryptoAddress,
          cryptoName: formData.cryptoName,
        };

        const response = await ApiServices.updateWallet(updateData);

        console.log(response);

        if (response && response.success) {
          setSuccess("Wallet updated successfully!");
          setTimeout(() => setSuccess(null), 1500);
          // Refresh wallets list
          fetchWallets();
          handleCloseModal();
        } else {
          throw new Error(response?.message || "Failed to update wallet");
        }
      } else {
        // Add new wallet
        const newWallet = {
          CryptoName: formData.cryptoName,
          CryptoAddress: formData.cryptoAddress,
        };
        const response = await ApiServices.addWallet(newWallet);

        if (response && response.success) {
          setSuccess("Wallet added successfully!");
          // Refresh wallets list
          fetchWallets();
          handleCloseModal();
        } else {
          throw new Error(response?.message || "Failed to add wallet");
        }
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message || "Operation failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteWallet = async () => {
    if (!editingWallet) return;

    try {
      setActionLoading(true);
      setError(null);

      // Replace with your actual delete API call
      const deleteData = {
        userId: editingWallet._id,
      };

      const response = await ApiServices.deleteWallet(deleteData);

      if (response && response.success) {
        setSuccess("Wallet deleted successfully!");
        // Refresh wallets list
        fetchWallets();
        setShowDeleteModal(false);
        setEditingWallet(null);
      } else {
        throw new Error(response?.message || "Failed to delete wallet");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message || "Failed to delete wallet");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditWallet = (wallet) => {
    setEditingWallet(wallet);
    setFormData({
      cryptoName: wallet.cryptoName || "",
      cryptoAddress: wallet.cryptoAddress || "",
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingWallet(null);
    setFormData({
      cryptoName: "",
      cryptoAddress: "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingWallet(null);
    setFormData({
      cryptoName: "",
      cryptoAddress: "",
    });
    setError(null);
  };

  const handleOpenDeleteModal = (wallet) => {
    setEditingWallet(wallet);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setEditingWallet(null);
  };

  const filteredWallets = wallets.filter((wallet) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      wallet.cryptoName?.toLowerCase().includes(query) ||
      wallet.cryptoAddress?.toLowerCase().includes(query) ||
      wallet.userId?.toLowerCase().includes(query)
    );
  });

  const getCryptoIcon = (cryptoName) => {
    const crypto = cryptoOptions.find((c) =>
      cryptoName
        .toLowerCase()
        .includes(c.label.toLowerCase() || c.value.toLowerCase()),
    );
    return crypto?.icon || "₿";
  };

  // Wallet Card Component
  const WalletCard = ({ wallet }) => {
    const isShowing = showSecretAddresses[wallet.id || wallet._id];
    const cryptoIcon = getCryptoIcon(wallet.cryptoName);

    return (
      <div className="wallet-management-card">
        <div className="wallet-management-header">
          <div className="wallet-management-icon">
            <span className="wallet-crypto-icon">{cryptoIcon}</span>
          </div>
          <div className="wallet-management-title">
            <h4>{wallet.cryptoName}</h4>
            <div className="wallet-management-meta">
              <span className="wallet-management-user">
                <UserOutlined />
                User: {wallet.userId?.slice(0, 8)}...
              </span>
              <span className="wallet-management-status wallet-status-active">
                <CheckCircleOutlined />
                Active
              </span>
            </div>
          </div>
          <div className="wallet-management-actions">
            <button
              className="wallet-action-btn wallet-view-btn"
              onClick={() => handleToggleAddress(wallet.id || wallet._id)}
              title={isShowing ? "Hide Address" : "Show Address"}
            >
              {isShowing ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </button>
            <button
              className="wallet-action-btn wallet-edit-btn"
              onClick={() => handleEditWallet(wallet)}
              title="Edit Wallet"
            >
              <EditOutlined />
            </button>
            <button
              className="wallet-action-btn wallet-delete-btn"
              onClick={() => handleOpenDeleteModal(wallet)}
              title="Delete Wallet"
            >
              <DeleteOutlined />
            </button>
          </div>
        </div>

        <div className="wallet-management-body">
          <div className="wallet-address-container">
            <div className="wallet-address-header">
              <span className="wallet-address-label">Wallet Address</span>
              <button
                className="wallet-copy-btn"
                onClick={() => handleCopyAddress(wallet.cryptoAddress)}
                title="Copy Address"
              >
                <CopyOutlined />
                Copy
              </button>
            </div>

            {isShowing ? (
              <div className="wallet-address-visible">
                <div className="wallet-address-value">
                  {wallet.cryptoAddress}
                </div>
                <div className="wallet-address-hint">Full address shown</div>
              </div>
            ) : (
              <div className="wallet-address-hidden">
                <div className="wallet-masked-address">
                  {wallet.cryptoAddress.slice(0, 8)}...
                  {wallet.cryptoAddress.slice(-8)}
                </div>
                <div className="wallet-address-hint">
                  Click eye icon to reveal
                </div>
              </div>
            )}
          </div>

          <div className="wallet-info-container">
            <div className="wallet-info-item">
              <span className="wallet-info-label">Created</span>
              <span className="wallet-info-value">
                {new Date(wallet.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
            <div className="wallet-info-item">
              <span className="wallet-info-label">Type</span>
              <span className="wallet-info-value">{wallet.cryptoName}</span>
            </div>
          </div>
        </div>

        <div className="wallet-management-footer">
          <div className="wallet-usage-info">
            <span className="wallet-usage-label">Last Used</span>
            <span className="wallet-usage-value">Recently</span>
          </div>
          <button
            className="wallet-qr-btn"
            title="Show QR Code"
            onClick={() => {
              // Implement QR code display
              setSuccess("QR Code feature coming soon!");
            }}
          >
            <QrcodeOutlined />
            QR
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="wallet-management-container">
      {/* Header */}
      <div className="wallet-management-page-header">
        <div className="wallet-header-content">
          <h1>
            <WalletOutlined />
            Wallet Management
          </h1>
          <p>Manage cryptocurrency wallets for deposits and withdrawals</p>
        </div>

        <button
          className="wallet-add-btn"
          onClick={handleAddNew}
          disabled={actionLoading}
        >
          <PlusOutlined />
          {isMobile ? "Add" : "Add New Wallet"}
        </button>
      </div>

      {/* Stats Overview */}
      <div className="wallet-stats-overview">
        <div className="wallet-stat-card">
          <div className="wallet-stat-icon wallet-stat-total">
            <WalletOutlined />
          </div>
          <div className="wallet-stat-content">
            <h3>{wallets.length}</h3>
            <p>Total Wallets</p>
          </div>
        </div>

        <div className="wallet-stat-card">
          <div className="wallet-stat-icon wallet-stat-active">
            <CheckCircleOutlined />
          </div>
          <div className="wallet-stat-content">
            <h3>{wallets.length}</h3>
            <p>Active</p>
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="wallet-search-section">
        <div className="wallet-search-box">
          <SearchOutlined />
          <input
            type="text"
            placeholder="Search wallets by name, address, or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="wallet-clear-search"
              onClick={() => setSearchQuery("")}
            >
              ×
            </button>
          )}
        </div>

        {/* <div className="wallet-filter-options">
          <button className="wallet-filter-btn wallet-filter-active">
            <FilterOutlined />
            All Wallets
          </button>
          <button className="wallet-filter-btn">Bitcoin</button>
          <button className="wallet-filter-btn">Ethereum</button>
        </div> */}
      </div>

      {/* Messages */}
      {error && (
        <div className="wallet-message wallet-error-message">
          <ExclamationCircleOutlined />
          <span>{error}</span>
          <button
            className="wallet-close-message"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="wallet-message wallet-success-message">
          <CheckCircleOutlined />
          <span>{success}</span>
          <button
            className="wallet-close-message"
            onClick={() => setSuccess(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="wallet-loading-container">
          <LoadingOutlined spin />
          <p>Loading wallets...</p>
        </div>
      ) : filteredWallets.length === 0 ? (
        <div className="wallet-empty-state">
          <WalletOutlined />
          <h3>No Wallets Found</h3>
          <p>
            {searchQuery
              ? "No wallets match your search criteria"
              : "No wallets have been added yet"}
          </p>
          <button className="wallet-add-first-btn" onClick={handleAddNew}>
            <PlusOutlined />
            Add Your First Wallet
          </button>
        </div>
      ) : (
        <div className="wallet-grid-container">
          {filteredWallets.map((wallet) => (
            <WalletCard key={wallet.id || wallet._id} wallet={wallet} />
          ))}
        </div>
      )}

      {/* Add/Edit Wallet Modal */}
      {showModal && (
        <div className="wallet-modal-overlay">
          <div className="wallet-modal-content">
            <div className="wallet-modal-header">
              <h3>
                <WalletOutlined />
                {editingWallet ? "Edit Wallet" : "Add New Wallet"}
              </h3>
              <button
                className="wallet-close-modal"
                onClick={handleCloseModal}
                disabled={actionLoading}
              >
                <CloseOutlined />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="wallet-form-container">
              <div className="wallet-form-section">
                <h4>Crypto Information</h4>

                <div className="wallet-form-group">
                  <label htmlFor="cryptoName">
                    <DollarOutlined />
                    Crypto Name *
                  </label>
                  <div className="wallet-crypto-grid">
                    {cryptoOptions.map((crypto) => (
                      <button
                        key={crypto.value}
                        type="button"
                        className={`wallet-crypto-option ${formData.cryptoName.includes(crypto.value) ? "wallet-crypto-selected" : ""}`}
                        onClick={() => handleCryptoSelect(crypto.value)}
                      >
                        <span className="wallet-crypto-symbol">
                          {crypto.icon}
                        </span>
                        <span className="wallet-crypto-name">
                          {crypto.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    id="cryptoName"
                    name="cryptoName"
                    placeholder="Or enter custom crypto name"
                    value={formData.cryptoName}
                    onChange={handleInputChange}
                    required
                    className="wallet-form-input"
                  />
                </div>

                <div className="wallet-form-group">
                  <label htmlFor="cryptoAddress">
                    <SafetyOutlined />
                    Wallet Address *
                  </label>
                  <textarea
                    id="cryptoAddress"
                    name="cryptoAddress"
                    placeholder="Enter the full wallet address"
                    value={formData.cryptoAddress}
                    onChange={handleInputChange}
                    rows="3"
                    required
                    className="wallet-address-input"
                  />
                  <div className="wallet-input-hint">
                    Make sure to double-check the address before saving
                  </div>
                </div>

                <div className="wallet-form-tips">
                  <InfoCircleOutlined />
                  <div>
                    <strong>Important:</strong>
                    <ul>
                      <li>Only add wallets you control</li>
                      <li>Verify address accuracy</li>
                      <li>Keep private keys secure</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="wallet-modal-actions">
                <button
                  type="button"
                  className="wallet-btn-secondary"
                  onClick={handleCloseModal}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="wallet-btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <LoadingOutlined spin />
                      Processing...
                    </>
                  ) : (
                    <>
                      <SaveOutlined />
                      {editingWallet ? "Update Wallet" : "Add Wallet"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && editingWallet && (
        <div className="wallet-modal-overlay">
          <div className="wallet-modal-content wallet-delete-modal">
            <div className="wallet-modal-header">
              <h3>
                <ExclamationCircleOutlined />
                Delete Wallet
              </h3>
              <button
                className="wallet-close-modal"
                onClick={handleCloseDeleteModal}
                disabled={actionLoading}
              >
                <CloseOutlined />
              </button>
            </div>

            <div className="wallet-delete-content">
              <div className="wallet-warning-icon">
                <ExclamationCircleOutlined />
              </div>

              <h4>Are you sure you want to delete this wallet?</h4>

              <div className="wallet-delete-details">
                <div className="wallet-delete-item">
                  <span className="wallet-delete-label">Crypto Name:</span>
                  <span className="wallet-delete-value">
                    {editingWallet.cryptoName}
                  </span>
                </div>
                <div className="wallet-delete-item">
                  <span className="wallet-delete-label">User ID:</span>
                  <span className="wallet-delete-value">
                    {editingWallet.userId}
                  </span>
                </div>
                <div className="wallet-delete-item">
                  <span className="wallet-delete-label">Address:</span>
                  <span className="wallet-delete-value wallet-truncate-text">
                    {editingWallet.cryptoAddress.slice(0, 20)}...
                  </span>
                </div>
              </div>

              <div className="wallet-delete-warning">
                <strong>Warning:</strong> This action cannot be undone.
              </div>

              <div className="wallet-modal-actions">
                <button
                  type="button"
                  className="wallet-btn-secondary"
                  onClick={handleCloseDeleteModal}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="wallet-btn-danger"
                  onClick={handleDeleteWallet}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <LoadingOutlined spin />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <DeleteOutlined />
                      Delete Wallet
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAddWallet;
