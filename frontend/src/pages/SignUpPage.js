import { Link } from "react-router-dom";
import { useState } from "react";
import "../styles/auth-pages.css";

const SignUpPage = () => {
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.target);
    const email = formData.get("email")?.toString().trim() || "";
    const password = formData.get("password")?.toString().trim() || "";
    const confirmPassword = formData.get("confirmPassword")?.toString().trim() || "";

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Failed to create account.");
      }

      console.log("Signup successful:", data);
    } catch (err) {
      console.error("Error during signup:", err);
      setError("An error occurred. Please try again.");
  }
  };

  return (
    <main className="auth-page">
      <section className="auth-card auth-card-centered">
        <div className="auth-card-header">
          <div className="auth-card-eyebrow">Create account</div>
          <h1 className="auth-card-title">Start saving your Kindle study flow</h1>
          <p className="auth-card-subtitle">
            Create an account to keep your highlights, vocabulary cards, and
            progress organized in one place.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span className="auth-label">Email</span>
            <input
              className="auth-input"
              type="email"
              name="email"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label className="auth-field">
            <span className="auth-label">Password</span>
            <input
              className="auth-input"
              type="password"
              name="password"
              placeholder="Create a password"
              autoComplete="new-password"
            />
          </label>

          <label className="auth-field">
            <span className="auth-label">Confirm password</span>
            <input
              className="auth-input"
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              autoComplete="new-password"
            />
          </label>

          {error && <p className="auth-error-message">{error}</p>}

          <button className="auth-submit-button" type="submit">
            Create Account
          </button>
        </form>

        <p className="auth-footer-copy">
          Already have an account? <Link className="auth-footer-link" to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
};

export default SignUpPage;