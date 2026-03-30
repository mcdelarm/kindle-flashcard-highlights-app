import { Link } from "react-router-dom";
import "../styles/auth-pages.css";

const LoginPage = () => {
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

        <form className="auth-form">
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

          <button className="auth-submit-button" type="submit">
            Sign In
          </button>
        </form>

        <p className="auth-footer-copy">
          New here? <Link className="auth-footer-link" to="/signup">Create an account</Link>
        </p>
      </section>
    </main>
  );
};

export default LoginPage;