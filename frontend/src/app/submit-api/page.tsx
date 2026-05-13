'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SubmitAPIPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [rawScript, setRawScript] = useState('');
  const [language, setLanguage] = useState('nodejs');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/endpoints/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rawScript,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit script');
      }

      setResult(data);
      setRawScript(''); // Clear form on success
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please sign in to submit API scripts</p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-2">Submit API Script</h1>
          <p className="text-gray-600 mb-8">
            Paste your API script below. Our AI will analyze it and prepare it for review.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Programming Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="nodejs">Node.js / JavaScript</option>
                <option value="php">PHP</option>
                <option value="go">Go</option>
                <option value="python">Python</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Script
              </label>
              <textarea
                value={rawScript}
                onChange={(e) => setRawScript(e.target.value)}
                placeholder="Paste your API script here..."
                rows={20}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Example: Export a default object with name, path, method, and code function
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {result && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                <p className="font-medium mb-2">✓ Script Submitted Successfully!</p>
                <p className="text-sm mb-3">{result.message}</p>
                
                {result.endpoint?.aiAnalysis && (
                  <div className="mt-4 bg-white p-4 rounded border border-green-300">
                    <h3 className="font-semibold mb-2">AI Analysis:</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {result.endpoint.aiAnalysis.name}</p>
                      <p><strong>Description:</strong> {result.endpoint.aiAnalysis.description}</p>
                      <p><strong>Method:</strong> {result.endpoint.aiAnalysis.method}</p>
                      <p><strong>Path:</strong> {result.endpoint.aiAnalysis.path}</p>
                      
                      {result.endpoint.aiAnalysis.security_concerns && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="font-semibold text-yellow-800">Security Concerns:</p>
                          <p className="text-yellow-700">{result.endpoint.aiAnalysis.security_concerns}</p>
                        </div>
                      )}
                      
                      {result.endpoint.aiAnalysis.suggestions && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="font-semibold text-blue-800">Suggestions:</p>
                          <p className="text-blue-700">{result.endpoint.aiAnalysis.suggestions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => router.push('/admin/api-review')}
                  className="mt-4 text-sm text-green-700 hover:text-green-800 underline"
                >
                  View in Admin Panel →
                </button>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || !rawScript}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Analyzing with AI...' : 'Submit Script'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setRawScript('');
                  setError('');
                  setResult(null);
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Clear
              </button>
            </div>
          </form>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>Paste your API script in the textarea above</li>
              <li>Our AI (Gemini) will analyze and adapt your script</li>
              <li>The script will be submitted for admin review</li>
              <li>Once approved, your API will be live and accessible</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
