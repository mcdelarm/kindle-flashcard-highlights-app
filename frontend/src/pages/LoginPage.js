
import { useState } from "react";
import { Link, useNavigate, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth-pages.css";


const LoginPage = () => {
  const { login, user, authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.target);
    const email = formData.get("email")?.toString().trim() || "";
    const password = formData.get("password")?.toString() || "";

    if (!email || !password) {
      setError("Please fill in all fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      const data = await login({ email, password });
      console.log("Login successful:", data);
      // Redirect to previous page or homepage
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Error during login:", err);
      setError(err.message || "Failed to log in.");
    } finally {
      setIsSubmitting(false);
    }
  };

    // Redirect if already logged in
  if (!authLoading && user) {
    return <Navigate to={from} replace />;
  }

  return (
    <main className="auth-page">
      <section className="auth-card auth-card-centered">
        <div className="auth-card-header">
          <div className="auth-card-eyebrow">Login</div>
          <h1 className="auth-card-title">Sign in to KindleSync</h1>
          <p className="auth-card-subtitle">
            Access your saved highlights, flashcards, and study progress.
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
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </label>

          {error && <div className="auth-error-message">{error}</div>}

          <button className="auth-submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="auth-footer-copy">
          New here? <Link className="auth-footer-link" to="/signup" state={{ from: {pathname: from}}}>Create an account</Link>
        </p>
      </section>
    </main>
  );
};

export default LoginPage;