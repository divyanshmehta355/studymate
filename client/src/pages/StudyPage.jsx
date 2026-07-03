import { useState, useEffect } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';
import {
  GraduationCap,
  FileText,
  Layers,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  RotateCcw,
  Loader2,
  Sparkles,
} from 'lucide-react';
import './StudyPage.css';

export default function StudyPage() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [activeTab, setActiveTab] = useState('flashcards');

  // flashcard state
  const [flashcards, setFlashcards] = useState([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [generatingCards, setGeneratingCards] = useState(false);

  // summary state
  const [summary, setSummary] = useState(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  useEffect(() => {
    api.get('/documents/').then((r) => {
      setDocuments(r.data.filter((d) => d.status === 'ready'));
    }).catch(() => {});
  }, []);

  async function generateFlashcards() {
    if (!selectedDocId) {
      toast.error('Select a document first');
      return;
    }
    setGeneratingCards(true);
    setFlashcards([]);
    setCurrentCard(0);
    setIsFlipped(false);

    try {
      const res = await api.post(`/study/${selectedDocId}/flashcards`);
      setFlashcards(res.data.flashcards);
      toast.success(`Generated ${res.data.flashcards.length} flashcards!`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate flashcards');
    } finally {
      setGeneratingCards(false);
    }
  }

  async function generateSummary() {
    if (!selectedDocId) {
      toast.error('Select a document first');
      return;
    }
    setGeneratingSummary(true);
    setSummary(null);

    try {
      const res = await api.post(`/study/${selectedDocId}/summary`);
      setSummary(res.data);
      toast.success('Summary generated!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate summary');
    } finally {
      setGeneratingSummary(false);
    }
  }

  function nextCard() {
    setIsFlipped(false);
    setCurrentCard((prev) => (prev + 1) % flashcards.length);
  }

  function prevCard() {
    setIsFlipped(false);
    setCurrentCard((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  }

  function shuffleCards() {
    setIsFlipped(false);
    setCurrentCard(0);
    setFlashcards((prev) => [...prev].sort(() => Math.random() - 0.5));
    toast.success('Cards shuffled!');
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Study Tools</h1>
        <p>Generate flashcards and summaries from your documents</p>
      </div>

      {/* document selector */}
      <div className="study-controls">
        <div className="study-doc-picker">
          <FileText size={16} />
          <select
            value={selectedDocId}
            onChange={(e) => {
              setSelectedDocId(e.target.value);
              setFlashcards([]);
              setSummary(null);
            }}
          >
            <option value="">Select a document...</option>
            {documents.map((d) => (
              <option key={d.id} value={d.id}>{d.filename}</option>
            ))}
          </select>
        </div>

        <div className="study-tabs">
          <button
            className={`study-tab ${activeTab === 'flashcards' ? 'active' : ''}`}
            onClick={() => setActiveTab('flashcards')}
          >
            <Layers size={16} />
            Flashcards
          </button>
          <button
            className={`study-tab ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            <BookOpen size={16} />
            Summary
          </button>
        </div>
      </div>

      {/* flashcards tab */}
      {activeTab === 'flashcards' && (
        <div className="study-content fade-in">
          {flashcards.length === 0 ? (
            <div className="study-empty">
              <Layers size={48} />
              <h3>No flashcards yet</h3>
              <p>Select a document and generate flashcards to study</p>
              <button
                className="btn btn-primary"
                onClick={generateFlashcards}
                disabled={!selectedDocId || generatingCards}
              >
                {generatingCards ? (
                  <><Loader2 size={16} className="status-spin" /> Generating...</>
                ) : (
                  <><Sparkles size={16} /> Generate Flashcards</>
                )}
              </button>
            </div>
          ) : (
            <>
              {/* flashcard */}
              <div
                className={`flashcard ${isFlipped ? 'flipped' : ''}`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div className="flashcard-inner">
                  <div className="flashcard-front">
                    <span className="flashcard-label">Question</span>
                    <p>{flashcards[currentCard]?.question}</p>
                  </div>
                  <div className="flashcard-back">
                    <span className="flashcard-label">Answer</span>
                    <p>{flashcards[currentCard]?.answer}</p>
                  </div>
                </div>
              </div>

              {/* controls */}
              <div className="flashcard-controls">
                <button className="btn btn-secondary btn-icon" onClick={prevCard}>
                  <ChevronLeft size={18} />
                </button>
                <span className="flashcard-counter">
                  {currentCard + 1} / {flashcards.length}
                </span>
                <button className="btn btn-secondary btn-icon" onClick={nextCard}>
                  <ChevronRight size={18} />
                </button>
                <button className="btn btn-secondary btn-icon" onClick={shuffleCards} title="Shuffle">
                  <Shuffle size={16} />
                </button>
                <button className="btn btn-secondary btn-icon" onClick={generateFlashcards} title="Regenerate">
                  <RotateCcw size={16} />
                </button>
              </div>
              <p className="flashcard-hint">Click the card to flip</p>
            </>
          )}
        </div>
      )}

      {/* summary tab */}
      {activeTab === 'summary' && (
        <div className="study-content fade-in">
          {!summary ? (
            <div className="study-empty">
              <BookOpen size={48} />
              <h3>No summary yet</h3>
              <p>Select a document and generate a summary</p>
              <button
                className="btn btn-primary"
                onClick={generateSummary}
                disabled={!selectedDocId || generatingSummary}
              >
                {generatingSummary ? (
                  <><Loader2 size={16} className="status-spin" /> Generating...</>
                ) : (
                  <><Sparkles size={16} /> Generate Summary</>
                )}
              </button>
            </div>
          ) : (
            <div className="summary-content card">
              <h3>Summary</h3>
              <p className="summary-text">{summary.summary}</p>

              {summary.key_points?.length > 0 && (
                <>
                  <h4>Key Points</h4>
                  <ul className="summary-points">
                    {summary.key_points.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </>
              )}

              <button
                className="btn btn-secondary"
                onClick={generateSummary}
                disabled={generatingSummary}
                style={{ marginTop: 'var(--space-md)' }}
              >
                <RotateCcw size={14} />
                Regenerate
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
