import { useState, useEffect, useRef } from "react";
import "../styles/flashcards-page.css";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import {
  ShuffleIcon,
  QuoteIcon,
  DropDownOpenIcon,
  DropDownCloseIcon,
  BookIcon,
  LeftArrowIcon,
  XIcon,
  CheckIcon,
  FlashCardsIcon,
  TrashIcon,
} from "../static/Icons";
import { useAuth } from "../context/AuthContext";
import FlashcardDefinition from "../components/FlashcardDefinition";

const FlashCardPage = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [displayOrder, setDisplayOrder] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isContextOpen, setIsContextOpen] = useState(true);
  const { user } = useAuth();
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const ref = useRef(null);


  useEffect(() => {
    const fetchFlashcards = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8000/flashcards", {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch flashcards");
        }
        const data = await response.json();
        setFlashcards(data.flashcards);
        setDisplayOrder(data.flashcards.map((c) => c.id));
      } catch (error) {
        console.error("Error fetching flashcards:", error);
        setFlashcards([]);
        setDisplayOrder([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFlashcards();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (deleteConfirmationOpen && ref.current && !ref.current.contains(e.target)) {
        setDeleteConfirmationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [deleteConfirmationOpen]);

  //Derive filtered cards from display order and filter values
  const filteredFlashcards = displayOrder
    .map((id) => flashcards.find((c) => c.id === id))
    .filter((card) => {
      if (!card) return false;
      if (filter === "known") return card.known;
      if (filter === "unknown") return !card.known;
      return true;
    });

  const knownCount = flashcards.filter((card) => card.known).length;
  const unknownCount = flashcards.length - knownCount;
  const safeIndex = Math.min(currentIndex, Math.max(0, filteredFlashcards.length - 1));
  const currentCard = filteredFlashcards[safeIndex];
  const capitalizedWord = currentCard?.stem
    ? currentCard.stem.charAt(0).toUpperCase() + currentCard.stem.slice(1)
    : "";

  const renderContextSentence = (sentence, word) => {
    if (!sentence || !word) return sentence;

    const parts = sentence.split(new RegExp(`(${word})`, "gi"));

    return (
      <>
        &quot;
        {parts.map((part, index) =>
          part.toLowerCase() === word.toLowerCase() ? (
            <strong key={index} className="context-word-highlight">
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

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleShuffle = () => {
    setDisplayOrder((prev) => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const goToNextCard = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, filteredFlashcards.length - 1));
    setIsFlipped(false);
  }

  const handleKnownClick = async (id, nextKnown) => {
    // Implement logic for marking card as known
    const target = flashcards.find(card => card.id === id);
    if (!target) return;

    if (target.known === nextKnown) {
      goToNextCard();
      return; // No change needed
    }

    const previousKnown = target.known;

    setFlashcards((currentFlashcards) =>
      currentFlashcards.map((card) =>
        card.id === id ? { ...card, known: nextKnown } : card
      )
    );

    try {
      const response = await fetch(`http://localhost:8000/flashcards/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ known: nextKnown }),
      });
      if (!response.ok) {
        throw new Error("Failed to update flashcard");
      }
      goToNextCard();
    } catch (error) {
      setFlashcards((currentFlashcards) =>
        currentFlashcards.map((card) =>
          card.id === id ? { ...card, known: previousKnown } : card
        )
      );
      console.error("Error updating flashcard:", error);
    }
  };

  const handleDelete = async (id) => {
    const target = flashcards.find(card => card.id === id);
    if (!target) return;

    const flashcardIndex = flashcards.findIndex(card => card.id === id);
    const displayIndex = displayOrder.findIndex(cardId => cardId === id);

    // Optimistically remove card from UI
    setFlashcards((currentFlashcards) =>
      currentFlashcards.filter((card) => card.id !== id)
    );
    setDisplayOrder((currentOrder) => currentOrder.filter((cardId) => cardId !== id));

    try {
      const response = await fetch(`http://localhost:8000/flashcards/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to delete flashcard");
      }
    } catch (error) {
      // Revert UI changes if deletion fails
      setFlashcards((currentFlashcards) => {
        const newFlashcards = [...currentFlashcards];
        newFlashcards.splice(flashcardIndex, 0, target);
        return newFlashcards;
      });
      setDisplayOrder((currentOrder) => {
        const newOrder = [...currentOrder];
        newOrder.splice(displayIndex, 0, target.id);
        return newOrder;
      });
      console.error("Error deleting flashcard:", error);
    } finally {
      setDeleteConfirmationOpen(false);
    }
  };

  const handleDefinitionUpdate = async (id, newDefinition) => {
    const target = flashcards.find(card => card.id === id);
    if (!target) return;

    const previousDefinition = target.definition;

    setFlashcards((currentFlashcards) =>
      currentFlashcards.map((card) =>
        card.id === id ? { ...card, definition: newDefinition } : card
      )
    );

    try {
      const response = await fetch(`http://localhost:8000/flashcards/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ definition: newDefinition }),
      });
      if (!response.ok) {
        throw new Error("Failed to update flashcard definition");
      }
    } catch (error) {
      setFlashcards((currentFlashcards) =>
        currentFlashcards.map((card) =>
          card.id === id ? { ...card, definition: previousDefinition } : card
        )
      );
      console.error("Error updating flashcard definition:", error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!flashcards.length) {
    return (
      <EmptyState
        title="No Flashcards Found"
        message="You have not generated any vocabulary flashcards yet. Upload your Kindle vocab.db file to get started and automatically generate study material"
        icon={<FlashCardsIcon />}
      />
    );
  }

  return (
    <main className="flashcards-page">
      <div className="flashcards-page-container">
        <div className="flashcards-toolbar">
          <div className="toolbar-left">
            <div className="flashcards-filters-tabs">
              <div
                className={`flashcards-filter-tab${filter === "all" ? " active" : ""}`}
                onClick={() => handleFilterChange("all")}
              >
                All Cards
              </div>
              <div
                className={`flashcards-filter-tab${filter === "unknown" ? " active" : ""}`}
                onClick={() => handleFilterChange("unknown")}
              >
                Learning ({unknownCount})
              </div>
              <div
                className={`flashcards-filter-tab${filter === "known" ? " active" : ""}`}
                onClick={() => handleFilterChange("known")}
              >
                Known ({knownCount})
              </div>
            </div>
          </div>
          <div className="toolbar-right">
            <div className="toolbar-progress-text">
              Card {filteredFlashcards.length ? safeIndex + 1 : 0} of {filteredFlashcards.length}
            </div>
            <div className="toolbar-shuffle-container" onClick={handleShuffle}>
              <div className="shuffle-icon-container">
                <ShuffleIcon />
              </div>
            </div>
          </div>
        </div>
        {currentCard && (
          <div className="flashcard-container">
            <div className="flashcard">
              <div className="delete-dropdown-container" ref={ref}>
                <button className="delete-card-btn" onClick={() => setDeleteConfirmationOpen(!deleteConfirmationOpen)}>
                  Delete
                  <div className="trash-icon-container">
                    <TrashIcon />
                  </div>
                </button>
                {deleteConfirmationOpen && (
                  <div className="delete-confirmation-dropdown">
                    <div>
                      <div className="delete-dropdown-title">Delete this flashcard?</div>
                      <div className="delete-dropdown-msg">This action is permanent and cannot be undone.</div>
                    </div>
                    <div className="delete-dropdown-actions">
                      <button className="delete-cancel-btn" onClick={() => setDeleteConfirmationOpen(false)}>Cancel</button>
                      <button className="delete-confirm-btn" onClick={() => handleDelete(currentCard.id)}>Delete</button>
                    </div>
                  </div>
                )}
              </div>
              <div
                className="flashcard-content"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                {!isFlipped ? (
                  <>
                    <div className="part-of-speech-badge">
                      {currentCard.part_of_speech}
                    </div>
                    <h2 className="word-title">{capitalizedWord}</h2>
                    <p className="card-face-hint">
                      Definition appears on the back after flipping the card
                    </p>
                  </>
                ) : (
                  <FlashcardDefinition currentCard={currentCard} onChange={handleDefinitionUpdate} />
                )}
              </div>
              {currentCard.context && (
                // Only show context sentence if it exists
                <div className="flashcard-context">
                  <div className="context-header">
                    <div className="context-title">
                      <div className="quote-icon-container">
                        <QuoteIcon />
                      </div>
                      {isContextOpen ? "Hide Context" : "Show Context"}
                    </div>
                    <div
                      className="dropdown-icon-container"
                      onClick={() => setIsContextOpen(!isContextOpen)}
                    >
                      {isContextOpen ? (
                        <DropDownCloseIcon />
                      ) : (
                        <DropDownOpenIcon />
                      )}
                    </div>
                  </div>
                  {isContextOpen && (
                    <div className="context-body">
                      <div className="context-quote">
                        {renderContextSentence(
                          currentCard.context,
                          currentCard.word,
                        )}
                      </div>
                      <div className="context-meta">
                        <span className="context-meta-information">
                          <div className="meta-icon-container">
                            <BookIcon />
                          </div>
                          {currentCard.book.title}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flashcard-controls">
              <button
                disabled={safeIndex === 0}
                className={`pagination-button ${safeIndex === 0 ? "unclickable" : ""}`}
                onClick={() => {
                  setCurrentIndex((prev) => prev - 1);
                  setIsFlipped(false);}}
              >
                <div className="arrow-icon-container">
                  <LeftArrowIcon />
                </div>
                Previous
              </button>
              <div className="known-controls-container">
                <button
                  className="flashcard-unknown-btn"
                  onClick={() => handleKnownClick(currentCard.id, false)}
                >
                  <div className="known-icon-container">
                    <XIcon />
                  </div>
                  Still Learning
                </button>
                <button
                  className="flashcard-known-btn"
                  onClick={() => handleKnownClick(currentCard.id, true)}
                >
                  <div className="known-icon-container">
                    <CheckIcon />
                  </div>
                  I Know This
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default FlashCardPage;
