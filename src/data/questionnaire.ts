export interface BollywoodCharacter {
  id: string;
  name: string;
  personalityTrait: string;
  image: string;
}

export const BOLLYWOOD_CHARACTERS: BollywoodCharacter[] = [
  {
    id: "raju",
    name: "Raju",
    personalityTrait: "Funny, chaotic & always scheming",
    image: "/images/characters/raju.png?v=2",
  },
  {
    id: "queen",
    name: "Rani",
    personalityTrait: "Innocent, Overthinker, Occasional Crier",
    image: "/images/characters/queen.png?v=2",
  },
  {
    id: "rancho",
    name: "Rancho",
    personalityTrait: "Wise, Kind, Curious",
    image: "/images/characters/rancho.png?v=2",
  },
  {
    id: "om",
    name: "Om",
    personalityTrait: "Dramatic, Loyal, Romantic",
    image: "/images/characters/om.png?v=2",
  },
  {
    id: "bunny",
    name: "Bunny",
    personalityTrait: "Bold, Adventurous",
    image: "/images/characters/bunny.png?v=2",
  },
  {
    id: "geet",
    name: "Geet",
    personalityTrait: "Witty & Unapologetically Herself",
    image: "/images/characters/geet.png?v=2",
  },
];

export const SUPERPOWER_OPTIONS = [
  "Read minds",
  "Teleportation",
  "Invisibility",
  "Shape-shifting",
  "Immortality",
  "Flying",
];

export const WEIRD_COMBINATION_OPTIONS = [
  "Maggi + Ketchup",
  "Pineapple on Pizza",
  "Cheetos + Curd",
  "Khakhra + Nutella",
  "Fries + Ice Cream",
  "Coke + Milk",
];

export const AREA_TO_EXPLORE_OPTIONS = [
  "Business & Finance",
  "Marketing, HR & Ops",
  "CS, Tech & STEM",
  "Data & AI",
  "Healthcare & Medicine",
  "Education & Arts",
];

export const AREA_TO_AOS_MAP: Record<string, string[]> = {
  "Business & Finance": [
    "Business",
    "Business & Management",
    "Finance & Accounting",
  ],
  "Marketing, HR & Ops": [
    "Marketing & Communications",
    "Operations & Supply Chain",
    "Human Resources",
    "Product Management",
    "Project Management",
    "Human Resources & Recruiting",
  ],
  "CS, Tech & STEM": ["STEM", "Technology & IT", "Computer Science"],
  "Data & AI": ["AI & Machine Learning", "Data & Analytics", "Data Science"],
  "Healthcare & Medicine": ["Healthcare & Medicine", "Healthcare"],
  "Education & Arts": [
    "Social Sciences & Humanities",
    "Arts & Design",
    "Design & Creative",
    "Law & Policy",
    "Education & Training",
    "Social Sciences",
    "Education & Career Development",
    "Education",
  ],
};

export interface AreaOption {
  label: string;
  count: number;
}

export interface AreaCategory {
  id: string;
  label: string;
  count: number;
  options: AreaOption[];
}

export const AREA_TO_EXPLORE_CATEGORIES: AreaCategory[] = [
  {
    id: "business-finance",
    label: "Business & Finance",
    count: 148,
    options: [
      { label: "Business", count: 62 },
      { label: "Business & Management", count: 52 },
      { label: "Finance & Accounting", count: 34 },
    ],
  },
  {
    id: "marketing-hr-operations",
    label: "Marketing, HR & Operations",
    count: 55,
    options: [
      { label: "Marketing & Communications", count: 25 },
      { label: "Operations & Supply Chain", count: 11 },
      { label: "Human Resources", count: 8 },
      { label: "Product Management", count: 6 },
      { label: "Project Management", count: 4 },
      { label: "Human Resources & Recruiting", count: 1 },
    ],
  },
  {
    id: "computer-science-tech-stem",
    label: "Computer Science, Tech & STEM",
    count: 176,
    options: [
      { label: "STEM", count: 144 },
      { label: "Technology & IT", count: 19 },
      { label: "Computer Science", count: 13 },
    ],
  },
  {
    id: "data-ai",
    label: "Data & AI",
    count: 98,
    options: [
      { label: "AI & Machine Learning", count: 67 },
      { label: "Data & Analytics", count: 25 },
      { label: "Data Science", count: 6 },
    ],
  },
  {
    id: "healthcare-medicine",
    label: "Healthcare & Medicine",
    count: 32,
    options: [
      { label: "Healthcare & Medicine", count: 26 },
      { label: "Healthcare", count: 6 },
    ],
  },
  {
    id: "social-sciences-law-education-arts",
    label: "Social Sciences, Law, Education & Arts",
    count: 37,
    options: [
      { label: "Social Sciences & Humanities", count: 13 },
      { label: "Arts & Design", count: 10 },
      { label: "Design & Creative", count: 4 },
      { label: "Law & Policy", count: 3 },
      { label: "Education & Training", count: 3 },
      { label: "Social Sciences", count: 2 },
      { label: "Education & Career Development", count: 1 },
      { label: "Education", count: 1 },
    ],
  },
];

/** @deprecated Use AREA_TO_EXPLORE_OPTIONS for the area picker */
export const AREA_TO_EXPLORE_OPTIONS_LEGACY = [
  "AI & Tech",
  "Marketing",
  "Finance",
  "Design",
  "Leadership",
  "Something else",
];
