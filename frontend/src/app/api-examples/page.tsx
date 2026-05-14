import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'API Examples & Templates',
  description: 'Browse our collection of ready-to-use API templates and comprehensive documentation',
};

export default function ApiExamplesPage() {
  const templates = [
    {
      id: '01',
      name: 'Basic GET API',
      file: '01-basic-get.js',
      description: 'Simple greeting API with multi-language support',
      difficulty: '⭐',
      method: 'GET',
      useCase: 'Simple API with query parameters',
      features: ['Query params', 'Validation', 'i18n']
    },
    {
      id: '02',
      name: 'POST with Body',
      file: '02-post-with-body.js',
      description: 'Calculator API for mathematical operations',
      difficulty: '⭐',
      method: 'POST',
      useCase: 'API with JSON body',
      features: ['JSON body', 'Validation', 'Error handling']
    },
    {
      id: '03',
      name: 'External API Call',
      file: '03-external-api-call.js',
      description: 'Weather information from external API',
      difficulty: '⭐⭐',
      method: 'GET',
      useCase: 'External API integration',
      features: ['HTTP client', 'Timeout', 'Error types']
    },
    {
      id: '04',
      name: 'File Upload',
      file: '04-file-upload.js',
      description: 'Image resize with quality control',
      difficulty: '⭐⭐⭐',
      method: 'POST',
      useCase: 'File upload & processing',
      features: ['File validation', 'Image processing', 'Base64']
    },
    {
      id: '05',
      name: 'Data Processing',
      file: '05-data-processing.js',
      description: 'JSON to CSV converter',
      difficulty: '⭐⭐',
      method: 'POST',
      useCase: 'Data transformation',
      features: ['Data transform', 'CSV generation', 'Statistics']
    },
    {
      id: '06',
      name: 'AI Integration',
      file: '06-ai-integration.js',
      description: 'Text summarization using AI',
      difficulty: '⭐⭐',
      method: 'POST',
      useCase: 'AI-powered features',
      features: ['AI processing', 'Text analysis', 'Compression']
    },
    {
      id: '07',
      name: 'Web Scraping',
      file: '07-web-scraping.js',
      description: 'Website metadata extraction',
      difficulty: '⭐⭐⭐',
      method: 'GET',
      useCase: 'Web scraping',
      features: ['HTML parsing', 'Open Graph', 'Twitter cards']
    },
    {
      id: '08',
      name: 'QR Generator',
      file: '08-qr-generator.js',
      description: 'Generate QR code from text/URL',
      difficulty: '⭐⭐',
      method: 'POST',
      useCase: 'Image/QR generation',
      features: ['QR generation', 'Customization', 'Capacity calc']
    },
    {
      id: '09',
      name: 'Advanced Example',
      file: '09-advanced-example.js',
      description: 'URL shortener with analytics',
      difficulty: '⭐⭐⭐⭐',
      method: 'POST',
      useCase: 'Complete production example',
      features: ['Validation', 'Security', 'QR', 'Analytics']
    }
  ];

  const docs = [
    {
      name: 'START HERE',
      file: 'START_HERE.md',
      description: 'Entry point - choose your path',
      icon: '🚀'
    },
    {
      name: 'Quick Start',
      file: 'QUICKSTART.md',
      description: '5-minute quick start guide',
      icon: '⚡'
    },
    {
      name: 'Complete Documentation',
      file: 'README.md',
      description: 'Full API structure guide',
      icon: '📚'
    },
    {
      name: 'Template Generator',
      file: 'GENERATOR.md',
      description: 'Auto-generate templates',
      icon: '🎨'
    },
    {
      name: 'Master Index',
      file: 'INDEX.md',
      description: 'Complete navigation',
      icon: '🗺️'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            API Examples & Templates
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Ready-to-use templates and comprehensive documentation for building custom APIs
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="https://github.com/yourusername/yourrepo/tree/main/frontend/examples"
              target="_blank"
              className="px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              📦 View on GitHub
            </Link>
            <Link 
              href="/api-docs"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📖 API Documentation
            </Link>
            <Link 
              href="/admin/api-submit"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              ✨ Submit API
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-blue-600">9</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Templates</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-purple-600">7</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Docs</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-green-600">3000+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Lines</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
            <div className="text-3xl font-bold text-orange-600">150KB</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Size</div>
          </div>
        </div>

        {/* Documentation */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">📚 Documentation</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {docs.map((doc) => (
              <a
                key={doc.file}
                href={`https://github.com/yourusername/yourrepo/blob/main/frontend/examples/${doc.file}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
              >
                <div className="text-4xl mb-3">{doc.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{doc.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{doc.description}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Templates */}
        <section>
          <h2 className="text-3xl font-bold mb-6">🎨 Templates</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                        {template.id}
                      </span>
                      <h3 className="text-lg font-semibold">{template.name}</h3>
                    </div>
                    <span className="text-2xl">{template.difficulty}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {template.description}
                  </p>

                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 text-xs rounded ${
                      template.method === 'GET' 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    }`}>
                      {template.method}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {template.useCase}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <a
                    href={`https://github.com/yourusername/yourrepo/blob/main/frontend/examples/api-templates/${template.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    View Template →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Start */}
        <section className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">🚀 Quick Start</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Choose Template</h3>
              <code className="block bg-gray-900 text-gray-100 p-3 rounded text-sm">
                Browse templates above and pick one that matches your use case
              </code>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2. Copy & Customize</h3>
              <code className="block bg-gray-900 text-gray-100 p-3 rounded text-sm">
                Download template → Edit code → Test locally
              </code>
            </div>
            <div>
              <h3 className="font-semibold mb-2">3. Submit</h3>
              <code className="block bg-gray-900 text-gray-100 p-3 rounded text-sm">
                Login → API Management → Submit New API → Paste code
              </code>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-600 dark:text-gray-400">
          <p>Made with ❤️ for developers</p>
          <p className="text-sm mt-2">
            Need help? Check our{' '}
            <Link href="/api-docs" className="text-blue-600 hover:underline">
              documentation
            </Link>
            {' '}or{' '}
            <a 
              href="https://github.com/yourusername/yourrepo/issues" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              report an issue
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
