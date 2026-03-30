import { useState, useEffect } from "react";
import "../styles/flashcards-page.css";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import {
  ShuffleIcon,
  FlipIcon,
  QuoteIcon,
  DropDownOpenIcon,
  DropDownCloseIcon,
  BookIcon,
  LeftArrowIcon,
  RightArrowIcon,
  XIcon,
  CheckIcon,
  FlashCardsIcon,
} from "../static/Icons";

const FlashCardPage = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [filteredFlashcards, setFilteredFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isContextOpen, setIsContextOpen] = useState(true);

  useEffect(() => {
    const fetchFlashcards = async () => {
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
      } catch (error) {
        console.error("Error fetching flashcards:", error);
      }
    };
    fetchFlashcards();
  }, []);

  useEffect(() => {
    let filtered = flashcards;
    if (filter === "known") {
      filtered = flashcards.filter((card) => card.known);
    } else if (filter === "unknown") {
      filtered = flashcards.filter((card) => !card.known);
    }
    setFilteredFlashcards(filtered);
    setCurrentIndex((prev) => Math.min(prev, filtered.length - 1));
  }, [filter, flashcards]);

  const knownCount = flashcards.filter((card) => card.known).length;
  const unknownCount = flashcards.length - knownCount;
  const flipLabelText = isFlipped ? "Back of card" : "Front of card";
  const currentCard = filteredFlashcards[currentIndex];
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
  };

  const handleShuffle = () => {
    // Implement shuffle logic here
    const shuffled = [...filteredFlashcards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setFilteredFlashcards(shuffled);
    setCurrentIndex(0);
  };

  const handleKnownClick = async (id, nextKnown) => {
    // Implement logic for marking card as known
    const target = flashcards.find(card => card.id === id);
    if (!target) return;

    const previousKnown = target.known;
    if (previousKnown === nextKnown) return; // No change needed

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
    } catch (error) {
      setFlashcards((currentFlashcards) =>
        currentFlashcards.map((card) =>
          card.id === id ? { ...card, known: previousKnown } : card
        )
      );
      console.error("Error updating flashcard:", error);
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
              Card {filteredFlashcards.length ? currentIndex + 1 : 0} of {filteredFlashcards.length}
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
              <div className="flip-label-container">
                <div className="flip-label">{flipLabelText}</div>
                <div
                  className="flip-icon-container"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <FlipIcon />
                </div>
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
                  <p className="definition-text">{currentCard.definition}</p>
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
                        {/* <span className="context-meta-information">
                        <div className="meta-icon-container">
                          <LocationIcon />
                        </div>
                        {currentCard.book.location}
                      </span> */}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flashcard-controls">
              <button
                disabled={currentIndex === 0}
                className={`pagination-button ${currentIndex === 0 ? "unclickable" : ""}`}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
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
              <button
                disabled={currentIndex === filteredFlashcards.length - 1}
                className={`pagination-button ${currentIndex === filteredFlashcards.length - 1 ? "unclickable" : ""}`}
                onClick={() => setCurrentIndex((prev) => prev + 1)}
              >
                Next
                <div className="arrow-icon-container">
                  <RightArrowIcon />
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default FlashCardPage;
