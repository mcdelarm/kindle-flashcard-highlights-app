import { NavLink } from "react-router-dom";
import "../styles/globals.css";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user, authLoading, logout } = useAuth();

  return (
    <header>
      <div className="header-left-container">
        <div className="header-title-logo-container">
          <img
            className="header-logo"
            src={`${process.env.PUBLIC_URL}/logo.svg`}
            alt="KindleSync logo"
          />
          <h1 className="header-title">KindleSync</h1>
        </div>
        <nav className="header-nav">
          <NavLink
            className={({ isActive }) =>
              `header-nav-link${isActive ? " selected" : ""}`
            }
            to="/"
            end
          >
            Home
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `header-nav-link${isActive ? " selected" : ""}`
            }
            to="/flashcards"
            end
          >
            Flashcards
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `header-nav-link${isActive ? " selected" : ""}`
            }
            to="/highlights"
            end
          >
            Highlights
          </NavLink>
        </nav>
      </div>
      <div className="header-right-container">
        {!authLoading && !user ? (
          <button className="login-button">
            <NavLink className="login-button-link" to="/login">Login</NavLink>
          </button>
        ) : (
          <button className="login-button" onClick={logout}>
            Logout
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
