import { Link } from "react-router-dom";
import "../styles/auth-pages.css";

const SignUpPage = () => {
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