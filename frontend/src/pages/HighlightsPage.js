import { useState, useEffect, useRef } from "react";
import Loading from "../components/Loading";
import SingleSelect from "../components/SingleSelect";
import EmptyState from "../components/EmptyState";
import "../styles/highlights-page.css";
import {
  InboxIcon,
  StarIcon,
  BookIcon,
  SearchIcon,
  LocationIcon,
  CalendarIcon,
  CopyIcon,
  TrashIcon,
  HighlightsIcon,
} from "../static/Icons";
import { useAuth } from "../context/AuthContext";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "books_asc", label: "Book Title (A-Z)" },
  { value: "books_desc", label: "Book Title (Z-A)" },
];

const HighlightsPage = () => {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewFilter, setViewFilter] = useState("all");
  const [bookFilter, setBookFilter] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [sortFilter, setSortFilter] = useState("newest");
  const { user } = useAuth();
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const dropdownRefs = useRef({});

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (deleteConfirmationOpen) {
        const ref = dropdownRefs.current[deleteConfirmationOpen];
        if (ref && !ref.contains(e.target)) {
          setDeleteConfirmationOpen(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [deleteConfirmationOpen]);

  const books = Object.values(
    highlights.reduce((acc, h) => {
      acc[h.book.id] = h.book;
      return acc;
    }, {}),
  );

  const filteredHighlights = highlights
    .filter((highlight) => {
      if (viewFilter === "starred" && !highlight.starred) {
        return false;
      }
      if (bookFilter.length > 0 && !bookFilter.includes(highlight.book.id)) {
        return false;
      }
      if (searchFilter.trim()) {
        const searchLower = searchFilter.trim().toLowerCase();
        const textMatch = highlight.text.toLowerCase().includes(searchLower);

        return textMatch;
      }
      return true;
    })
    .sort((first, second) => {
      if (sortFilter === "newest") {
        return new Date(second.date) - new Date(first.date);
      } else if (sortFilter === "oldest") {
        return new Date(first.date) - new Date(second.date);
      } else if (sortFilter === "books_asc") {
        return first.book.title.localeCompare(second.book.title);
      } else if (sortFilter === "books_desc") {
        return second.book.title.localeCompare(first.book.title);
      }
    });

  const handleBookFilterClick = (bookId) => {
    if (bookFilter.includes(bookId)) {
      setBookFilter(bookFilter.filter((id) => id !== bookId));
    } else {
      setBookFilter([...bookFilter, bookId]);
    }
  };

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const response = await fetch("http://localhost:8000/highlights", {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch highlights");
        }
        const data = await response.json();
        setHighlights(data.highlights);
      } catch (error) {
        setHighlights([]);
        console.error("Error fetching highlights:", error);
      }
    };
    fetchHighlights();
  }, [user]);

  const formatDate = (value) => {
    if (!value) return "No date";

    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateAllHighlightCount = () => {
    if (bookFilter.length === 0) {
      return highlights.length;
    }

    return highlights.filter((highlight) =>
      bookFilter.includes(highlight.book?.id),
    ).length;
  };

  const calculateBookHighlightCount = (bookId, currentView) => {
    return highlights.filter((highlight) => {
      if (highlight.book?.id !== bookId) {
        return false;
      }

      if (currentView === "starred" && !highlight.starred) {
        return false;
      }

      return true;
    }).length;
  };

  const handleCopy = async (text, highlightId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(highlightId);
      setTimeout(() => setCopiedId(null), 1500); // Reset copiedId after 1.5 seconds
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const handleStarClick = async (highlightId) => {
    const target = highlights.find((h) => h.id === highlightId);
    if (!target) return;

    const previousStarred = target.starred;
    const nextStarred = !previousStarred;

    setHighlights((currentHighlights) =>
      currentHighlights.map((highlight) =>
        highlight.id === highlightId
          ? { ...highlight, starred: nextStarred }
          : highlight,
      ),
    );

    try {
      const response = await fetch(
        `http://localhost:8000/highlights/${highlightId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ starred: nextStarred }),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to update highlight");
      }
    } catch (error) {
      setHighlights((currentHighlights) =>
        currentHighlights.map((highlight) =>
          highlight.id === highlightId
            ? { ...highlight, starred: previousStarred }
            : highlight,
        ),
      );
      console.error("Error updating highlight:", error);
    }
  };

  const handleDelete = async (highlightId) => {
    const target = highlights.find((h) => h.id === highlightId);
    if (!target) return;

    setHighlights((currentHighlights) =>
      currentHighlights.filter((highlight) => highlight.id !== highlightId),
    );

    try {
      const response = await fetch(
        `http://localhost:8000/highlights/${highlightId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (!response.ok) {
        throw new Error("Failed to delete highlight");
      }
    } catch (error) {
      setHighlights((currentHighlights) => [...currentHighlights, target]);
      console.error("Error deleting highlight:", error);
    } finally {
      setDeleteConfirmationOpen(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (highlights.length === 0) {
    return (
      <EmptyState
        title="No Highlights Found"
        message="You haven't imported any book highlights yet. Upload your Kindle My Clippings.txt file to sync and organize your favorite quotes"
        icon={<HighlightsIcon />}
      />
    );
  }

  return (
    <div className="highlights-page-container">
      <aside className="highlights-aside">
        <div>
          <div className="sidebar-section-title">Views</div>
          <div className="sidebar-menu">
            <div
              className={`sidebar-section-item ${viewFilter === "all" ? "active" : ""}`}
              onClick={() => setViewFilter("all")}
            >
              <div className="sidebar-item-left">
                <div
                  className="highlights-icon-container"
                  style={{ width: "16px", height: "16px" }}
                >
                  <InboxIcon />
                </div>
                All Highlights
              </div>
              <span className="sidebar-badge">
                {calculateAllHighlightCount()}
              </span>
            </div>
            <div
              className={`sidebar-section-item ${viewFilter === "starred" ? "active" : ""}`}
              onClick={() => setViewFilter("starred")}
            >
              <div className="sidebar-item-left">
                <div
                  className="highlights-icon-container"
                  style={{ fontSize: "16px" }}
                >
                  <StarIcon />
                </div>
                Starred
              </div>
              <span className="sidebar-badge">
                {filteredHighlights.filter((h) => h.starred).length}
              </span>
            </div>
          </div>
        </div>
        <div>
          <div className="sidebar-section-title">Books</div>
          <div className="sidebar-menu">
            {books.map((book) => (
              <div
                key={book.id}
                className={`sidebar-section-item ${bookFilter.includes(book.id) ? "active" : ""}`}
                onClick={() => {
                  handleBookFilterClick(book.id);
                }}
              >
                <div className="sidebar-item-left">
                  <div
                    className="highlights-icon-container"
                    style={{ fontSize: "16px" }}
                  >
                    <BookIcon />
                  </div>
                  {book.title}
                </div>
                <span className="sidebar-badge">
                  {calculateBookHighlightCount(book.id, viewFilter)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>
      <main className="highlights-main">
        <div className="highlights-top-control">
          <div className="search-container">
            <div
              className="highlights-icon-container"
              style={{ width: "16px", height: "16px" }}
            >
              <SearchIcon />
            </div>
            <input
              className="search-input"
              placeholder="Search highlights by words, phrases..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>
          <SingleSelect
            options={sortOptions}
            value={sortFilter}
            label="Sort by:"
            onChange={setSortFilter}
          />
        </div>
        <div className="highlights-list">
          {filteredHighlights.length === 0 ? (
            <div className="empty-highlights-container"></div>
          ) : (
            filteredHighlights.map((highlight) => (
              <div key={highlight.id} className="highlight-card">
                <div className="highlight-content">
                  <div className="highlight-text">
                    &quot;{highlight.text}&quot;
                  </div>
                  <div className="highlight-meta">
                    <div className="highlight-meta-left">
                      <div className="highlight-meta-item">
                        <div
                          className="highlights-icon-container"
                          style={{ fontSize: "14px" }}
                        >
                          <BookIcon />
                        </div>
                        {highlight.book.title}
                      </div>
                      <div className="highlight-meta-item">
                        <div
                          className="highlights-icon-container"
                          style={{ fontSize: "14px" }}
                        >
                          <LocationIcon />
                        </div>
                        {highlight.location
                          ? `loc ${highlight.location}`
                          : "No loc"}
                      </div>
                      <div className="highlight-meta-item">
                        <div
                          className="highlights-icon-container"
                          style={{ fontSize: "14px" }}
                        >
                          <CalendarIcon />
                        </div>
                        {formatDate(highlight.date)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="highlight-card-controls">
                  <div
                    className="highlights-icon-container"
                    style={{ fontSize: "20px", cursor: "pointer" }}
                    onClick={() => handleStarClick(highlight.id)}
                  >
                    <StarIcon
                      fill={highlight.starred ? "rgb(245, 158, 11)" : "none"}
                      stroke={
                        highlight.starred ? "rgb(180, 83, 9)" : "currentColor"
                      }
                    />
                  </div>
                  <div className="copy-delete-container">
                    <button
                      className="copy-delete-btn"
                      onClick={() => handleCopy(highlight.text, highlight.id)}
                    >
                      <div
                        className="highlights-icon-container"
                        style={{ fontSize: "14px" }}
                      >
                        <CopyIcon />
                      </div>
                      {copiedId === highlight.id ? "Copied!" : "Copy"}
                    </button>
                    <div
                      className="highlight-delete-container"
                      ref={el => {
                        if (el) dropdownRefs.current[highlight.id] = el;
                        else delete dropdownRefs.current[highlight.id];
                      }}
                    >
                      <button
                        className="copy-delete-btn"
                        onClick={e => {
                          e.stopPropagation();
                          if (deleteConfirmationOpen === highlight.id) {
                            setDeleteConfirmationOpen(null);
                          } else {
                            setDeleteConfirmationOpen(highlight.id);
                          }
                        }}
                      >
                        <div
                          className="highlights-icon-container"
                          style={{ fontSize: "14px" }}
                        >
                          <TrashIcon />
                        </div>
                        Delete
                      </button>
                      {deleteConfirmationOpen === highlight.id && (
                        <div className="highlights-delete-dropdown">
                          <div>
                            <div className="delete-dropdown-title">
                              Delete this highlight?
                            </div>
                            <div className="delete-dropdown-msg">
                              This action is permanent and cannot be undone.
                            </div>
                          </div>
                          <div className="delete-dropdown-actions">
                            <button
                              className="delete-cancel-btn"
                              onClick={() => setDeleteConfirmationOpen(null)}
                            >
                              Cancel
                            </button>
                            <button
                              className="delete-confirm-btn"
                              onClick={() => handleDelete(highlight.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default HighlightsPage;
