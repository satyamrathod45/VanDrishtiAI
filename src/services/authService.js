import { api } from "./api";

const OFFICER_KEY =
  "vandrishti_officer";

const SESSION_KEY =
  "vandrishti_session";

export const authService = {
  async login(
    officerId,
    password
  ) {
    return api.post(
      "/api/auth/login",
      {
        officerId,
        password,
      }
    );
  },

  async logout() {
    return api.post(
      "/api/auth/logout"
    );
  },

  getCurrentOfficer() {
    const storedOfficer =
      localStorage.getItem(
        OFFICER_KEY
      );

    if (!storedOfficer) {
      return null;
    }

    try {
      return JSON.parse(
        storedOfficer
      );
    } catch {
      return null;
    }
  },

  saveSession(data) {
    localStorage.setItem(
      OFFICER_KEY,
      JSON.stringify(
        data.officer
      )
    );

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(
        data.session
      )
    );
  },

  clearSession() {
    localStorage.removeItem(
      OFFICER_KEY
    );

    localStorage.removeItem(
      SESSION_KEY
    );
  },

  isAuthenticated() {
    return Boolean(
      localStorage.getItem(
        SESSION_KEY
      )
    );
  },
};