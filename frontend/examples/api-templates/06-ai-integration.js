/**
 * 📌 CONTOH 6: AI INTEGRATION
 * 
 * Use Case: Text summarization using Google Gemini AI
 * Method: POST
 * 
 * Test:
 * POST /api/execute/v1/ai/text-summarize
 * Body: { "text": "long text...", "maxLength": 100 }
 */

export default {
  name: "textSummarize",
  category: "ai",
  path: "/v1/ai/text-summarize",
  accept: "application/json",
  method: "POST",
  
  params: [
    {
      mode: "body",
      name: "text",
      type: "string",
      required: true,
      description: "Text to summarize"
    },
    {
      mode: "body",
      name: "maxLength",
      type: "number",
      default: "150",
      required: false,
      description: "Maximum length of summary in words"
    },
    {
      mode: "body",
      name: "language",
      type: "string",
      default: "en",
      required: false,
      description: "Output language (en, id, es, fr, etc)"
    }
  ],
  
  description: "Summarize long text using AI with customizable length and language",
  
  example: `
const axios = require('axios').default;

const options = {
  method: 'POST',
  url: 'http://yourapi.com/api/execute/v1/ai/text-summarize',
  headers: {
    'Content-Type': 'application/json'
  },
  data: {
    text: 'Your long text here...',
    maxLength: 100,
    language: 'en'
  }
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
`,

  code: async ({ text, maxLength = 150, language = "en" }) => {
    try {
      // Validate input
      if (!text || text.trim().length === 0) {
        return {
          code: 400,
          status: false,
          message: "Text is required"
        };
      }

      // Check text length
      const wordCount = text.trim().split(/\s+/).length;
      if (wordCount < 50) {
        return {
          code: 400,
          status: false,
          message: "Text too short",
          error: "Text must be at least 50 words for meaningful summarization"
        };
      }

      // Note: This is a simplified example
      // In production, you would use actual AI API like Google Gemini
      // For this example, we'll use a simple extractive summarization

      // Simple extractive summarization (take first sentences)
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      
      let summary = '';
      let currentLength = 0;
      const targetLength = parseInt(maxLength);

      for (const sentence of sentences) {
        const sentenceWords = sentence.trim().split(/\s+/).length;
        if (currentLength + sentenceWords <= targetLength) {
          summary += sentence.trim() + ' ';
          currentLength += sentenceWords;
        } else {
          break;
        }
      }

      // If summary is empty, take first sentence
      if (summary.trim().length === 0) {
        summary = sentences[0];
      }

      // Calculate statistics
      const originalWords = wordCount;
      const summaryWords = summary.trim().split(/\s+/).length;
      const compressionRatio = ((1 - summaryWords / originalWords) * 100).toFixed(2);

      return {
        code: 200,
        status: true,
        message: "Text summarized successfully",
        data: {
          original: {
            text: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
            wordCount: originalWords,
            charCount: text.length
          },
          summary: {
            text: summary.trim(),
            wordCount: summaryWords,
            charCount: summary.trim().length,
            language: language
          },
          stats: {
            compressionRatio: compressionRatio + '%',
            wordsReduced: originalWords - summaryWords,
            targetLength: targetLength
          },
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      return {
        code: 500,
        status: false,
        message: "Summarization failed",
        error: error.message
      };
    }
  }
};
