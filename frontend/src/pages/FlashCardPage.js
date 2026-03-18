import { useState } from "react";
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
  LocationIcon,
  LeftArrowIcon,
  RightArrowIcon,
  XIcon,
  CheckIcon
} from "../static/Icons";

const FlashCardPage = () => {
  const [flashcards, setFlashcards] = useState([
    {
      word: "example",
      definition: "example definiton",
      part_of_speech: "noun",
      context_sentence:
        "This is an example sentence where the word is used in a certain book that the user read.",
      known: true,
      book: "Example Book",
      location: "Page 10",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isContextOpen, setIsContextOpen] = useState(true);

  const knownCount = flashcards.filter((card) => card.known).length;
  const unknownCount = flashcards.length - knownCount;
  const flipLabelText = isFlipped ? "Back of card" : "Front of card";
  const currentWord = flashcards[currentIndex].word;
  const capitalizedWord =
    currentWord.charAt(0).toUpperCase() + currentWord.slice(1);

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
  };

  const handleShuffle = () => {
    // Implement shuffle logic here
  };

  const handleKnownClick = () => {
    // Implement logic for marking card as known
  };

  const handleStillLearningClick = () => {
    // Implement logic for marking card as still learning
  };

  if (loading) {
    return <Loading />;
  }

  if (flashcards.length === 0) {
    return <EmptyState type="flashcards" />;
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
              Card {currentIndex + 1} of {flashcards.length}
            </div>
            <div className="toolbar-shuffle-container" onClick={handleShuffle}>
              <div className="shuffle-icon-container">
                <ShuffleIcon />
              </div>
            </div>
          </div>
        </div>
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
                    {flashcards[currentIndex].part_of_speech}
                  </div>
                  <h2 className="word-title">{capitalizedWord}</h2>
                  <p className="card-face-hint">
                    Definition appears on the back after flipping the card
                  </p>
                </>
              ) : (
                <p className="definition-text">
                  {flashcards[currentIndex].definition}
                </p>
              )}
            </div>
            {flashcards[currentIndex].context_sentence && (
              // Only show context sentence if it exists
              <div className="flashcard-context">
                <div className="context-header">
                  <div className="context-title">
                    <div className="quote-icon-container">
                      <QuoteIcon />
                    </div>
                    {isContextOpen ? "Hide Context" : "Show Context"}
                  </div>
                  <button
                    className="dropdown-icon-container"
                    onClick={() => setIsContextOpen(!isContextOpen)}
                  >
                    {isContextOpen ? (
                      <DropDownCloseIcon />
                    ) : (
                      <DropDownOpenIcon />
                    )}
                  </button>
                </div>
                {isContextOpen && (
                  <div className="context-body">
                    <div className="context-quote">
                      {renderContextSentence(
                        flashcards[currentIndex].context_sentence,
                        currentWord,
                      )}
                    </div>
                    <div className="context-meta">
                      <span className="context-meta-information">
                        <div className="meta-icon-container">
                          <BookIcon />
                        </div>
                        {flashcards[currentIndex].book}
                      </span>
                      <span className="context-meta-information">
                        <div className="meta-icon-container">
                          <LocationIcon />
                        </div>
                        {flashcards[currentIndex].location}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flashcard-controls">
            <button disabled={currentIndex === 0} className={`pagination-button ${currentIndex === 0 ? "unclickable" : ""}`} onClick={() => setCurrentIndex(prev => prev - 1)}>
              <div className="arrow-icon-container">
                <LeftArrowIcon />
              </div>
              Previous
            </button>
            <div className="known-controls-container">
              <button className="flashcard-unknown-btn" onClick={handleStillLearningClick}>
                <div className="known-icon-container">
                  <XIcon />
                </div>
                Still Learning
              </button>
              <button className="flashcard-known-btn" onClick={handleKnownClick}>
                <div className="known-icon-container">
                  <CheckIcon />
                </div>
                I Know This
              </button>
            </div>
            <button disabled={currentIndex === flashcards.length - 1} className={`pagination-button ${currentIndex === flashcards.length - 1 ? "unclickable" : ""}`} onClick={() => setCurrentIndex(prev => prev + 1)}>
              Next
              <div className="arrow-icon-container">
                <RightArrowIcon />
              </div>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default FlashCardPage;
