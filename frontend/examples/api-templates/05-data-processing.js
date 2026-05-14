/**
 * 📌 CONTOH 5: DATA PROCESSING & TRANSFORMATION
 * 
 * Use Case: JSON to CSV converter
 * Method: POST
 * 
 * Test:
 * POST /api/execute/v1/tool/json-to-csv
 * Body: { "data": [...], "delimiter": "," }
 */

export default {
  name: "jsonToCsv",
  category: "tool",
  path: "/v1/tool/json-to-csv",
  accept: "application/json",
  method: "POST",
  
  params: [
    {
      mode: "body",
      name: "data",
      type: "array",
      required: true,
      description: "Array of objects to convert to CSV"
    },
    {
      mode: "body",
      name: "delimiter",
      type: "string",
      default: ",",
      required: false,
      description: "CSV delimiter (default: comma)"
    },
    {
      mode: "body",
      name: "includeHeaders",
      type: "boolean",
      default: "true",
      required: false,
      description: "Include column headers (default: true)"
    }
  ],
  
  description: "Convert JSON array to CSV format with customizable delimiter",
  
  example: `
const axios = require('axios').default;

const options = {
  method: 'POST',
  url: 'http://yourapi.com/api/execute/v1/tool/json-to-csv',
  headers: {
    'Content-Type': 'application/json'
  },
  data: {
    data: [
      { name: 'John', age: 30, city: 'New York' },
      { name: 'Jane', age: 25, city: 'London' },
      { name: 'Bob', age: 35, city: 'Tokyo' }
    ],
    delimiter: ',',
    includeHeaders: true
  }
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
`,

  code: async ({ data, delimiter = ",", includeHeaders = true }) => {
    try {
      // Validate input
      if (!data || !Array.isArray(data)) {
        return {
          code: 400,
          status: false,
          message: "Invalid input",
          error: "data must be an array of objects"
        };
      }

      if (data.length === 0) {
        return {
          code: 400,
          status: false,
          message: "Empty data",
          error: "data array cannot be empty"
        };
      }

      // Get all unique keys from all objects
      const allKeys = new Set();
      data.forEach(obj => {
        if (typeof obj === 'object' && obj !== null) {
          Object.keys(obj).forEach(key => allKeys.add(key));
        }
      });

      const headers = Array.from(allKeys);

      // Helper function to escape CSV values
      const escapeCSV = (value) => {
        if (value === null || value === undefined) {
          return '';
        }
        
        const stringValue = String(value);
        
        // If value contains delimiter, quotes, or newlines, wrap in quotes
        if (stringValue.includes(delimiter) || 
            stringValue.includes('"') || 
            stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        
        return stringValue;
      };

      // Build CSV
      let csv = '';

      // Add headers
      if (includeHeaders) {
        csv += headers.map(escapeCSV).join(delimiter) + '\n';
      }

      // Add data rows
      data.forEach(obj => {
        const row = headers.map(header => {
          const value = obj[header];
          return escapeCSV(value);
        });
        csv += row.join(delimiter) + '\n';
      });

      // Calculate statistics
      const stats = {
        totalRows: data.length,
        totalColumns: headers.length,
        columns: headers,
        csvSize: Buffer.byteLength(csv, 'utf8'),
        csvSizeFormatted: (Buffer.byteLength(csv, 'utf8') / 1024).toFixed(2) + ' KB'
      };

      return {
        code: 200,
        status: true,
        message: "JSON converted to CSV successfully",
        data: {
          csv: csv,
          stats: stats,
          preview: csv.split('\n').slice(0, 5).join('\n') + '\n...',
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      return {
        code: 500,
        status: false,
        message: "Conversion failed",
        error: error.message
      };
    }
  }
};
