const API_URL = 'http://localhost:3000';

export const authService = {
  login: async (credentials: any) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  register: async (userData: any) => {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  },

  getCompanies: async () => {
    const response = await fetch(`${API_URL}/users/companies`);
    return response.json();
  },

  getAreas: async (companyId: string) => {
    const response = await fetch(`${API_URL}/users/companies/${companyId}/areas`);
    return response.json();
  },
};
