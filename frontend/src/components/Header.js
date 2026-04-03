import { NavLink, useLocation } from "react-router-dom";
import "../styles/globals.css";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";

const Header = () => {
  const { user, authLoading, logout } = useAuth();
  const location = useLocation();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (logoutOpen && ref.current && !ref.current.contains(e.target)) {
        setLogoutOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [logoutOpen]);

  const handleLogout = () => {
    logout();
    setLogoutOpen(false);
  }

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
            <NavLink className="login-button-link" to="/login" state={{from: location}}>Login</NavLink>
          </button>
        ) : (
          <div className="logout-container" ref={ref}>
            <button className="login-button" onClick={() => setLogoutOpen(!logoutOpen)}>
              Logout
            </button>
            {logoutOpen && (
              <div className="logout-dropdown">
                <div>
                  <div className="logout-dropdown-title">Confirm Logout</div>
                  <div className="logout-dropdown-msg">Are you sure you want to log out of your account?</div>
                </div>
                <div className="logout-dropdown-actions">
                  <button className="logout-cancel-btn" onClick={() => setLogoutOpen(false)}>Cancel</button>
                  <button className="logout-confirm-btn" onClick={handleLogout}>Log out</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
