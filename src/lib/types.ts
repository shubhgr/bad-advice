export interface UserResponses {
  name: string;
  careerStage: string;
  bollywoodCharacter: string;
  superpower: string;
  weirdCombination: string;
  nextBigMove: string;
  whatsStoppingYou: string;
}

export interface Course {
  id: string;
  courseName: string;
  university: string;
  source: string;
  country: string;
  duration: string;
  accreditation: string;
  totalFees: string;
  description: string;
  applyUrl: string;
  logoInitials: string;
  tags: string[];
}

export const EMPTY_RESPONSES: UserResponses = {
  name: "",
  careerStage: "",
  bollywoodCharacter: "",
  superpower: "",
  weirdCombination: "",
  nextBigMove: "",
  whatsStoppingYou: "",
};
