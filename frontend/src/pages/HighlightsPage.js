import { useState } from "react";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import '../styles/highlights-page.css';
import { InboxIcon, StarIcon } from "../static/Icons";

const HighlightsPage = () => {
  const [highlights, setHighlights] = useState([{highlight: "This is an example highlight from a book.", book: "Example Book", location: "Page 10", date: "2024-01-01", starred: false}]);
  const [loading, setLoading] = useState(false);
  const [viewFilter, setViewFilter] = useState("all");
  const [bookFilter, setBookFilter] = useState([]);

  if (loading) {
    return <Loading />;
  }

  if (highlights.length === 0) {
    return <EmptyState type="highlights"/>;
  }

  return (
    <div className="highlights-page-container">
      <aside className="highlights-aside">
        <div>
          <div className="sidebar-section-title">Views</div>
          <div className="sidebar-menu">
            <div className={`sidebar-section-item ${viewFilter === "all" ? "active" : ""}`} onClick={() => setViewFilter("all")}>
              <div className="sidebar-item-left">
                <div className="highlights-icon-container" style={{ width: "16px", height: "16px" }}>
                  <InboxIcon />
                </div>
                All Highlights
              </div>
              <span className="sidebar-badge">124</span>
            </div>
            <div className={`sidebar-section-item ${viewFilter === "starred" ? "active" : ""}`} onClick={() => setViewFilter("starred")}>
              <div className="sidebar-item-left">
                <div className="highlights-icon-container" style={{ width: "16px", height: "16px" }}>
                  <StarIcon />
                </div>
                  Starred
              </div>
              <span className="sidebar-badge">24</span>
            </div>
          </div>
        </div>
        <div>
          <div className="sidebar-section-title">Books</div>
          <div className="sidebar-menu">
            {/* Book filter items will go here */}
          </div>
        </div>
      </aside>
    </div>
  )
}

export default HighlightsPage