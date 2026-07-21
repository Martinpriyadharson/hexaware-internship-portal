const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

// Initialize the Gemini AI client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in .env file.');
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Generates 30 MCQ questions dynamically for a given stack.
 * @param {string} stack - The name of the specialization track (e.g. "Java Full Stack")
 * @returns {Promise<Array>} - Resolves to an array of 30 question objects matching the Question schema
 */
const generateQuestionsForStack = async (stack) => {
  try {
    const genAI = getGeminiClient();
    
    // Define strict JSON Schema for structured MCQ array output
    const questionSchema = {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          questionText: { 
            type: SchemaType.STRING, 
            description: 'The technical question statement (e.g., code snippet, output prediction, syntax, error identification, debugging, or conceptual logic).' 
          },
          options: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: 'Exactly 4 plausible choices/options for the question.'
          },
          correctAnswer: { 
            type: SchemaType.INTEGER, 
            description: 'The index of the correct answer within the options array (0, 1, 2, or 3).' 
          }
        },
        required: ['questionText', 'options', 'correctAnswer']
      }
    };

    // Use gemini-3.5-flash as it is the active stable model in 2026
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: questionSchema
      }
    });

    const prompt = `Generate exactly 30 intermediate-to-advanced level, highly professional multiple-choice questions (MCQs) for a candidate applying for a "${stack}" Developer internship.
Ensure the questions cover deep technical aspects of the "${stack}" ecosystem (such as architecture, performance optimization, concurrency, security, design patterns, and edge cases).

Strict Formatting Rules to Prevent Repetitive Phrasing:
1. DO NOT start multiple questions with repetitive templates (e.g., DO NOT start questions with "What is...", "What is the role of...", "What is the function of...", or "Which of the following...").
2. Ensure every question is phrased uniquely.
3. Vary the question formats:
   - At least 40% of the questions must be code snippets where the candidate predicts output, identifies bugs, or chooses the correct implementation.
   - Include scenario-based systems design questions (e.g., choosing the correct database, caching strategy, or API design).
   - Include troubleshooting/debugging scenarios.
4. Each question must have exactly 4 unique, plausible options, with exactly one correct option (marked by 0-based index in correctAnswer).
5. DO NOT prefix the questionText with the stack name, category, or any bracketed tags (e.g., do NOT start with "[${stack}]" or similar). The questionText must start directly with the actual question wording.
6. Concept Uniqueness Rule: Each of the 30 questions must target a completely distinct technical topic, concept, API, or programming problem. DO NOT generate multiple questions testing the same code snippet, function, or specific concept with slightly changed answers or wording. Every question must be fully independent, distinct, and unique from the others.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the JSON array
    const questionsList = JSON.parse(responseText);

    if (!Array.isArray(questionsList) || questionsList.length === 0) {
      throw new Error('Invalid output format returned by Gemini API (not an array).');
    }

    // Map and sanitize the results to ensure they match our database Question model structure
    return questionsList.map(q => ({
      questionText: q.questionText,
      options: Array.isArray(q.options) ? q.options.slice(0, 4) : [],
      correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
      stack: stack
    }));

  } catch (error) {
    console.error(`Error generating questions via Gemini for stack "${stack}":`, error.message);
    throw error;
  }
};

module.exports = {
  generateQuestionsForStack
};
