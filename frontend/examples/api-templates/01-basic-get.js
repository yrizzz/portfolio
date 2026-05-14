/**
 * 📌 CONTOH 1: API GET SEDERHANA
 * 
 * Use Case: Greeting API yang menerima nama dan bahasa
 * Method: GET
 * Params: Query parameters
 * 
 * Test:
 * GET /api/execute/v1/tool/greeting?name=John&language=en
 */

export default {
  name: "greeting",
  category: "tool",
  path: "/v1/tool/greeting",
  accept: "application/json",
  method: "GET",
  
  // Parameter definition
  params: [
    {
      mode: "query",           // GET menggunakan query params
      name: "name",
      type: "string",
      default: "Guest",
      required: false,
      description: "Nama yang akan disapa"
    },
    {
      mode: "query",
      name: "language",
      type: "string",
      default: "en",
      required: false,
      description: "Bahasa: en, id, es, fr"
    }
  ],
  
  description: "Simple greeting API that returns greeting message in different languages",
  
  // Example usage
  example: `
const axios = require('axios').default;

const options = {
  method: 'GET',
  url: 'http://yourapi.com/api/execute/v1/tool/greeting',
  params: { 
    name: 'John',
    language: 'en'
  },
  headers: {
    'Accept': 'application/json'
  }
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
`,

  // Main function
  code: async ({ name = "Guest", language = "en" }) => {
    try {
      // Greeting messages in different languages
      const greetings = {
        en: `Hello, ${name}! Welcome to our API.`,
        id: `Halo, ${name}! Selamat datang di API kami.`,
        es: `¡Hola, ${name}! Bienvenido a nuestra API.`,
        fr: `Bonjour, ${name}! Bienvenue sur notre API.`,
        ja: `こんにちは、${name}さん！APIへようこそ。`,
        ko: `안녕하세요, ${name}님! API에 오신 것을 환영합니다.`
      };

      // Validate language
      const validLanguages = Object.keys(greetings);
      if (!validLanguages.includes(language)) {
        return {
          code: 400,
          status: false,
          message: "Invalid language",
          error: `Supported languages: ${validLanguages.join(', ')}`
        };
      }

      // Return success response
      return {
        code: 200,
        status: true,
        message: "Success",
        data: {
          greeting: greetings[language],
          name: name,
          language: language,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      // Error handling
      return {
        code: 500,
        status: false,
        message: "Internal server error",
        error: error.message
      };
    }
  }
};
