import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../styles/globals.css";
import CustomCheckbox from "../components/CustomCheckbox";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import { EmptyFileIcon } from "../static/Icons";
import { useNavigate } from "react-router-dom";

export const ImportReviewPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [sessionType, setSessionType] = useState(null);
  const [activeBook, setActiveBook] = useState(null);
  const [deselectedItems, setDeselectedItems] = useState(new Set());
  const [deselectedBooks, setDeselectedBooks] = useState(new Set());

  const typeLabel = sessionType === "highlights" ? "Highlights" : "Flashcards";
  const bookCount = Object.keys(sessionData || {}).length;
  const itemCount = Object.values(sessionData || {}).reduce(
    (sum, book) => sum + book.items.length,
    0,
  );
  const subtitleText =
    sessionType === "highlights" ? (
      <>
        highlights in <span className="file-name-span">My Clippings.txt</span>
      </>
    ) : (
      <>
        words in <span className="file-name-span">vocab.db</span>
      </>
    );
  const panelTitle = sessionType === "highlights" ? "Highlights" : "Words";
  const selectedCount = Object.entries(sessionData || {}).reduce(
    (sum, [bookTitle, book]) => {
      if (deselectedBooks.has(bookTitle)) {
        return sum;
      }

      return (
        sum + book.items.filter((item) => !deselectedItems.has(item.id)).length
      );
    },
    0,
  );

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

  const handleBooksSelectAll = () => {
    //if all books are currently selected, deselect all. Otherwise select all
    if (deselectedBooks.size === 0) {
      setDeselectedBooks(new Set(Object.keys(sessionData)));
      setDeselectedItems(new Set());
    } else {
      setDeselectedBooks(new Set());
      setDeselectedItems(new Set());
    }
  };

  const handleBookSelect = (bookTitle) => {
    const newDeselectedBooks = new Set(deselectedBooks);
    const newDeselectedItems = new Set(deselectedItems);

    const bookItemIds = sessionData[bookTitle].items.map((i) => i.id) || [];

    if (deselectedBooks.has(bookTitle)) {
      newDeselectedBooks.delete(bookTitle);
      bookItemIds.forEach((id) => newDeselectedItems.delete(id));
    } else {
      newDeselectedBooks.add(bookTitle);
      bookItemIds.forEach((id) => newDeselectedItems.delete(id));
    }
    setDeselectedBooks(newDeselectedBooks);
    setDeselectedItems(newDeselectedItems);
  };

  const handleItemSelectAll = () => {
    const items = sessionData[activeBook]?.items || [];

    const allSelected =
      !deselectedBooks.has(activeBook) &&
      items.every((item) => !deselectedItems.has(item.id));

    const newDeselectedItems = new Set(deselectedItems);
    const newDeselectedBooks = new Set(deselectedBooks);

    if (allSelected) {
      //All selected -> deselect entire book
      newDeselectedBooks.add(activeBook);
      items.forEach((item) => newDeselectedItems.delete(item.id));
    } else {
      //Not all selected -> select everything
      newDeselectedBooks.delete(activeBook);
      items.forEach((item) => newDeselectedItems.delete(item.id));
    }
    setDeselectedBooks(newDeselectedBooks);
    setDeselectedItems(newDeselectedItems);
  };

  const handleItemSelect = (itemId) => {
    const bookItems = sessionData[activeBook]?.items || [];
    const bookItemIds = bookItems.map((item) => item.id);

    const nextDeselectedBooks = new Set(deselectedBooks);
    const nextDeselectedItems = new Set(deselectedItems);

    if (nextDeselectedBooks.has(activeBook)) {
      nextDeselectedBooks.delete(activeBook);

      bookItemIds.forEach((id) => {
        if (id !== itemId) {
          nextDeselectedItems.add(id);
        }
      });
    } else {
      if (nextDeselectedItems.has(itemId)) {
        nextDeselectedItems.delete(itemId);
      } else {
        nextDeselectedItems.add(itemId);
      }

      const allDeselected = bookItemIds.every((id) =>
        nextDeselectedItems.has(id),
      );

      if (allDeselected) {
        nextDeselectedBooks.add(activeBook);
        bookItemIds.forEach((id) => nextDeselectedItems.delete(id));
      }
    }

    setDeselectedBooks(nextDeselectedBooks);
    setDeselectedItems(nextDeselectedItems);
  };

  const renderContextSentence = (sentence, word) => {
    if (!sentence || !word) return sentence;

    if (sessionType === "highlights") {
      return <em>"{sentence}"</em>;
    }

    const parts = sentence.split(new RegExp(`(${word})`, "gi"));

    return (
      <>
        &quot;
        {parts.map((part, index) =>
          part.toLowerCase() === word.toLowerCase() ? (
            <strong
              key={index}
              style={{ color: "rgb(15, 23, 34)", fontWeight: "600" }}
            >
              {part}
            </strong>
          ) : (
            part
          ),
        )}
        &quot;
      </>
    );
  };

  const getGeneratedSessionStorageKey = (type) => {
    if (type === "highlights") {
      return "generatedHighlightsSessionId";
    } else if (type === "flashcards") {
      return "generatedFlashcardsSessionId";
    }
    return null;
  }

  const handleGenerateClick = async () => {
    const localStorageKey = getGeneratedSessionStorageKey(sessionType);
    const generatedSessionId = localStorage.getItem(localStorageKey);

    const payload = {
      importSessionId: sessionId,
      deselectedBooks: [...deselectedBooks],
      deselectedItems: [...deselectedItems],
      generatedSessionId
    };

    const response = await fetch("http://localhost:8000/uploads/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Failed to generate type: ${sessionType}`);
      return;
    }

    const data = await response.json();
    console.log("Generation response:", data);
    //possibly handle redis session id and store in local storage
    if (data.session_id) {
      localStorage.setItem(localStorageKey, data.session_id);
    }
    navigate(`/${sessionType}`);
  };

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
          <span className="selection-count">{selectedCount} selected</span>
          <button className="review-generate-btn" onClick={handleGenerateClick}>
            Generate {typeLabel}
          </button>
        </div>
      </div>
      <div className="review-main-container">
        <div className="review-books-container">
          <div className="review-panel">
            <div className="review-panel-header">
              <span className="review-panel-title">Books ({bookCount})</span>
              <div className="review-select-all">
                <CustomCheckbox
                  selected={deselectedBooks.size === 0}
                  onChange={handleBooksSelectAll}
                />
                Select All
              </div>
            </div>
            <div className="review-book-list">
              {Object.entries(sessionData).map(([bookTitle, bookData]) => (
                <div
                  key={bookData.id}
                  className={`review-book-item ${activeBook === bookTitle ? "active" : ""}`}
                  onClick={() => setActiveBook(bookTitle)}
                >
                  <CustomCheckbox
                    selected={!deselectedBooks.has(bookTitle)}
                    onChange={(event) => {
                      event.stopPropagation();
                      handleBookSelect(bookTitle);
                    }}
                  />
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
                  selected={
                    !deselectedBooks.has(activeBook) &&
                    sessionData[activeBook]?.items.every(
                      (item) => !deselectedItems.has(item.id),
                    )
                  }
                  onChange={handleItemSelectAll}
                />
                Select All ({sessionData[activeBook]?.items.length || 0})
              </div>
            </div>
            <div className="review-item-list">
              {sessionData[activeBook]?.items.map((item, index) => {
                const isSelected =
                  !deselectedBooks.has(activeBook) &&
                  !deselectedItems.has(item.id);
                return (
                  <div key={item.id} className="review-word-item">
                    <CustomCheckbox
                      selected={isSelected}
                      onChange={() => handleItemSelect(item.id)}
                    />
                    <div
                      className={`word-item-content ${!isSelected ? "deselected" : ""}`}
                    >
                      <div className="word-item-text">
                        {sessionType === "highlights" ? (
                          <>
                            Highlight {index + 1}{" "}
                            <span>&bull; Location {item.location}</span>
                          </>
                        ) : (
                          <>
                            {item.stem
                              ? item.stem.charAt(0).toUpperCase() +
                                item.stem.slice(1)
                              : ""}
                          </>
                        )}
                      </div>
                      <div className="word-item-context">
                        {renderContextSentence(item.text, item.word)}
                      </div>
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
