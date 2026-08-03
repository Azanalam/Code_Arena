export interface LandingUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface ProblemPreview {
  title: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
}

export const PREVIEW_PROBLEMS: ProblemPreview[] = [
  { title: "Two Sum", difficulty: "easy", category: "javascript" },
  { title: "Valid Parentheses", difficulty: "easy", category: "javascript" },
  { title: "Maximum Subarray", difficulty: "medium", category: "javascript" },
  { title: "Product of Array Except Self", difficulty: "medium", category: "javascript" },
  { title: "Trapping Rain Water", difficulty: "hard", category: "javascript" },
  { title: "Sliding Window Maximum", difficulty: "hard", category: "javascript" },
  { title: "HTML Table", difficulty: "hard", category: "html" },
  { title: "CSS Media Query", difficulty: "hard", category: "css" },
  { title: "CSS Spinner Animation", difficulty: "medium", category: "css" },
  { title: "Word Break", difficulty: "hard", category: "javascript" },
  { title: "HTML Select Dropdown", difficulty: "easy", category: "html" },
  { title: "CSS Grid Layout", difficulty: "medium", category: "css" },
];