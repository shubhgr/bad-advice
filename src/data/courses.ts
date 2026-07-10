import { Course } from "@/lib/types";

export const courses: Course[] = [
  {
    id: "1",
    courseName: "MSc Artificial Intelligence",
    university: "University of Edinburgh",
    country: "United Kingdom",
    duration: "1 year",
    accreditation: "MSc Degree",
    totalFees: "₹40 Lakhs",
    description:
      "Dive deep into machine learning, neural networks, and intelligent systems with one of the UK's top AI programs.",
    applyUrl:
      "https://www.ed.ac.uk/studying/postgraduate/degrees/index.php?r=site/view&id=901",
    logoInitials: "UoE",
    tags: [
      "ai",
      "artificial intelligence",
      "machine learning",
      "technology",
      "tech",
      "data",
    ],
  },
  {
    id: "2",
    courseName: "MBA in Global Business",
    university: "INSEAD",
    country: "France",
    duration: "10 months",
    accreditation: "MBA Degree",
    totalFees: "₹88 Lakhs",
    description:
      "Accelerate your leadership journey with a world-renowned MBA focused on strategy, finance, and global markets.",
    applyUrl: "https://www.insead.edu/master-programmes/mba",
    logoInitials: "IN",
    tags: ["mba", "business", "management", "finance", "leadership", "marketing"],
  },
];
