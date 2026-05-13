# API Management System

This directory contains auto-generated API code from the Admin Panel.

## Directory Structure

```
lib/api/
├── go/         # Go API implementations
├── php/        # PHP API implementations
├── nodejs/     # Node.js API implementations
└── README.md   # This file
```

## How to Use

1. **Create API Endpoint** in Admin Panel (`/admin/api-management`)
   - Fill in API name, method, path
   - Choose language (Go, PHP, or Node.js)
   - Set rate limiting and authentication requirements
   - Click "Create API"

2. **View Generated Code**
   - Click the code icon on any API endpoint
   - Copy the generated code
   - Save it to the appropriate directory:
     - Go: `lib/api/go/`
     - PHP: `lib/api/php/`
     - Node.js: `lib/api/nodejs/`

3. **Implement the API**
   - The generated code includes TODO comments
   - Follow the comments to implement your business logic
   - Connect to your database
   - Add validation and error handling

## Features

### Rate Limiting
Each API endpoint has a configurable rate limit (requests per minute).
The generated code includes comments on where to implement rate limiting middleware.

### Authentication
APIs can require authentication (API key).
When enabled, the generated code includes:
- API key validation logic
- Unauthorized response handling
- TODO comments for implementing your auth system

### Supported Methods
- GET - Retrieve data
- POST - Create new resources
- PUT - Update entire resources
- PATCH - Partial updates
- DELETE - Remove resources

### Supported Languages

#### Go
- Uses Gorilla Mux for routing
- JSON encoding/decoding
- Middleware support for auth and rate limiting

#### PHP
- Laravel-style syntax
- Request validation examples
- Database query examples

#### Node.js
- Express.js compatible
- Async/await pattern
- Error handling included

## Example Workflow

1. Create "Get Users" API:
   - Method: GET
   - Path: /api/users
   - Language: Node.js
   - Rate Limit: 100 req/min
   - Requires Auth: Yes

2. Copy generated code to `lib/api/nodejs/getUsers.js`

3. Implement database query:
   ```javascript
   const users = await db.collection('users').find().toArray();
   ```

4. Deploy and test your API

## Best Practices

- Always implement rate limiting in production
- Validate all input data
- Use environment variables for sensitive data
- Log API requests for monitoring
- Implement proper error handling
- Use HTTPS in production
- Keep API keys secure

## Support

For issues or questions, contact the admin or check the documentation.
