import { API_BASE_URL } from '@/constants/config';

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export const registerRequest = async (email: string, password: string, name?: string): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur lors de l'inscription");
  return data;
};

export const loginRequest = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur lors de la connexion');
  return data;
};

export const fetchMe = async (token: string): Promise<{ user: AuthUser }> => {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Session invalide');
  return data;
};
