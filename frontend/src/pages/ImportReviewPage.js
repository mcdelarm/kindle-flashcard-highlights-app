import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

export const ImportReviewPage = () => {
  const {sessionId} = useParams();
  const [sessionData, setSessionData] = useState(null);

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
        setSessionData(data);
      } catch (error) {
        console.error("Error getting session data:", error);
      }
    };
    fetchSessionData();
  })

  return (
    <main>ImportReviewPage</main>
  )
}