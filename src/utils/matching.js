/**
 * Skill Mitra matching logic
 *
 * PRD:
 * - Must-have = weight 2
 * - Nice-to-have = weight 1
 * - Coverage = min(student level / minimum level, 1)
 * - Match % = sum(weight × coverage) / sum(weight) × 100
 * - If any must-have is below minimum, cap match at 60%
 */

export function calculateMatch(studentSkills, requirements) {
    let weightedCoverage = 0;
    let totalWeight = 0;
    let missingMustHave = false;
  
    const explanation = [];
  
    requirements.forEach((requirement) => {
      const studentLevel = studentSkills[requirement.skill] ?? 0;
  
      const weight =
        requirement.importance === "must-have" ? 2 : 1;
  
      const coverage = Math.min(
        studentLevel / requirement.minimum,
        1
      );
  
      weightedCoverage += weight * coverage;
      totalWeight += weight;
  
      let status;
  
      if (studentLevel >= requirement.minimum) {
        status = "Met";
      } else if (studentLevel > 0) {
        status = "Partly met";
      } else {
        status = "Missing";
      }
  
      if (
        requirement.importance === "must-have" &&
        studentLevel < requirement.minimum
      ) {
        missingMustHave = true;
      }
  
      explanation.push({
        skill: requirement.skill,
        required: requirement.minimum,
        actual: studentLevel,
        importance: requirement.importance,
        status,
      });
    });
  
    let matchPercentage =
      totalWeight === 0
        ? 0
        : (weightedCoverage / totalWeight) * 100;
  
    // PRD: missing must-have caps the match at 60%.
    if (missingMustHave) {
      matchPercentage = Math.min(matchPercentage, 60);
    }
  
    return {
      percentage: Math.round(matchPercentage),
      missingMustHave,
      explanation,
    };
  }
  
  export function calculateReadiness(studentSkills, role) {
    return calculateMatch(
      studentSkills,
      role.requiredSkills
    );
  }