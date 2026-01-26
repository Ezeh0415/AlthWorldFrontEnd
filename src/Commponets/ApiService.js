// apiService.js
const API_BASE_URL = "https://althworldbackend.onrender.com/api/";
const API_KEY =  "373f70230eca4c6de0573179c5abc9091b84dfd8b7894265402f0856a02f49b9";

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.apiKey = API_KEY;
    this.refreshPromise = null;
    this.isRefreshing = false;
  }

  // Clear console logs for better debugging
  logRequest(endpoint, options) {
    console.groupCollapsed(`🔵 API Request: ${endpoint}`);
    console.log("📤 Endpoint:", endpoint);
    console.log("⚙️ Method:", options.method || "GET");
    console.log(
      "📦 Request Body:",
      options.body ? JSON.parse(options.body) : "No body",
    );
    console.log("🔑 Has Token:", !!localStorage.getItem("token"));
    console.groupEnd();
  }

  logResponse(endpoint, response, data) {
    console.groupCollapsed(`🟢 API Response: ${endpoint} (${response.status})`);
    console.log("📥 Status:", response.status, response.statusText);
    console.log("📋 Response Data:", data);
    console.log("📊 Headers:", Object.fromEntries(response.headers.entries()));
    console.groupEnd();
  }

  logError(endpoint, error, response = null) {
    console.groupCollapsed(`🔴 API Error: ${endpoint}`);
    console.log("❌ Error:", error.message);
    console.log("📡 Endpoint:", endpoint);
    console.log("🔄 Response:", response);
    console.log("⏰ Time:", new Date().toISOString());
    console.groupEnd();
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    const headers = {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      "x-api-key": this.apiKey,
      ...options.headers,
    };

    const url = `${this.baseUrl}${endpoint}`;

    // Log the request
    this.logRequest(endpoint, { ...options, headers });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });

      // Handle expired token (401)
      if (response.status === 401 && !options._retry) {
        console.log("🔄 Token expired, attempting refresh...");
        await this.refreshToken();

        // Get updated token after refresh
        const newToken = localStorage.getItem("token");

        // Retry the request with new token
        const retryResponse = await fetch(url, {
          ...options,
          _retry: true,
          credentials: "include",
          headers: {
            ...headers,
            Authorization: newToken ? `Bearer ${newToken}` : "",
          },
        });

        if (!retryResponse.ok) {
          const errorText = await retryResponse.text();
          this.logError(
            endpoint,
            new Error(`HTTP ${retryResponse.status}: ${errorText}`),
            retryResponse,
          );
          throw new Error(`HTTP ${retryResponse.status}: ${errorText}`);
        }

        const retryData = await retryResponse.json();
        this.logResponse(endpoint, retryResponse, retryData);
        return retryData;
      }

      // Get response text first to see what the server returns
      const responseText = await response.text();

      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.warn(`⚠️ Non-JSON response from ${endpoint}:`, responseText);
        data = {
          success: false,
          message: `Server returned non-JSON response: ${responseText.substring(0, 100)}...`,
          raw: responseText,
        };
      }

      // Log the response
      this.logResponse(endpoint, response, data);

      if (!response.ok) {
        // Create detailed error message
        const errorMessage =
          data.message ||
          data.error ||
          `HTTP ${response.status}: ${response.statusText}`;

        const error = new Error(errorMessage);
        error.status = response.status;
        error.response = response;
        error.data = data;

        this.logError(endpoint, error, response);
        throw error;
      }

      return data;
    } catch (error) {
      // Handle network errors
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        const networkError = new Error(
          "Network error: Unable to connect to server",
        );
        networkError.isNetworkError = true;
        this.logError(endpoint, networkError);
        throw networkError;
      }

      this.logError(endpoint, error);
      throw error;
    }
  }

  // Refresh token using refresh token from cookies
  async refreshToken() {
    if (this.isRefreshing) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        console.log("🔄 Attempting token refresh...");
        const response = await fetch(`${this.baseUrl}refreshToken`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": this.apiKey,
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Refresh failed: HTTP ${response.status} - ${errorText}`,
          );
        }

        const data = await response.json();

        // Update stored access token
        if (data.accessToken) {
          localStorage.setItem("token", data.accessToken);
          console.log("✅ Token refreshed successfully");
        } else {
          console.warn("⚠️ No access token in refresh response");
        }

        // Update user data if returned
        if (data.user) {
          this.setUser(data.user);
        }

        return data;
      } catch (error) {
        console.error("🔴 Refresh token error:", error.message);
        this.clearAuth();
        throw error;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // Clear all auth data
  clearAuth() {
    console.log("🧹 Clearing authentication data...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loginTimestamp");
  }

  // ========== USER & ADMIN MANAGEMENT ==========

  // Store user data after login
  setUser(userData) {
    console.log("👤 Setting user data:", {
      role: userData.role,
      email: userData.email,
    });
    localStorage.setItem("user", JSON.stringify(userData));
  }

  // store token
  setToken(token) {
    console.log("🔐 Setting token");
    localStorage.setItem("token", token);
  }

  // Get current user data
  getUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  // Check if user is logged in
  isAuthenticated() {
    const isAuth = !!localStorage.getItem("token");
    console.log(
      "🔍 Authentication check:",
      isAuth ? "✅ Authenticated" : "❌ Not authenticated",
    );
    return isAuth;
  }

  // Check if current user is admin (based on role)
  isAdmin() {
    const user = this.getUser();
    const isAdmin = user && user.role === "admin";
    return isAdmin;
  }

  // Check if user has specific role
  hasRole(role) {
    const user = this.getUser();
    const hasRole = user && user.role === role;
    return hasRole;
  }

  // Get current user role
  getUserRole() {
    const user = this.getUser();
    const role = user ? user.role : null;
    console.log("🎭 Current user role:", role || "No role");
    return role;
  }

  // ========== API METHODS ==========

  // GET Methods
  async getDashboardData() {
    console.log("📊 Fetching dashboard data...");
    return await this.request("dashboard", { method: "GET" });
  }

  async getWallets() {
    console.log("💰 Fetching wallets...");
    return await this.request("getWallets", { method: "GET" });
  }

  async dashboardAdminUsers() {
    console.log("👥 Fetching admin dashboard users...");
    return await this.request("dashboardAdminUsers", { method: "POST" });
  }

  // POST Methods
  async Deposit(depositData) {
    console.log("💵 Processing deposit...");
    return await this.request("payment", {
      method: "POST",
      body: JSON.stringify(depositData),
    });
  }

  async Withdraw(withdrawData) {
    console.log("💸 Processing withdrawal...");
    return await this.request("withdraw", {
      method: "POST",
      body: JSON.stringify(withdrawData),
    });
  }

  async invest(investmentData) {
    console.log("📈 Processing investment...");

    // Create investment payload with all required fields
    const payload = {
      amount: investmentData.amount,
      roi: investmentData.roi,
      investmentType: investmentData.investmentType,
      investmentStartDate: investmentData.investmentStartDate,
      investmentEndDate: investmentData.investmentEndDate,
    };

    return await this.request("invest", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // Admin Methods
  async AdminSignUp(data) {
    console.log("👨‍💼 Admin signup...");
    return await this.request("AdminSignup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async ConfirmDeposit(data) {
    console.log("✅ Confirming deposit...", {
      userId: data.userId,
      amount: data.creditedAmount,
      transactionId: data.transactionId,
    });

    return await this.request("confirmDeposit", {
      method: "POST",
      body: JSON.stringify({
        userId: data.userId,
        creditedAmount: data.creditedAmount,
        transactionId: data.transactionId,
      }),
    });
  }

  async confirmWithdraw(data) {
    console.log("✅ Confirming withdrawal...", {
      userId: data.userId,
      amount: data.creditedAmount,
      transactionId: data.transactionId,
    });

    return await this.request("confirmWithdraw", {
      method: "POST",
      body: JSON.stringify({
        userId: data.userId,
        creditedAmount: data.creditedAmount,
        transactionId: data.transactionId,
      }),
    });
  }

  async declineDeposit(data) {
    console.log("❌ Declining deposit...", {
      userId: data.userId,
      transactionId: data.transactionId,
    });

    return await this.request("cancleDeposit", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getTransactions(params = {}) {
    console.log("📋 Fetching transactions with params:", params);
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `Transactions?${queryString}` : "Transactions";

    return await this.request(url, {
      method: "GET",
    });
  }

  async addWallet(newWallet) {
    console.log("💸 Processing withdrawal...");
    return await this.request("addWallet", {
      method: "POST",
      body: JSON.stringify(newWallet),
    });
  }
  async updateWallet(updateData) {
    console.log("💸 Processing withdrawal...");
    return await this.request("updateWallet", {
      method: "POST",
      body: JSON.stringify({
        userId: updateData.userId,
        CryptoAddress: updateData.cryptoAddress,
      }),
    });
  }
  async deleteWallet(deleteData) {
    console.log("💸 Processing withdrawal...");
    return await this.request("deleteWallet", {
      method: "POST",
      body: JSON.stringify(deleteData),
    });
  }

  // Login method that stores user data
  async login(loginData) {
    try {
      console.group("🔐 Login Attempt");
      console.log("🔑 Attempting login...");

      const response = await fetch(`${this.baseUrl}AdminLogin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
        },
        credentials: "include",
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || `HTTP ${response.status}` };
        }

        const errorMessage =
          errorData.message || `Login failed: HTTP ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("✅ Login successful:", {
        hasToken: !!data.accessToken,
        userRole: data.user?.role,
      });

      // Store token
      if (data.accessToken) {
        localStorage.setItem("token", data.accessToken);
      }

      // Store user data with role
      if (data.user) {
        this.setUser(data.user);
      }

      localStorage.setItem("loginTimestamp", Date.now());

      return data;
    } catch (error) {
      throw error;
    }
  }

  async logOut() {
    console.log("👋 Logging out...");
    return await this.request("logout", {
      method: "POST",
    });
  }

  // Helper method to debug API errors
  static debugApiError(error, context = "API Call") {
    console.groupCollapsed(`🔴 ${context} Debug`);
    console.log("❌ Error Type:", error.constructor.name);
    console.log("📝 Error Message:", error.message);
    console.log("🔢 Error Code:", error.status || error.code);

    if (error.response) {
      console.log("📡 Response Status:", error.response.status);
      console.log("📡 Response Headers:", error.response.headers);
    }

    if (error.data) {
      console.log("📦 Error Data:", error.data);
    }

    console.log("🔗 Stack Trace:", error.stack);
    console.groupEnd();

    // Return user-friendly error message
    if (error.message.includes("Network")) {
      return "Network error: Unable to connect to the server. Please check your internet connection.";
    } else if (error.status === 401) {
      return "Session expired. Please login again.";
    } else if (error.status === 500) {
      return "Server error. Please try again later or contact support.";
    } else {
      return error.message || "An unexpected error occurred.";
    }
  }
}

// Create an instance
const ApiServices = new ApiService();

// Export the instance
export default ApiServices;
