export const ageRangeOptions = [
  "3 mois",
  "6 mois",
  "9 mois",
  "12 mois",
  "2 ans",
  "3 ans",
  "4 ans",
  "5 ans",
  "6 ans",
  "7 ans",
  "8 ans",
  "9 ans",
  "10 ans",
  "11 ans",
  "12 ans",
] as const;

export type AgeRange = (typeof ageRangeOptions)[number];
