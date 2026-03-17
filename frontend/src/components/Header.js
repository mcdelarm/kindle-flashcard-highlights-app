import { NavLink } from "react-router-dom";
import '../styles/globals.css';

const Header = () => {
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
          <NavLink
            className={({ isActive }) =>
              `header-nav-link${isActive ? " selected" : ""}`
            }
            to="/"
            end
          >
            How it works
          </NavLink>
        </nav>
      </div>
      <div className="header-right-container">
        <button className="login-button">Login</button>
      </div>
    </header>
  );
};

export default Header;
