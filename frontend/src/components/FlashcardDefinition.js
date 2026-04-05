import "../styles/flashcards-page.css";
import { useState, useEffect } from "react";
import {EditIcon} from "../static/Icons";

const FlashcardDefinition = ({ currentCard, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(currentCard.definition || "");

  useEffect(() => {
    setValue(currentCard.definition || "");
  }, [currentCard.definition]);

  const handleUpdate = () => {
    if (value !== currentCard.definition) {
      onChange(currentCard.id, value);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(currentCard.definition || "");
    setIsEditing(false);
  };

  return (
    <div className="definition-container">
      <div
        className="highlights-icon-container"
        onClick={e => {
          e.stopPropagation();
          setIsEditing(!isEditing);
        }}
        style={{ fontSize: "20px" }}
      >
        <EditIcon />
      </div>
      {isEditing ? (
        <div className="edit-definition-container">
          <textarea
            className="edit-definition-textarea"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Edit definition..."
            onClick={e => e.stopPropagation()}
          />
          <div className="edit-definition-actions">
            <button onClick={e => { e.stopPropagation(); handleCancel(); }}>Cancel</button>
            <button onClick={e => { e.stopPropagation(); handleUpdate(); }}>Save</button>
          </div>
        </div>
      ) : (
        <p className="definition-text">{currentCard.definition}</p>
      )}
    </div>
  );
};

export default FlashcardDefinition;
