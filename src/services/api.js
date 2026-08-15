import { mockApi } from "../mocks/mockApi.js";

const USE_MOCK_API = true;

const realApi = {
  async get(endpoint) {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        "API request failed."
      );
    }

    return response.json();
  },

  async post(endpoint, body) {
    const response = await fetch(endpoint, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(
        "API request failed."
      );
    }

    return response.json();
  },

  async put(endpoint, body) {
    const response = await fetch(endpoint, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(
        "API request failed."
      );
    }

    return response.json();
  },

  async delete(endpoint) {
    const response = await fetch(endpoint, {
      method: "DELETE",

      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        "API request failed."
      );
    }

    return response.json();
  },
};

export const api = USE_MOCK_API
  ? mockApi
  : realApi;