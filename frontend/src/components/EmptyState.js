import "../styles/globals.css";
import { Link } from "react-router-dom";
import { UploadCloudIcon} from "../static/Icons";

const EmptyState = ({ title, message, icon }) => {
  return (
    <main className="empty-state-container">
      <div className="empty-state">
        <div className="empty-state-icon">
          <div className="empty-icon-container">{icon}</div>
        </div>
        <h1 className="empty-state-title">{title}</h1>
        <p className="empty-state-desc">{message}</p>
        <Link className="empty-state-link" to={'/'}>
          <div className="upload-icon-container">
            <UploadCloudIcon />
          </div>
          Go to Upload Page
        </Link>
      </div>
    </main>
  );
};

export default EmptyState;