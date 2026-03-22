import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import "../styles/import-review-page.css";

export const ImportReviewPage = () => {
  const {sessionId} = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [sessionType, setSessionType] = useState(null);

  const uploadedFile = sessionData?.type === 'clippings' ? "My Clippings.txt" : "vocab.db";
  const itemCount = sessionData?.data?.length ?? 0;
  const getBooks = (data) => {
    const map = new Map();
    data.forEach(item => {
      if (!map.has(item.book_title)) {
        map.set(item.book_title, {
          title: item.book_title,
          author: item.author,
          count: 1
        });
      } else {
        const book = map.get(item.book_title);
        book.count += 1;
        map.set(item.book_title, book);
      }
    });
    return Array.from(map.values());
  };
  const books = getBooks(sessionData || []);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/uploads/${sessionId}`, {
          method: "GET",
        });
        if (!response.ok) {
          throw new Error("Session GET request failed");
        }

        const data = await response.json();
        console.log("GET successful:", data);
        setSessionData(data?.data ?? null);
        setSessionType(data?.type ?? null);
      } catch (error) {
        console.error("Error getting session data:", error);
      }
    };
    fetchSessionData();
  }, [sessionId]);

  return (
    <main className="import-review-container">
      <div className="review-header">
        <div>
          <Link to="/" className="back-link"><span>&larr;</span> Back to Upload</Link>
          <h1 className="review-title">Review Import</h1>
          <p className="review-subtitle">We</p>
        </div>
      </div>
    </main>
  )
}