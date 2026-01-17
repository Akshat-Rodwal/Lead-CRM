const API_BASE_URL = import.meta.env.DEV
    ? (import.meta.env.VITE_API_BASE_URL ??
      import.meta.env.VITE_API_URL ??
      "http://localhost:5000")
    : import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return headers;
};

export const login = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Login failed");
    }

    return res.json();
};

export const signup = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Signup failed");
    }
    return res.json();
};

export const fetchLeadStats = async () => {
    const res = await fetch(`${API_BASE_URL}/api/leads/stats`, {
        headers: getAuthHeaders(),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to fetch stats");
    }

    return res.json();
};

export const fetchLeads = async (params) => {
    const query = new URLSearchParams();

    if (params.search) query.set("search", params.search);
    if (params.status) query.set("status", params.status);
    if (params.source) query.set("source", params.source);

    query.set("sortBy", params.sortBy || "createdAt");
    query.set("sortOrder", params.sortOrder || "desc");
    query.set("page", String(params.page || 1));
    query.set("limit", String(params.limit || 10));

    const res = await fetch(`${API_BASE_URL}/api/leads?${query.toString()}`, {
        headers: getAuthHeaders(),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to fetch leads");
    }

    return res.json();
};

export const fetchLeadById = async (id) => {
    const res = await fetch(`${API_BASE_URL}/api/leads/${id}`, {
        headers: getAuthHeaders(),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to fetch lead");
    }

    return res.json();
};
