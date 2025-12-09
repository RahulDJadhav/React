const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://externally-allowed-osprey.ngrok-free.app/api/v1';

class ApiService {
  async fetchDashboardData(dashboardId) {
    const response = await fetch(`${API_BASE_URL}/dashboard/${dashboardId}`);
    return response.json();
  }

  async queryDashboard(dashboardId, query) {
    const response = await fetch(`${API_BASE_URL}/dashboard/${dashboardId}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    return response.json();
  }

  async getChatResponse(message, context) {
    const response = await fetch(`${API_BASE_URL}/chat/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    return response.json();
  }
}

export default new ApiService();