export const slugToProgram = {
  dpharm: "D.Pharm",
  bpharm: "B.Pharm",
  pharmd: "Pharm.D",
} as const;

export const programToSlug = {
  "D.Pharm": "dpharm",
  "B.Pharm": "bpharm",
  "Pharm.D": "pharmd",
} as const;