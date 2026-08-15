import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { authService } from "../services/authService";

const AuthContext =
  createContext(null);

export function AuthProvider({
  children,
}) {
  const [officer, setOfficer] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const currentOfficer =
      authService.getCurrentOfficer();

    setOfficer(currentOfficer);

    setLoading(false);
  }, []);

  const login = async (
    officerId,
    password
  ) => {
    const response =
      await authService.login(
        officerId,
        password
      );

    if (response.success) {
      authService.saveSession(
        response.data
      );

      setOfficer(
        response.data.officer
      );
    }

    return response;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      authService.clearSession();
      setOfficer(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        officer,
        loading,
        isAuthenticated:
          Boolean(officer),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}