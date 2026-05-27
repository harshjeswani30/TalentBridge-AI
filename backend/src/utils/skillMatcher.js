/**
 * Calculates the skill match percentage between a student's skills
 * and a job's required skills.
 *
 * @param {string[]} studentSkills  - Array of student skill names (lowercase)
 * @param {string[]} requiredSkills - Array of required skill names for the job (lowercase)
 * @returns {{ percentage: number, matchedSkills: string[], missingSkills: string[] }}
 */
const calculateMatch = (studentSkills = [], requiredSkills = []) => {
  if (!requiredSkills || requiredSkills.length === 0) {
    return {
      percentage: 100,
      matchedSkills: [],
      missingSkills: [],
    };
  }

  if (!studentSkills || studentSkills.length === 0) {
    return {
      percentage: 0,
      matchedSkills: [],
      missingSkills: [...requiredSkills],
    };
  }

  const normalizedStudentSkills = studentSkills.map((s) => s.toLowerCase().trim());
  const normalizedRequired = requiredSkills.map((s) => s.toLowerCase().trim());

  const matchedSkills = normalizedRequired.filter((skill) =>
    normalizedStudentSkills.includes(skill)
  );

  const missingSkills = normalizedRequired.filter(
    (skill) => !normalizedStudentSkills.includes(skill)
  );

  const percentage = Math.round((matchedSkills.length / normalizedRequired.length) * 100);

  return {
    percentage,
    matchedSkills,
    missingSkills,
  };
};

module.exports = { calculateMatch };
