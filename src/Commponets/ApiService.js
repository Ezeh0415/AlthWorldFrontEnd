// apiService.js
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080/api/";
const API_KEY = process.env.REACT_APP_API_KEY || "your-api-key-here";

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.apiKey = API_KEY;
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem("userToken");

    const headers = {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      "x-api-key": this.apiKey,
      ...options.headers,
    };

    const url = `${this.baseUrl}${endpoint}?key=${this.apiKey}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Handle unauthorized - clear local storage and redirect
        this.clearAuth();
        window.location.href = "/login";
        throw new Error("Unauthorized");
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

  clearAuth() {
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");
    localStorage.removeItem("loginTimestamp");
  }

  // Specific API methods
  async getDashboardData() {
    return await this.request("dashboard", { method: "GET" });
  }

  async getWallets() {
    return await this.request("getWallets", { method: "GET" });
  }

  // Add more methods as needed
}

export default new ApiService();
