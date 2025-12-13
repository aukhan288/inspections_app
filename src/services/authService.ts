// src/services/authService.ts

const API_URL = 'https://inspections.compliantretrofits.co.uk/api';

interface LoginResponse {
  username: string;
  token?: string;
}

export const loginService = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Login failed');
  }

  return response.json(); // should return { username, token? }
};
