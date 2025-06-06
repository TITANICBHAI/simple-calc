
/**
 * @fileOverview A Genkit flow for generating math quiz questions.
 * This version uses a static list of questions.
 *
 * - generateMathQuestion - A function that generates a math question based on age.
 * - MathQuestionInput - The input type for the generateMathQuestion function.
 * - MathQuestionOutput - The return type for the generateMathQuestion function.
 */

import { z } from 'zod'; // Import Zod directly
import { mathQuizQuestions } from './math-quiz-questions'; // Import static questions

// Define a schema for the input of the math question generation
const MathQuestionInputSchema = z.object({
  age: z.number().int().min(1).max(120).describe('The age of the user for whom to generate the question.'),
});
export type MathQuestionInput = z.infer<typeof MathQuestionInputSchema>;

// Define a schema for the output of the math question generation
const MathQuestionOutputSchema = z.object({
  questionText: z.string().describe('The math question generated for the user.'),
  correctAnswer: z.string().describe('The correct answer to the generated question. Should be a numerical string or simple fraction if applicable.'),
  difficultyLevel: z.string().optional().describe('A brief description of the question type or difficulty (e.g., "Simple Addition", "Two-digit Multiplication", "Basic Algebra").'),
});
export type MathQuestionOutput = z.infer<typeof MathQuestionOutputSchema>;

// This age group map is used to provide a textual description of difficulty.
// The actual question selection logic uses the keys from mathQuizQuestions.
const ageGroupMap: Record<string, { min: number; max: number; description: string }> = {
  'age1-2': { min: 1, max: 2, description: 'Number Recognition / Basic Counting' },
  'age3-4': { min: 3, max: 4, description: 'Simple Addition/Subtraction (1-5)' },
  'age5-6': { min: 5, max: 6, description: 'Addition/Subtraction (1-10)' },
  'age7-8': { min: 7, max: 8, description: 'Arithmetic up to 100, Intro Multiplication/Division' },
  'age9-10': { min: 9, max: 10, description: 'Multi-digit Arithmetic, Simple Fractions' },
  'age11-12': { min: 11, max: 12, description: 'Fractions, Decimals, Percentages' },
  'age13-14': { min: 13, max: 14, description: 'Intro to Algebra, Basic Geometry' },
  'age15-16': { min: 15, max: 16, description: 'Algebra, Geometry, Basic Trigonometry' },
  'age17-18': { min: 17, max: 18, description: 'Pre-calculus Concepts' },
  'age19-25': { min: 19, max: 25, description: 'College-level General Math/Puzzles' },
  'age25+': { min: 26, max: 29, description: 'Practical Math / Financial Puzzles / JEE Main Intro' }, 
  'age30-49': { min: 30, max: 49, description: 'JEE Main / Simpler JEE Advanced Level' },
  'age50-74': { min: 50, max: 74, description: 'JEE Advanced / IIT Conceptual Level' },
  'age75+': { min: 75, max: 120, description: 'Highly Advanced / Philosophical / Famous Problems' },
};

// Function to map age to the question bank keys
function getAgeGroupKey(age: number): keyof typeof mathQuizQuestions {
  if (age <= 2) return 'age1-2';
  if (age <= 4) return 'age3-4';
  if (age <= 6) return 'age5-6';
  if (age <= 8) return 'age7-8';
  if (age <= 10) return 'age9-10';
  if (age <= 12) return 'age11-12';
  if (age <= 14) return 'age13-14';
  if (age <= 16) return 'age15-16';
  if (age <= 18) return 'age17-18';
  if (age <= 25) return 'age19-25';
  if (age <= 29) return 'age25+'; // Matches the key in mathQuizQuestions
  if (age <= 49) return 'age30-49';
  if (age <= 74) return 'age50-74';
  return 'age75+';
}

// Exported function to be called by client components.
// This function directly uses the static question bank.
export async function generateMathQuestion(input: MathQuestionInput): Promise<MathQuestionOutput> {
  const age = input.age;
  const ageGroupKey = getAgeGroupKey(age);
  const questionsForAgeGroup = mathQuizQuestions[ageGroupKey];

  if (!questionsForAgeGroup || questionsForAgeGroup.length === 0) {
    // Fallback if no questions for age group (should ideally not happen with current setup)
    return {
      questionText: "What is 1 + 1?",
      correctAnswer: "2",
      difficultyLevel: "Basic Arithmetic (Fallback)"
    };
  }

  const randomIndex = Math.floor(Math.random() * questionsForAgeGroup.length);
  const selectedQuestion = questionsForAgeGroup[randomIndex];

  // Get the textual description for the difficulty level
  const difficultyDescription = Object.values(ageGroupMap).find(group => {
      // This logic tries to find the matching description from ageGroupMap based on the derived ageGroupKey
      const mapKeyForThisGroup = Object.keys(ageGroupMap).find(k => ageGroupMap[k as keyof typeof ageGroupMap].min <= age && ageGroupMap[k as keyof typeof ageGroupMap].max >= age);
      return mapKeyForThisGroup === ageGroupKey || (ageGroupKey === 'age25+' && mapKeyForThisGroup && ageGroupMap[mapKeyForThisGroup as keyof typeof ageGroupMap].description.includes("JEE Main Intro"));
  })?.description || "Challenging Math";


  return {
    questionText: selectedQuestion.question,
    correctAnswer: String(selectedQuestion.answer), // Ensure answer is a string
    difficultyLevel: difficultyDescription,
  };
}

// --- AI-Powered Logic (Commented out for static export compatibility) ---
// import { ai } from '@/ai/genkit';
// const mathQuestionPrompt = ai.definePrompt({
//   name: 'mathQuestionPrompt',
//   inputSchema: MathQuestionInputSchema,
//   outputSchema: MathQuestionOutputSchema,
//   prompt: (input) => `
//     Generate a single, age-appropriate math question for a ${input.age}-year-old.
//     The question should be challenging but solvable for that age.
//     Also provide the correct answer. The answer should be a simple numerical string or fraction.
//     Include a brief description of the question type or difficulty (e.g., "Simple Addition", "Two-digit Multiplication", "Basic Algebra").
//     Consider the following general age guidelines for complexity:
//     - 1-2 years: Basic number recognition, counting small objects.
//     - 3-4 years: Simple addition/subtraction (1-5).
//     - 5-6 years: Addition/subtraction (1-10), simple patterns.
//     - 7-8 years: Addition/subtraction (1-100), intro to multiplication/division (single digit).
//     - 9-10 years: Multi-digit arithmetic, simple fractions, word problems.
//     - 11-12 years: Fractions, decimals, percentages, basic geometry concepts.
//     - 13-14 years: Intro to algebra (simple equations), order of operations, basic geometry.
//     - 15-16 years: Algebra (linear/quadratic equations), geometry, basic trigonometry.
//     - 17-18 years: Pre-calculus concepts, advanced algebra, trigonometry.
//     - 19-25 years: College-level general math, logic puzzles, applied math.
//     - 26-29 years: Practical math, financial puzzles, introductory JEE Main level concepts.
//     - 30-49 years: JEE Main / Simpler JEE Advanced level problems (algebra, calculus, coordinate geometry basics).
//     - 50-74 years: JEE Advanced / IIT Conceptual Level (more complex problems, physics-based math, advanced concepts).
//     - 75+ years: Highly Advanced / Philosophical / Famous Math Problems (conceptual, historical, or deeply theoretical).
//     Ensure the question text is engaging and the answer is clear.
//   `,
// });

// const mathQuestionFlow = ai.defineFlow(
//   {
//     name: 'mathQuestionFlow',
//     inputSchema: MathQuestionInputSchema,
//     outputSchema: MathQuestionOutputSchema,
//   },
//   async (input) => {
//     const { output } = await mathQuestionPrompt(input);
//     if (!output) {
//       throw new Error('Failed to generate math question. No output from prompt.');
//     }
//     return output;
//   }
// );

// // For AI version, the exported function would be:
// // export async function generateMathQuestion(input: MathQuestionInput): Promise<MathQuestionOutput> {
// //   return mathQuestionFlow(input);
// // }
