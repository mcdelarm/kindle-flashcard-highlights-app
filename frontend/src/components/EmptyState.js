import "../styles/globals.css";
import { Link } from "react-router-dom";
import { FlashCardsIcon, HighlightsIcon, UploadCloudIcon} from "../static/Icons";

const EmptyState = ({ type }) => {
  const icon = type === "flashcards" ? <FlashCardsIcon /> : <HighlightsIcon />;
  const description = type === 'flashcards' ? "You haven't generated any vocabulary flashcards yet. Upload your Kindle vocab.db file to get started and automatically generate study material." : "You haven't imported any book highlights yet. Upload your Kindle My Clippings.txt file to sync and organize your favorite quotes.";

  return (
    <main className="empty-state-container">
      <div className="empty-state">
        <div className="empty-state-icon">
          <div className="empty-icon-container">{icon}</div>
        </div>
        <h1 className="empty-state-title">No {type} found</h1>
        <p className="empty-state-desc">{description}</p>
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