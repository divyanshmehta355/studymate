from pydantic import BaseModel


class Flashcard(BaseModel):
    """A single flashcard with question and answer."""
    question: str
    answer: str


class FlashcardResponse(BaseModel):
    """Collection of generated flashcards."""
    flashcards: list[Flashcard]
    document_id: str


class SummaryResponse(BaseModel):
    """Generated summary of a document."""
    summary: str
    key_points: list[str]
    document_id: str
