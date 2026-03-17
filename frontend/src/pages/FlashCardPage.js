import { useState } from "react";
import "../styles/flashcards-page.css";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";

const FlashCardPage = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);

  if (loading) {
    return <Loading />;
  }

  if (flashcards.length === 0) {
    return <EmptyState type="flashcards"/>;
  }

  return (
    <main className="flashcards-page">
      <div className="flashcards-page-container"></div>
    </main>
  );
};

export default FlashCardPage;
