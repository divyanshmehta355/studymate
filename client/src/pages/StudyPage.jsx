import { useState, useEffect } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';
import {
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StudyPage() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');

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
    <div className="p-6 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Study Tools</h1>
        <p className="text-muted-foreground">Generate flashcards and summaries from your documents</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 items-start md:items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <select
            className="flex h-10 w-full md:w-[300px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedDocId}
            onChange={(e) => {
              setSelectedDocId(e.target.value);
              setFlashcards([]);
              setSummary(null);
            }}
          >
            <option value="">Select a document to study...</option>
            {documents.map((d) => (
              <option key={d.id} value={d.id}>{d.filename}</option>
            ))}
          </select>
        </div>
      </div>

      <Tabs defaultValue="flashcards" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
          <TabsTrigger value="flashcards" className="flex items-center gap-2">
            <Layers className="h-4 w-4" /> Flashcards
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flashcards" className="mt-0">
          {flashcards.length === 0 ? (
            <Card className="border-dashed shadow-none bg-muted/30">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Layers className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No flashcards yet</h3>
                <p className="text-muted-foreground mb-6">Select a document and let AI generate study cards for you.</p>
                <Button onClick={generateFlashcards} disabled={!selectedDocId || generatingCards} size="lg">
                  {generatingCards ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="mr-2 h-5 w-5" /> Generate Flashcards</>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="max-w-2xl mx-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
              {/* Flashcard 3D Container */}
              <div 
                className="relative w-full h-[350px] perspective-1000 mb-8 cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div className={`w-full h-full duration-500 preserve-3d relative ${isFlipped ? 'rotate-y-180' : ''}`}>
                  {/* Front */}
                  <Card className="absolute inset-0 backface-hidden shadow-xl border-primary/20 bg-gradient-to-br from-background to-muted flex flex-col">
                    <CardHeader className="pb-2 border-b bg-muted/50 rounded-t-xl">
                      <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary/50" /> Question
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex items-center justify-center p-8 text-center text-xl md:text-2xl font-medium leading-relaxed">
                      {flashcards[currentCard]?.question}
                    </CardContent>
                  </Card>
                  
                  {/* Back */}
                  <Card className="absolute inset-0 backface-hidden rotate-y-180 shadow-xl border-primary/40 bg-gradient-to-bl from-primary/5 to-background flex flex-col">
                    <CardHeader className="pb-2 border-b bg-primary/5 rounded-t-xl">
                      <CardTitle className="text-sm font-medium text-primary uppercase tracking-wider flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" /> Answer
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex items-center justify-center p-8 text-center text-lg md:text-xl leading-relaxed text-muted-foreground overflow-y-auto">
                      {flashcards[currentCard]?.answer}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4 bg-card px-6 py-3 rounded-full border shadow-sm">
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); prevCard(); }} className="rounded-full">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="text-sm font-medium tabular-nums min-w-[3rem] text-center">
                  {currentCard + 1} / {flashcards.length}
                </span>
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); nextCard(); }} className="rounded-full">
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <div className="w-px h-6 bg-border mx-2" />
                <Button variant="ghost" size="icon" onClick={shuffleCards} title="Shuffle cards">
                  <Shuffle className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={generateFlashcards} title="Regenerate cards">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">Click the card to flip</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="summary" className="mt-0">
          {!summary ? (
            <Card className="border-dashed shadow-none bg-muted/30">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No summary yet</h3>
                <p className="text-muted-foreground mb-6">Select a document and generate a concise AI summary.</p>
                <Button onClick={generateSummary} disabled={!selectedDocId || generatingSummary} size="lg">
                  {generatingSummary ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="mr-2 h-5 w-5" /> Generate Summary</>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg border-primary/10 animate-in fade-in slide-in-from-bottom-4 max-w-4xl mx-auto">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-8">
                <div>
                  <h4 className="text-lg font-semibold mb-3 border-l-4 border-primary pl-3">Overview</h4>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {summary.summary}
                  </p>
                </div>

                {summary.key_points?.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-4 border-l-4 border-primary pl-3">Key Points</h4>
                    <ul className="space-y-3 pl-2">
                      {summary.key_points.map((point, i) => (
                        <li key={i} className="flex items-start gap-3 bg-muted/40 p-4 rounded-lg">
                          <div className="min-w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <span className="text-foreground leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              <div className="p-6 pt-0 flex justify-end">
                <Button variant="outline" onClick={generateSummary} disabled={generatingSummary}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Required for the 3D flip effect */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
