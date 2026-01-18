import React, { useEffect, useState } from "react";
import {
  CopyOutlined,
  CheckOutlined,
  QrcodeOutlined,
  ArrowLeftOutlined,
  SecurityScanOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import "../styles/Deposit.css";
import { Link } from "react-router-dom";
import ApiService from "../Commponets/ApiService";

const Deposit = () => {
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("input"); // 'input', 'display'
  const [walletAddress, setWalletAddress] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [showQrCode, setShowQrCode] = useState(false);
  const [walletData, setWalletData] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  const formatAmount = (value) => {
    // Remove all non-numeric characters except decimal point
    return value.replace(/[^0-9.]/g, "");
  };

  const validateAmount = () => {
    if (!amount) return "Please enter an amount";
    const numValue = parseFloat(amount);
    if (isNaN(numValue)) return "Please enter a valid amount";
    if (numValue <= 0) return "Amount must be greater than 0";

    if (paymentType) {
      const method = getPaymentMethods().find((m) => m.id === paymentType);
      if (method && numValue < method.minAmount) {
        return `Minimum deposit is $${method.minAmount}`;
      }
    }
    return "";
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsFetching(true);
      setError("");

      const data = await ApiService.getWallets();

      setWalletData(data.data || []);
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message || "Failed to load payment methods");
    } finally {
      setIsFetching(false);
    }
  };

  // Helper function to get payment methods
  const getPaymentMethods = () => {
    if (!walletData || walletData.length === 0) return [];

    return walletData.map((wallet) => {
      // Log wallet structure to debug

      const config = {
        bitcoin: { name: "Bitcoin (BTC)", icon: "₿", color: "#F7931A" },
        ethereum: { name: "Ethereum (ETH)", icon: "Ξ", color: "#627EEA" },
        usdt_erc20: { name: "USDT (ERC20)", icon: "₮", color: "#26A17B" },
        usdt_trc20: { name: "USDT (TRC20)", icon: "₮", color: "#FF6B6B" },
        // Add more as needed
      };

      // Extract crypto name - adjust based on your API response structure
      const cryptoName =
        wallet.cryptoName || wallet.network || wallet.type || "unknown";
      const address =
        wallet.cryptoAddress || wallet.address || wallet.walletAddress || "";
      const minAmount = wallet.minAmount || 10;

      const defaults = config[cryptoName] || {
        name: cryptoName.toUpperCase(),
        icon: "₿",
        color: "#000000",
      };

      return {
        id: cryptoName,
        name: defaults.name,
        color: defaults.color,
        minAmount: minAmount,
        address: address,
      };
    });
  };

  const handleContinue = async () => {
    const validationError = validateAmount();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!paymentType) {
      setError("Please select a payment method");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const depositData = {
        amount: parseFloat(amount),
        paymentType,
      };

      const result = await ApiService.Deposit(depositData);

      console.log("sent", result);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Find selected wallet from paymentMethods
      const selectedWallet = getPaymentMethods().find(
        (method) => method.id === paymentType,
      );

      if (!selectedWallet) {
        throw new Error("Selected payment method not found");
      }

      // Get address from the selected wallet
      const address = selectedWallet.address || "";

      if (!address) {
        throw new Error("Wallet address not available");
      }

      setWalletAddress(address);
      setStage("display");
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBack = () => {
    if (stage === "display") {
      setStage("input");
      setWalletAddress("");
      setAmount("");
      setPaymentType("");
    }
  };

  const generateQRCode = () => {
    const qrData = walletAddress;

    if (!qrData) return null;

    // Generate Google Charts QR code URL
    const googleQRCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(
      qrData,
    )}&choe=UTF-8&chld=H|0`;

    // Alternative: QRServer API (free)
    const qrServerUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      qrData,
    )}&margin=10`;

    return (
      <div className="qr-code-external-container">
        <div className="qr-external-image">
          <img
            src={googleQRCodeUrl}
            alt="Wallet Address QR Code"
            className="qr-external-img"
            onError={(e) => {
              // Fallback to QRServer if Google fails
              e.target.src = qrServerUrl;
            }}
          />
          <div className="qr-external-overlay">
            <div className="qr-overlay-icon">⎙</div>
          </div>
        </div>
        <div className="qr-external-details">
          <h4>Scan to Deposit</h4>
          <div className="qr-external-address">
            <code>{walletAddress}</code>
          </div>
          <div className="qr-external-meta">
            <span className="qr-meta-crypto">
              {getPaymentMethods().find((m) => m.id === paymentType)?.name ||
                paymentType}
            </span>
            <span className="qr-meta-separator">•</span>
            <span className="qr-meta-amount">${amount}</span>
          </div>
        </div>
      </div>
    );
  };

  const formatDisplayAmount = (num) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const paymentMethods = getPaymentMethods();

  return (
    <div className="deposit-container">
      {/* Header */}
      <div className="deposit-header">
        <Link to={"/"} className="back-button" onClick={handleBack}>
          <ArrowLeftOutlined />
          Back
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <SecurityScanOutlined />
          <span>{error}</span>
          <button onClick={() => setError("")} className="error-close">
            ×
          </button>
        </div>
      )}

      {/* Loading State */}
      {isFetching && (
        <div className="loading-container">
          <LoadingOutlined className="loading-spinner" />
          <p>Loading payment methods...</p>
        </div>
      )}

      {/* Input Stage */}
      {!isFetching && stage === "input" && (
        <div className="deposit-card">
          {/* Amount Input */}
          <div className="amount-section">
            <h2 className="section-title">Deposit Amount</h2>
            <div className="amount-input-container">
              <span className="currency-symbol">$</span>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(formatAmount(e.target.value))}
                placeholder="0.00"
                className="amount-input"
              />
            </div>
            <p className="input-helper">Enter the amount you want to deposit</p>
          </div>

          {/* Payment Methods */}
          {paymentMethods.length > 0 ? (
            <div className="payment-methods-section">
              <h2 className="section-title">
                <SecurityScanOutlined className="section-icon" />
                Select Payment Method
              </h2>
              <div className="payment-methods-grid">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`payment-method-card ${
                      paymentType === method.id ? "selected" : ""
                    }`}
                    onClick={() => setPaymentType(method.id)}
                    style={{
                      borderColor:
                        paymentType === method.id ? method.color : "#e0e0e0",
                      backgroundColor:
                        paymentType === method.id
                          ? `${method.color}10`
                          : "white",
                    }}
                  >
                    <div className="payment-method-content">
                      <div className="payment-method-left">
                        <span
                          className="payment-icon"
                          style={{ color: method.color }}
                        >
                          {method.icon}
                        </span>
                        <div>
                          <h3 className="payment-name">{method.name}</h3>
                          <p className="payment-min">
                            Min: ${method.minAmount}
                          </p>
                        </div>
                      </div>
                      {paymentType === method.id && (
                        <CheckOutlined
                          className="check-icon"
                          style={{ color: method.color }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-payment-methods">
              <p>No payment methods available at the moment.</p>
              <button onClick={fetchDashboardData} className="retry-button">
                Retry
              </button>
            </div>
          )}

          {/* Continue Button */}
          <button
            className="continue-button"
            onClick={handleContinue}
            disabled={
              loading || !amount || !paymentType || paymentMethods.length === 0
            }
          >
            {loading ? (
              <>
                <LoadingOutlined className="loading-icon" />
                Processing...
              </>
            ) : (
              "Continue to Payment"
            )}
          </button>

          {/* Info Box */}
          <div className="info-box">
            <SecurityScanOutlined className="info-icon" />
            <div className="info-content">
              <p>• Funds will be credited after 3 network confirmations</p>
              <p>• Minimum deposit amount varies by cryptocurrency</p>
              <p>• Never send funds from an exchange wallet directly</p>
            </div>
          </div>
        </div>
      )}

      {/* Display Stage */}
      {!isFetching && stage === "display" && walletAddress && (
        <div className="deposit-card">
          {/* Back Button */}
          <button className="back-action-button" onClick={handleBack}>
            <ArrowLeftOutlined />
            Make Another Deposit
          </button>

          {/* Deposit Details */}
          <div className="deposit-details">
            <h2 className="deposit-type">
              Deposit{" "}
              {paymentMethods.find((m) => m.id === paymentType)?.name ||
                paymentType}
            </h2>
            <div className="deposit-amount-display">
              ${formatDisplayAmount(parseFloat(amount))}
            </div>
            <span className="status-badge">Pending</span>
          </div>

          <div className="divider" />

          {/* Wallet Address Section */}
          <div className="wallet-section">
            <h2 className="section-title">
              <SecurityScanOutlined className="section-icon" />
              Send{" "}
              {paymentMethods.find((m) => m.id === paymentType)?.name ||
                paymentType}{" "}
              to this address
            </h2>

            {/* QR Code Toggle */}
            <div className="qr-toggle">
              <button
                className="qr-toggle-button"
                onClick={() => setShowQrCode(!showQrCode)}
              >
                <QrcodeOutlined />
                {showQrCode ? "Hide QR Code" : "Show QR Code"}
              </button>
            </div>

            {/* QR Code Display */}
            {showQrCode && (
              <div className="qr-code-container">
                <div className="qr-code-wrapper">{generateQRCode()}</div>
              </div>
            )}

            {/* Wallet Address */}
            <div className="wallet-address-container">
              <div className="wallet-address-text">{walletAddress}</div>
              <button
                className="copy-button"
                onClick={handleCopyAddress}
                title="Copy address"
              >
                {copied ? (
                  <CheckOutlined className="copy-icon" />
                ) : (
                  <CopyOutlined className="copy-icon" />
                )}
              </button>
            </div>
            <p className="copy-hint">Click the copy icon to copy the address</p>
          </div>

          {/* Instructions */}
          <div className="instructions-box">
            <h3 className="instructions-title">Important Instructions:</h3>
            <ul className="instructions-list">
              <li>
                Send <strong>exactly ${amount}</strong> worth of{" "}
                {paymentType.toUpperCase()}
              </li>
              <li>Use only the network specified above</li>
              <li>Do not send from exchange wallets</li>
              <li>Transaction may take 1-2 days to confirm</li>
              <li>Contact support if deposit doesn't appear after 2 days</li>
            </ul>
          </div>
        </div>
      )}

      {/* Copy Notification */}
      {copied && (
        <div className="copy-notification">Address copied to clipboard!</div>
      )}
    </div>
  );
};

export default Deposit;
