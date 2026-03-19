import { useState } from "react";
import Loading from "../components/Loading";
import SingleSelect from "../components/SingleSelect";
import EmptyState from "../components/EmptyState";
import '../styles/highlights-page.css';
import { InboxIcon, StarIcon, BookIcon, SearchIcon, LocationIcon, CalendarIcon, CopyIcon, TrashIcon } from "../static/Icons";
import noCoverImage from "../static/images/no-cover.png";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "books_asc", label: "Book Title (A-Z)" },
  { value: "books_desc", label: "Book Title (Z-A)" }
]

const HighlightsPage = () => {
  const [highlights, setHighlights] = useState([{text: "You can make your SVG dynamic by passing props for fill and stroke instead of hardcoding them. That way, you only need one component.", book: { title: "Example Book" , author: "Example Author", id: 1}, location: "Page 10", date: "2024-01-01", starred: false}]);
  const [filteredHighlights, setFilteredHighlights] = useState(highlights);
  const [loading, setLoading] = useState(false);
  const [viewFilter, setViewFilter] = useState("all");
  const [bookFilter, setBookFilter] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [sortFilter, setSortFilter] = useState("newest");

  const books = [...new Set(highlights.map(h => h.book))];

  const handleBookFilterClick = (bookId) => {
    if (bookFilter.includes(bookId)) {
      setBookFilter(bookFilter.filter(id => id !== bookId));
    } else {
      setBookFilter([...bookFilter, bookId]);
    }
  }

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
                <div className="highlights-icon-container" style={{fontSize: "16px"}}>
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
            {books.map(book => (
              <div key={book.id} className={`sidebar-section-item ${bookFilter.includes(book.id) ? "active" : ""}`} onClick={() => {handleBookFilterClick(book.id)}}>
                <div className="sidebar-item-left">
                  <div className="highlights-icon-container" style={{ fontSize: "16px" }}>
                    <BookIcon />
                  </div>
                  {book.title}
                </div>
                <span className="sidebar-badge">{highlights.filter(h => h.book.id === book.id).length}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
      <main className="highlights-main">
        <div className="highlights-top-control">
          <div className="search-container">
            <div className="highlights-icon-container" style={{ width: "16px", height: "16px" }}>
              <SearchIcon />
            </div>
            <input
              className="search-input"
              placeholder="Search highlights by words, phrases..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>
          <SingleSelect options={sortOptions} value={sortFilter} label="Sort by:" onChange={setSortFilter} />
        </div>
        <div className="highlights-list">
          {filteredHighlights.length === 0 ? (
            <div className="empty-highlights-container"></div>
          ) : (
            filteredHighlights.map(highlight => (
              <div key={highlight.id} className="highlight-card">
                <div className="highlight-content">
                  <div className="highlight-text">&quot;{highlight.text}&quot;</div>
                  <div className="highlight-meta">
                    <div className="highlight-meta-left">
                      <div className="highlight-meta-item">
                        {highlight.book?.cover ? (
                          <img className="highlight-book-cover" src={highlight.book.cover} alt={highlight.book.title} />
                        ) : (
                          <img className="highlight-book-cover" src={noCoverImage} alt='No book cover available'></img>
                        )}
                        <span className="highlight-book-title">{highlight.book?.title || 'No title available'}</span>
                      </div>
                      <div className="highlight-meta-item">
                        <div className="highlights-icon-container" style={{ fontSize: "14px" }}>
                          <LocationIcon />
                        </div>
                        {highlight.location || 'No loc'}
                      </div>
                      <div className="highlight-meta-item">
                        <div className="highlights-icon-container" style={{fontSize: '14px'}}>
                          <CalendarIcon />
                        </div>
                        {highlight.date || 'No date'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="highlight-card-controls">
                  <div className="highlights-icon-container" style={{fontSize: '20px'}}>
                    <StarIcon fill={highlight.starred ? 'rgb(245, 158, 11)' : 'none'} stroke={highlight.starred ? 'rgb(180, 83, 9)' : 'currentColor'} />
                  </div>
                  <div className="copy-delete-container">
                    <button className="copy-delete-btn">
                      <div className="highlights-icon-container" style={{fontSize: '14px'}}>
                        <CopyIcon />
                      </div>
                      Copy
                    </button>
                    <button className="copy-delete-btn">
                      <div className="highlights-icon-container" style={{fontSize: '14px'}}>
                        <TrashIcon />
                      </div>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

export default HighlightsPage