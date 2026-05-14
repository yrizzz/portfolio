/**
 * 📌 CONTOH 2: API POST DENGAN BODY
 * 
 * Use Case: Calculator API untuk operasi matematika
 * Method: POST
 * Params: Body parameters (JSON)
 * 
 * Test:
 * POST /api/execute/v1/tool/calculator
 * Body: { "num1": 10, "num2": 5, "operation": "add" }
 */

export default {
  name: "calculator",
  category: "tool",
  path: "/v1/tool/calculator",
  accept: "application/json",
  method: "POST",
  
  // Parameter definition
  params: [
    {
      mode: "body",            // POST menggunakan body params
      name: "num1",
      type: "number",
      required: true,
      description: "Angka pertama"
    },
    {
      mode: "body",
      name: "num2",
      type: "number",
      required: true,
      description: "Angka kedua"
    },
    {
      mode: "body",
      name: "operation",
      type: "string",
      required: true,
      description: "Operasi: add, subtract, multiply, divide, power, modulo"
    }
  ],
  
  description: "Calculator API for basic mathematical operations",
  
  example: `
const axios = require('axios').default;

const options = {
  method: 'POST',
  url: 'http://yourapi.com/api/execute/v1/tool/calculator',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  data: {
    num1: 10,
    num2: 5,
    operation: 'add'
  }
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
`,

  code: async ({ num1, num2, operation }) => {
    try {
      // Validate required parameters
      if (num1 === undefined || num2 === undefined || !operation) {
        return {
          code: 400,
          status: false,
          message: "Missing required parameters",
          error: "num1, num2, and operation are required"
        };
      }

      // Convert to numbers
      const n1 = parseFloat(num1);
      const n2 = parseFloat(num2);

      // Validate numbers
      if (isNaN(n1) || isNaN(n2)) {
        return {
          code: 400,
          status: false,
          message: "Invalid input",
          error: "num1 and num2 must be valid numbers"
        };
      }

      // Perform calculation
      let result;
      let operationName;

      switch (operation.toLowerCase()) {
        case 'add':
        case '+':
          result = n1 + n2;
          operationName = 'Addition';
          break;
        
        case 'subtract':
        case '-':
          result = n1 - n2;
          operationName = 'Subtraction';
          break;
        
        case 'multiply':
        case '*':
          result = n1 * n2;
          operationName = 'Multiplication';
          break;
        
        case 'divide':
        case '/':
          if (n2 === 0) {
            return {
              code: 400,
              status: false,
              message: "Division by zero",
              error: "Cannot divide by zero"
            };
          }
          result = n1 / n2;
          operationName = 'Division';
          break;
        
        case 'power':
        case '**':
          result = Math.pow(n1, n2);
          operationName = 'Power';
          break;
        
        case 'modulo':
        case '%':
          result = n1 % n2;
          operationName = 'Modulo';
          break;
        
        default:
          return {
            code: 400,
            status: false,
            message: "Invalid operation",
            error: "Supported operations: add, subtract, multiply, divide, power, modulo"
          };
      }

      // Return success response
      return {
        code: 200,
        status: true,
        message: "Calculation successful",
        data: {
          operation: operationName,
          input: {
            num1: n1,
            num2: n2
          },
          result: result,
          formula: `${n1} ${operation} ${n2} = ${result}`,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      return {
        code: 500,
        status: false,
        message: "Internal server error",
        error: error.message
      };
    }
  }
};
