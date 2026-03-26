import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../styles/globals.css";
import CustomCheckbox from "../components/CustomCheckbox";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import { EmptyFileIcon } from "../static/Icons";

export const ImportReviewPage = () => {
  const { sessionId } = useParams();
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [sessionType, setSessionType] = useState(null);
  const [activeBook, setActiveBook] = useState(null);
  const [deselectedItems, setDeselectedItems] = useState(new Set());
  const [deselectedBooks, setDeselectedBooks] = useState(new Set());

  const bookCount = Object.keys(sessionData || {}).length;
  const itemCount = Object.values(sessionData || {}).reduce(
    (sum, book) => sum + book.items.length,
    0,
  );
  const subtitleText =
    sessionType === "clippings" ? (
      <>
        highlights in <span className="file-name-span">My Clippings.txt</span>
      </>
    ) : (
      <>
        words in <span className="file-name-span">vocab.db</span>
      </>
    );
  const panelTitle = sessionType === "clippings" ? "Highlights" : "Words";

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/uploads/${sessionId}`,
          {
            method: "GET",
          },
        );
        if (!response.ok) {
          throw new Error("Session GET request failed");
        }

        const data = await response.json();
        setSessionData(data?.data ?? null);
        setSessionType(data?.type ?? null);
      } catch (error) {
        console.error("Error getting session data:", error);
      }
    };
    fetchSessionData();
  }, [sessionId]);

  useEffect(() => {
    if (sessionData) {
      setActiveBook(Object.keys(sessionData)[0]);
    }
  }, [sessionData]);

  const handleBooksSelectAll = () => {};

  const handleBookSelect = () => {};

  const handleItemSelectAll = () => {};

  const handleItemSelect = (itemId) => () => {};

  if (loading) {
    return <Loading />;
  }

  if (!sessionData || Object.keys(sessionData).length === 0) {
    return (
      <EmptyState
        title="No Import Data Found"
        message="No imported file data has been found. Please upload a Kindle My Clippings.txt or vocab.db file to get started"
        icon={<EmptyFileIcon />}
      />
    );
  }

  return (
    <main className="import-review-container">
      <div className="review-header">
        <div>
          <Link to="/" className="back-link">
            <span>&larr;</span> Back to Upload
          </Link>
          <h1 className="review-title">Review Import</h1>
          <p className="review-subtitle">
            We found {bookCount} books and {itemCount} {subtitleText}. Select
            the ones you want to keep.
          </p>
        </div>
        <div className="import-review-actions">
          <span className="selection-count">
            {itemCount - deselectedItems.size} selected
          </span>
          <button className="review-generate-btn">Generate Highlights</button>
        </div>
      </div>
      <div className="review-main-container">
        <div className="review-books-container">
          <div className="review-panel">
            <div className="review-panel-header">
              <span className="review-panel-title">Books ({bookCount})</span>
              <div className="review-select-all">
                <CustomCheckbox
                  selected={true}
                  onChange={handleBooksSelectAll}
                />
                Select All
              </div>
            </div>
            <div className="review-book-list">
              {Object.entries(sessionData).map(([bookTitle, bookData]) => (
                <div
                  key={bookTitle}
                  className={`review-book-item ${activeBook === bookTitle ? "active" : ""}`}
                  onClick={() => setActiveBook(bookTitle)}
                >
                  <CustomCheckbox selected={true} onChange={handleBookSelect} />
                  <div className="book-item-content">
                    <div className="book-item-title">{bookTitle}</div>
                    <div className="book-item-meta">
                      {bookData.author} &bull; {bookData.items.length}{" "}
                      highlights
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="review-content-container">
          <div className="review-panel">
            <div className="review-panel-header">
              <span className="review-panel-title">
                {panelTitle} from "{activeBook}"
              </span>
              <div className="review-select-all">
                <CustomCheckbox
                  selected={true}
                  onChange={handleItemSelectAll}
                />
                Select All ({sessionData[activeBook]?.items.length || 0})
              </div>
            </div>
            <div className="review-item-list">
              {sessionData[activeBook]?.items.map((item, index) => {
                const isSelected = !deselectedItems.has(item.id);
                return (
                  <div key={item.id} className="review-word-item">
                    <CustomCheckbox
                      selected={isSelected}
                      onChange={handleItemSelect(item.id)}
                    />
                    <div className={`word-item-content ${!isSelected ? "deselected" : ""}`}>
                      <div className="word-item-text">
                        {sessionType === "clippings" ? (
                          <>
                            Highlight {index + 1}{" "}
                            <span>&bull; Location {item.location}</span>
                          </>
                        ) : (
                          <>{item.word}</>
                        )}
                      </div>
                      <div className="word-item-context">"{item.text}"</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
