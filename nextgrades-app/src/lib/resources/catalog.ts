export type ResourceAccess = "free" | "premium";
export type ResourceCategory =
  | "all"
  | "materials"
  | "worksheets"
  | "videos"
  | "guides"
  | "exam"
  | "courses"
  | "formulas";

export interface CatalogResource {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  type: string;
  access: ResourceAccess;
  category: ResourceCategory;
  subject: string;
  grade: string;
  semester: string;
  image: string;
  rating?: number;
  downloads?: number;
}

import {
  RESOURCES_SUBJECT_IMAGE_BY_ID,
  RESOURCES_CONTENT_TYPE_IMAGES,
} from "./images";

const images = {
  math: RESOURCES_SUBJECT_IMAGE_BY_ID.math,
  german: RESOURCES_SUBJECT_IMAGE_BY_ID.german,
  study: RESOURCES_CONTENT_TYPE_IMAGES.learning_material,
  exam: RESOURCES_CONTENT_TYPE_IMAGES.exam_preparation,
  premium1: RESOURCES_CONTENT_TYPE_IMAGES.video_course,
  premium2: RESOURCES_CONTENT_TYPE_IMAGES.guidebook,
  premium3: RESOURCES_CONTENT_TYPE_IMAGES.mini_course,
  premium4: RESOURCES_CONTENT_TYPE_IMAGES.document,
};

export const RESOURCE_CATALOG: CatalogResource[] = [
  {
    id: "f1",
    title: "Math formula collection",
    subtitle: "Grades 1–5",
    description: "All important formulas and rules clearly summarized.",
    type: "PDF",
    access: "free",
    category: "formulas",
    subject: "Mathematics",
    grade: "Grade 5",
    semester: "Semester 1",
    image: images.math,
    rating: 4.9,
    downloads: 1204,
  },
  {
    id: "f2",
    title: "German spelling guide",
    subtitle: "Free",
    description: "The most important spelling rules explained simply.",
    type: "PDF",
    access: "free",
    category: "guides",
    subject: "German",
    grade: "Grade 6",
    semester: "Semester 1",
    image: images.german,
    rating: 4.8,
    downloads: 892,
  },
  {
    id: "f3",
    title: "Study plan template",
    subtitle: "Free",
    description: "Plan your learning step by step and stay on track.",
    type: "PDF",
    access: "free",
    category: "guides",
    subject: "All subjects",
    grade: "All grades",
    semester: "Semester 1",
    image: images.study,
    rating: 4.7,
    downloads: 2103,
  },
  {
    id: "f4",
    title: "5 tips against exam stress",
    subtitle: "Free",
    description: "Discover how to prepare for exams without stress.",
    type: "Video",
    access: "free",
    category: "exam",
    subject: "All subjects",
    grade: "Grade 12",
    semester: "Semester 2",
    image: images.exam,
    rating: 5,
    downloads: 3401,
  },
  {
    id: "p1",
    title: "Mathematics",
    subtitle: "Grade 2, Semester 2",
    description: "Complete learning materials, videos, worksheets and more.",
    type: "PREMIUM",
    access: "premium",
    category: "materials",
    subject: "Mathematics",
    grade: "Grade 7",
    semester: "Semester 2",
    image: images.premium1,
    rating: 4.9,
    downloads: 540,
  },
  {
    id: "p2",
    title: "German",
    subtitle: "Grade 3, Semester 1",
    description: "German learning materials, videos and worksheets.",
    type: "PREMIUM",
    access: "premium",
    category: "worksheets",
    subject: "German",
    grade: "Grade 8",
    semester: "Semester 1",
    image: images.premium2,
    rating: 4.8,
    downloads: 412,
  },
  {
    id: "p3",
    title: "English",
    subtitle: "Grade 4, Semester 2",
    description: "Grammar, vocabulary, materials and more.",
    type: "PREMIUM",
    access: "premium",
    category: "videos",
    subject: "English",
    grade: "Grade 9",
    semester: "Semester 2",
    image: images.premium3,
    rating: 4.9,
    downloads: 678,
  },
  {
    id: "p4",
    title: "Physics",
    subtitle: "Grade 5, Semester 1",
    description: "All topics, formulas, examples and exercises.",
    type: "PREMIUM",
    access: "premium",
    category: "exam",
    subject: "Physics",
    grade: "Grade 10",
    semester: "Semester 1",
    image: images.premium4,
    rating: 4.7,
    downloads: 389,
  },
  {
    id: "p5",
    title: "Chemistry crash course",
    subtitle: "Grade 11",
    description: "Intensive review for tests and exams.",
    type: "PREMIUM",
    access: "premium",
    category: "courses",
    subject: "Chemistry",
    grade: "Grade 11",
    semester: "Semester 2",
    image: images.premium1,
    rating: 4.8,
    downloads: 201,
  },
  {
    id: "p6",
    title: "Biology summaries",
    subtitle: "Grade 10",
    description: "Chapter summaries with diagrams and quizzes.",
    type: "PREMIUM",
    access: "premium",
    category: "materials",
    subject: "Biology",
    grade: "Grade 10",
    semester: "Semester 1",
    image: images.premium2,
    rating: 4.6,
    downloads: 156,
  },
];

export const TAB_TO_CATEGORY: ResourceCategory[] = [
  "all",
  "materials",
  "worksheets",
  "videos",
  "guides",
  "exam",
  "courses",
  "formulas",
];
