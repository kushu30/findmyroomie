const API_BASE =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? `http://${location.hostname}:4001`
    : ""; // Same-origin in production (Railway/Render serves both static + API)

function getToken() {
  return localStorage.getItem("auth_token");
}

function setToken(token) {
  localStorage.setItem("auth_token", token);
}

function removeToken() {
  localStorage.removeItem("auth_token");
}

function logout() {
  removeToken();
  window.location.href = "login.html";
}

async function fetchWithAuth(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  // Auto-logout on auth errors
  if (response.status === 401 || response.status === 403) {
    const data = await response.json().catch(() => ({}));
    removeToken();
    window.location.href = "login.html";
    throw new Error(data.message || "Authentication failed");
  }

  return response;
}

// Guard: redirect to login if no token is found
function checkAuth() {
  if (!getToken()) {
    window.location.href = "login.html";
  }
}
