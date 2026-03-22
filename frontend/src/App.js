import {Routes, Route, Navigate} from 'react-router-dom';
import FlashCardPage from './pages/FlashCardPage';
import LandingPage from './pages/LandingPage';
import HighlightsPage from './pages/HighlightsPage';
import { ImportReviewPage } from './pages/ImportReviewPage';
import Header from './components/Header';
import './styles/globals.css';

function App() {
  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path='/' element={<LandingPage/>}/>
        <Route path='/flashcards' element={<FlashCardPage/>}/>
        <Route path='/highlights' element={<HighlightsPage/>}/>
        <Route path='/import-review/:sessionId' element={<ImportReviewPage/>}/>
        <Route path='*' element={<Navigate to='/'/>}/>
      </Routes>
    </div>
  );
}

export default App;
