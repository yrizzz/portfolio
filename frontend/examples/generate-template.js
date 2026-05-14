#!/usr/bin/env node

/**
 * 🎨 API Template Generator
 * 
 * Interactive CLI tool to generate API templates
 * 
 * Usage:
 *   node generate-template.js
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Template generator
async function generateTemplate() {
  console.log('\n🎨 API Template Generator\n');
  console.log('Answer the following questions to generate your API template:\n');

  // Collect information
  const name = await question('1. API Name (e.g., myapi): ');
  const category = await question('2. Category (tool/ai/data/socialmedia/downloader/game/random): ');
  const method = await question('3. HTTP Method (GET/POST/PUT/DELETE/PATCH): ');
  const description = await question('4. Description: ');
  
  // Generate path
  const path_endpoint = `/v1/${category}/${name}`;
  
  // Ask for parameters
  console.log('\n5. Parameters (press Enter to skip):');
  const params = [];
  let addMore = true;
  let paramIndex = 1;
  
  while (addMore) {
    const paramName = await question(`   Param ${paramIndex} name (or press Enter to finish): `);
    
    if (!paramName.trim()) {
      addMore = false;
      break;
    }
    
    const paramType = await question(`   Param ${paramIndex} type (string/number/boolean/file): `);
    const paramRequired = await question(`   Param ${paramIndex} required? (y/n): `);
    const paramDesc = await question(`   Param ${paramIndex} description: `);
    
    const mode = method.toUpperCase() === 'GET' ? 'query' : 'body';
    
    params.push({
      mode,
      name: paramName,
      type: paramType || 'string',
      required: paramRequired.toLowerCase() === 'y',
      description: paramDesc
    });
    
    paramIndex++;
  }

  // Ask for features
  console.log('\n6. Features:');
  const useExternalAPI = await question('   Use external API? (y/n): ');
  const useFileUpload = await question('   Handle file upload? (y/n): ');
  const useAI = await question('   Use AI integration? (y/n): ');

  // Generate code
  const template = generateCode({
    name,
    category,
    method: method.toUpperCase(),
    path: path_endpoint,
    description,
    params,
    useExternalAPI: useExternalAPI.toLowerCase() === 'y',
    useFileUpload: useFileUpload.toLowerCase() === 'y',
    useAI: useAI.toLowerCase() === 'y'
  });

  // Save to file
  const outputDir = path.join(__dirname, 'generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputFile = path.join(outputDir, `${name}.js`);
  fs.writeFileSync(outputFile, template);

  console.log(`\n✅ Template generated successfully!`);
  console.log(`📁 File saved to: ${outputFile}`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Review and customize the generated code`);
  console.log(`   2. Test locally`);
  console.log(`   3. Upload via admin panel`);
  console.log(`\n🚀 Happy coding!\n`);

  rl.close();
}

// Code generator function
function generateCode(config) {
  const {
    name,
    category,
    method,
    path,
    description,
    params,
    useExternalAPI,
    useFileUpload,
    useAI
  } = config;

  // Generate params array
  const paramsCode = params.map(p => `    {
      mode: "${p.mode}",
      name: "${p.name}",
      type: "${p.type}",
      required: ${p.required},
      description: "${p.description}"
    }`).join(',\n');

  // Generate function parameters
  const funcParams = params.map(p => p.name).join(', ');
  const funcParamsWithDefaults = params.map(p => {
    if (!p.required) {
      return `${p.name} = ${p.type === 'number' ? '0' : p.type === 'boolean' ? 'false' : '""'}`;
    }
    return p.name;
  }).join(', ');

  // Generate validation code
  const validationCode = params
    .filter(p => p.required)
    .map(p => `      if (!${p.name}) {
        return {
          code: 400,
          status: false,
          message: "Missing required parameter: ${p.name}"
        };
      }`)
    .join('\n\n');

  // Generate logic based on features
  let logicCode = '';
  
  if (useExternalAPI) {
    logicCode = `      const axios = require('axios');
      
      // Make external API call
      const response = await axios.get('https://api.example.com/endpoint', {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      // Process response
      const data = response.data;`;
  } else if (useFileUpload) {
    logicCode = `      // Validate file
      if (!file || !file.tempPath) {
        return {
          code: 400,
          status: false,
          message: "File is required"
        };
      }

      const fs = require('fs');
      const sharp = require('sharp');
      
      // Read and process file
      const fileBuffer = fs.readFileSync(file.tempPath);
      const processedBuffer = await sharp(fileBuffer)
        .resize(800, 600)
        .toBuffer();
      
      const base64 = processedBuffer.toString('base64');`;
  } else if (useAI) {
    logicCode = `      // Note: Replace with actual AI API integration
      // Example: Google Gemini, OpenAI, etc.
      
      // Simple text processing example
      const processedText = ${funcParams}.toUpperCase();`;
  } else {
    logicCode = `      // TODO: Implement your logic here
      
      // Example: Process input parameters
      const result = {
        input: { ${funcParams} },
        processed: true
      };`;
  }

  // Generate return data
  let returnData = '';
  if (useExternalAPI) {
    returnData = `data: data`;
  } else if (useFileUpload) {
    returnData = `data: {
            file: {
              name: file.originalName,
              size: file.size,
              processed: true
            },
            image: \`data:image/jpeg;base64,\${base64}\`
          }`;
  } else if (useAI) {
    returnData = `data: {
            original: ${funcParams},
            processed: processedText
          }`;
  } else {
    returnData = `data: result`;
  }

  // Generate example code
  const exampleMethod = method === 'GET' ? 'GET' : 'POST';
  const exampleParams = method === 'GET' 
    ? `params: { ${params.map(p => `${p.name}: 'value'`).join(', ')} }`
    : `data: { ${params.map(p => `${p.name}: 'value'`).join(', ')} }`;

  return `/**
 * 📌 ${name.toUpperCase()} API
 * 
 * ${description}
 * 
 * Generated by API Template Generator
 * Date: ${new Date().toISOString()}
 */

export default {
  name: "${name}",
  category: "${category}",
  path: "${path}",
  accept: "${useFileUpload ? 'multipart/form-data' : 'application/json'}",
  method: "${method}",
  
  params: [
${paramsCode}
  ],
  
  description: "${description}",
  
  example: \`
const axios = require('axios').default;

const options = {
  method: '${exampleMethod}',
  url: 'http://yourapi.com/api/execute${path}',
  headers: {
    'Content-Type': 'application/json'
  },
  ${exampleParams}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}
\`,

  code: async ({ ${funcParamsWithDefaults} }) => {
    try {
      // ============================================
      // 1. INPUT VALIDATION
      // ============================================
      
${validationCode}

      // ============================================
      // 2. MAIN LOGIC
      // ============================================
      
${logicCode}

      // ============================================
      // 3. RETURN RESPONSE
      // ============================================
      
      return {
        code: 200,
        status: true,
        message: "Success",
        ${returnData},
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      // ============================================
      // 4. ERROR HANDLING
      // ============================================
      
      console.error('${name} error:', error);
      
      return {
        code: 500,
        status: false,
        message: "Internal server error",
        error: error.message
      };
    }
  }
};
`;
}

// Run generator
generateTemplate().catch(error => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});
