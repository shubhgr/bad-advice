import { readFileSync } from "fs";
import path from "path";
import { AREA_TO_AOS_MAP } from "@/data/questionnaire";
import { parseCSV } from "@/lib/csv";
import { Course } from "@/lib/types";

interface OnlineProgramRow {
  id: string;
  name: string;
  universityName: string;
  aos: string;
  category: string;
  programCategory: string;
  courseDuration: string;
  durationType: string;
  type: string;
  degree: string;
  tuitionCost: string;
  url: string;
  programSummary: string;
  programOverview: string;
  active: string;
  countryId: string;
}

const COUNTRY_NAMES: Record<string, string> = {
  "1": "United States",
  "2": "United Kingdom",
  "3": "Canada",
  "4": "Australia",
  "5": "Germany",
  "8": "India",
  "15": "Singapore",
  "58": "Ireland",
  "185": "Netherlands",
  "224": "Spain",
};

const MAX_RECOMMENDATIONS = 8;

let cachedPrograms: OnlineProgramRow[] | null = null;

function getColumnIndex(header: string[]): Record<string, number> {
  return Object.fromEntries(header.map((name, index) => [name, index]));
}

function loadPrograms(): OnlineProgramRow[] {
  if (cachedPrograms) return cachedPrograms;

  const csvPath = path.join(process.cwd(), "src/data/online_programs.csv");
  const text = readFileSync(csvPath, "utf8");
  const rows = parseCSV(text);
  const header = rows[0];
  const index = getColumnIndex(header);

  cachedPrograms = rows
    .slice(1)
    .filter((row) => row[index.id] && row[index.active] === "1")
    .map((row) => ({
      id: row[index.id],
      name: row[index.name] ?? "",
      universityName: row[index.university_name] ?? "",
      aos: row[index.aos] ?? "",
      category: row[index.category] ?? "",
      programCategory: row[index.program_category] ?? "",
      courseDuration: row[index.course_duration] ?? "",
      durationType: row[index.duration_type] ?? "",
      type: row[index.type] ?? "",
      degree: row[index.degree] ?? "",
      tuitionCost: row[index.tuition_cost] ?? "",
      url: row[index.url] ?? "",
      programSummary: row[index.program_summary] ?? "",
      programOverview: row[index.program_overview] ?? "",
      active: row[index.active] ?? "",
      countryId: row[index.country_id] ?? "1",
    }));

  return cachedPrograms;
}

function formatTuition(amount: number): string {
  if (!amount || amount <= 0) return "See program page";

  const lakhs = amount / 100000;
  if (lakhs >= 100) {
    return `₹${(amount / 10000000).toFixed(1)} Cr`;
  }

  return `₹${lakhs.toFixed(1)} Lakhs`;
}

function formatDuration(duration: string, durationType: string): string {
  if (!duration) return "Flexible";
  if (!durationType) return duration;
  return `${duration} ${durationType}`;
}

function formatAccreditation(type: string, degree: string): string {
  const label = degree?.trim() || type?.trim();
  return label || "Online Program";
}

function getDescription(summary: string, overview: string): string {
  const source = summary.trim() || overview.trim();
  if (!source) return "Explore this online program and see if it fits your goals.";

  const firstParagraph = source.split("\n").find((line) => line.trim())?.trim();
  if (!firstParagraph) return "Explore this online program and see if it fits your goals.";
  if (firstParagraph.length <= 160) return firstParagraph;

  return `${firstParagraph.slice(0, 157).trim()}...`;
}

function getLogoInitials(universityName: string): string {
  const words = universityName
    .split(/\s+/)
    .filter((word) => word.length > 2 && !/^(of|the|and|at|in)$/i.test(word));

  if (words.length === 0) return "OP";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function toCourse(program: OnlineProgramRow): Course {
  const tuition = Number(program.tuitionCost);

  return {
    id: program.id,
    courseName: program.name,
    university: program.universityName,
    country: COUNTRY_NAMES[program.countryId] ?? "Online",
    duration: formatDuration(program.courseDuration, program.durationType),
    accreditation: formatAccreditation(program.type, program.degree),
    totalFees: formatTuition(tuition),
    description: getDescription(program.programSummary, program.programOverview),
    applyUrl: program.url || "https://gradright.com",
    logoInitials: getLogoInitials(program.universityName),
    tags: [program.aos, program.category, program.programCategory]
      .filter(Boolean)
      .map((tag) => tag.toLowerCase()),
  };
}

export function getProgramsForArea(areaToExplore: string): Course[] {
  const normalizedArea = areaToExplore.trim();
  if (!normalizedArea) return [];

  const aosValues = AREA_TO_AOS_MAP[normalizedArea] ?? [normalizedArea];
  const aosSet = new Set(aosValues);

  return loadPrograms()
    .filter((program) => aosSet.has(program.aos))
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, MAX_RECOMMENDATIONS)
    .map((program) => toCourse(program));
}
