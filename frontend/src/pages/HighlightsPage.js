import { useState } from "react";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import '../styles/highlights-page.css';

const HighlightsPage = () => {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(false);

  if (loading) {
    return <Loading />;
  }

  if (highlights.length === 0) {
    return <EmptyState type="highlights"/>;
  }

  return (
    <main>HighlightsPage</main>
  )
}

export default HighlightsPage