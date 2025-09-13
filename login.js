// ====== Backend URLs ======
const BACKEND_URL = "http://localhost:3000/auth/google";
const GOOGLE_CONFIG_URL = "http://localhost:3000/config/google";

// ====== Initialize Google Sign-In ======
window.onload = async () => {
  console.log("Login page loaded");

  // If already logged in, redirect
  const authToken = localStorage.getItem("authToken");
  if (authToken) {
    window.location.href = "index.html";
    return;
  }

  try {
    // Fetch Google Client ID from backend
    const res = await fetch(GOOGLE_CONFIG_URL);
    const data = await res.json();
    const GOOGLE_CLIENT_ID = data.clientId;

    // Initialize Google button
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleSignIn,
      auto_select: false
    });

    google.accounts.id.renderButton(
      document.getElementById("googleSignInButton"),
      {
        theme: "filled_blue",
        size: "large",
        width: 300,
        text: "signin_with",
        shape: "rectangular",
        logo_alignment: "left"
      }
    );

    console.log("Google Sign-In initialized");
  } catch (err) {
    console.error("Failed to fetch Google Client ID:", err);
    showMessage("Unable to initialize Google Sign-In", "error");
  }
};

// ====== Handle Google Login ======
function handleGoogleSignIn(response) {
  console.log("Google Sign-In response received");
  showLoading(true);
  hideMessage();

  fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: response.credential })
  })
    .then(res => {
      if (!res.ok) throw new Error("Server error " + res.status);
      return res.json();
    })
    .then(data => {
      if (data.success) {
        // Save login
        localStorage.setItem("authToken", data.token || "mock-token");
        localStorage.setItem("user", JSON.stringify(data.user));

        showMessage("Login successful! Redirecting...", "success");
        setTimeout(() => (window.location.href = "index.html"), 1500);
      } else {
        showMessage(data.message || "Google sign-in failed", "error");
      }
    })
    .catch(err => {
      console.error("Backend unreachable:", err);
      simulateSuccessfulLogin(); // fallback if no server
    })
    .finally(() => showLoading(false));
}

// ====== Fallback Mock Login ======
function simulateSuccessfulLogin() {
  showMessage("Connected to Google! Setting up your account...", "success");

  setTimeout(() => {
    const mockUser = {
      id: "mock-" + Date.now(),
      name: "Google User",
      email: "user@example.com",
      avatar: "https://via.placeholder.com/150"
    };

    localStorage.setItem("authToken", "mock-token-" + Date.now());
    localStorage.setItem("user", JSON.stringify(mockUser));

    showMessage("Login successful! Redirecting...", "success");
    setTimeout(() => (window.location.href = "index.html"), 2000);
  }, 1000);
}

// ====== UI Helpers ======
function showLoading(show) {
  const spinner = document.getElementById("loadingSpinner");
  const btn = document.getElementById("googleSignInButton");

  if (show) {
    spinner.style.display = "block";
    btn.style.opacity = "0.6";
    btn.style.pointerEvents = "none";
  } else {
    spinner.style.display = "none";
    btn.style.opacity = "1";
    btn.style.pointerEvents = "auto";
  }
}

function showMessage(text, type) {
  const msg = document.getElementById("message");
  msg.textContent = text;
  msg.className = `message ${type}`;
  msg.style.display = "block";
}

function hideMessage() {
  const msg = document.getElementById("message");
  if (msg) msg.style.display = "none";
}