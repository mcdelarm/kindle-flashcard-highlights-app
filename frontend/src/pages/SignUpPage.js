import { Link, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/auth-pages.css";

const SignUpPage = () => {
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, authLoading, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.target);
    const email = formData.get("email")?.toString().trim() || "";
    const password = formData.get("password")?.toString() || "";
    const confirmPassword = formData.get("confirmPassword")?.toString() || "";

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      const data = await signup({ email, password });
      console.log("Signup successful:", data);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Error during signup:", err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!authLoading && user) {
    return <Navigate to="/" replace />;
  }

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

          <button className="auth-submit-button" type="submit" disabled={isSubmitting}>
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