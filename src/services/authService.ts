const API_URL = 'https://inspections.compliantretrofits.co.uk/api';

interface LoginResponse {
  username: string;
  token?: string;
}

export const loginService = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const text = await response.text();
  
  if (!response.ok) {
    let message = 'Login failed';

    try {
      const json = JSON.parse(text);
      
      message = json.message ?? message;
    } catch {
      // HTML or non-JSON response
    }

    throw new Error(message);
  }

  return JSON.parse(text);
};


export const getInspections = async (token: string) => {
  const response = await fetch(`${API_URL}/inspections`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Request failed');
  }

  return response.json();
};
