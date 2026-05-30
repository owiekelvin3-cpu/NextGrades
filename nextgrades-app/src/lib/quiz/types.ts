export type QuestionType =
  | "mcq"
  | "true_false"
  | "fill_blank"
  | "short_answer"
  | "exercise"
  | "revision";

export type Difficulty = "easy" | "medium" | "hard";

export type UploadedMaterial = {
  id: string;
  uploaded_by: string;
  title: string;
  file_name: string | null;
  file_type: string;
  storage_path: string | null;
  file_size: number | null;
  subject_id: string | null;
  class_id: string | null;
  semester: number | null;
  topic: string | null;
  chapter: string | null;
  difficulty_default: Difficulty;
  extracted_text: string | null;
  extraction_status: string;
  extraction_error: string | null;
  created_at: string;
};

export type GeneratedQuiz = {
  id: string;
  material_id: string | null;
  created_by: string;
  title: string;
  description: string | null;
  subject_id: string | null;
  class_id: string | null;
  semester: number | null;
  topic: string | null;
  difficulty: Difficulty;
  question_types: string[];
  status: string;
  time_limit_minutes: number | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
};

export type QuizQuestion = {
  id: string;
  quiz_id: string;
  question_type: QuestionType;
  question_text: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string | null;
  points: number;
  sort_order: number;
};

export type FlashcardSet = {
  id: string;
  material_id: string | null;
  created_by: string;
  title: string;
  is_published: boolean;
  created_at: string;
};

export type Flashcard = {
  id: string;
  set_id: string;
  front_text: string;
  back_text: string;
  sort_order: number;
};

export type QuizAttempt = {
  id: string;
  quiz_id: string;
  student_id: string;
  started_at: string;
  completed_at: string | null;
  score_percent: number | null;
  correct_count: number;
  total_count: number;
  time_spent_seconds: number | null;
  answers: AttemptAnswer[];
};

export type AttemptAnswer = {
  question_id: string;
  answer: string;
  is_correct: boolean;
};

export type AiGeneratedQuestion = {
  question_type: QuestionType;
  question_text: string;
  options?: string[];
  correct_answer: string;
  explanation?: string;
  points?: number;
};

export type AiGeneratedFlashcard = {
  front_text: string;
  back_text: string;
};
