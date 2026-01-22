// apiService.js
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080/api/";
const API_KEY = process.env.REACT_APP_API_KEY || "your-api-key-here";

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.apiKey = API_KEY;
    this.refreshPromise = null;
    this.isRefreshing = false;
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

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });

      // Handle expired token (401)
      if (response.status === 401 && !options._retry) {
        console.log("Token expired, attempting refresh...");
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
          throw new Error(`HTTP ${retryResponse.status}`);
        }

        return await retryResponse.json();
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API Request Failed:", error.message);
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
        const response = await fetch(`${this.baseUrl}refreshToken`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": this.apiKey,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Refresh failed: HTTP ${response.status}`);
        }

        const data = await response.json();

        // Update stored access token
        if (data.accessToken) {
          localStorage.setItem("token", data.accessToken);
        }

        // Update user data if returned
        if (data.user) {
          this.setUser(data.user);
        }

        console.log("Token refreshed successfully");
        return data;
      } catch (error) {
        console.error("Refresh token error:", error);
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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loginTimestamp");

    // Optional: Clear cookies by calling logout endpoint
    // this.logout(); // Uncomment if you have a logout endpoint
  }

  // ========== USER & ADMIN MANAGEMENT ==========

  // Store user data after login
  setUser(userData) {
    localStorage.setItem("user", JSON.stringify(userData));
  }

  // Get current user data
  getUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  // Check if user is logged in
  isAuthenticated() {
    return !!localStorage.getItem("token");
  }

  // Check if current user is admin (based on role)
  isAdmin() {
    const user = this.getUser();
    return user && user.role === "admin";
  }

  // Check if user has specific role
  hasRole(role) {
    const user = this.getUser();
    return user && user.role === role;
  }

  // Get current user role
  getUserRole() {
    const user = this.getUser();
    return user ? user.role : null;
  }

  // ========== API METHODS ==========

  // GET Methods
  async getDashboardData() {
    return await this.request("dashboard", { method: "GET" });
  }

  async getWallets() {
    return await this.request("getWallets", { method: "GET" });
  }

  // POST Methods
  async Deposit(depositData) {
    return await this.request("payment", {
      method: "POST",
      body: JSON.stringify(depositData),
    });
  }

  async Withdraw(withdrawData) {
    return await this.request("withdraw", {
      method: "POST",
      body: JSON.stringify(withdrawData),
    });
  }

  async invest(investmentData) {
    return await this.request("invest", {
      method: "POST",
      body: JSON.stringify(investmentData),
    });
  }

  // Admin Methods
  async AdminSignUp(data) {
    return await this.request("AdminSignup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async ConfirmDeposit(data) {
    return await this.request("confirmDeposit", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async declineDeposit(data) {
    return await this.request("cancleDeposit", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getTransactions(params = {}) {
    // Example params: { page: 1, limit: 10, type: 'deposit' }
    const queryString = new URLSearchParams(params).toString();
    const url = params ? `Transactions?${queryString}` : "Transactions";

    return await this.request(url, {
      method: "GET",
    });
  }

  // Login method that stores user data
  async login(LoginData) {
    try {
      const response = await fetch(`${this.baseUrl}AdminLogin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
        },
        credentials: "include",
        body: JSON.stringify(LoginData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Login failed: HTTP ${response.status}`,
        );
      }

      const data = await response.json();

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
      console.error("Login error:", error);
      throw error;
    }
  }

  async logOut() {
    return await this.logOut("logout", {
      method: "post",
    });
  }
}

// Create an instance
const ApiServices = new ApiService();

// Export the instance
export default ApiServices;
