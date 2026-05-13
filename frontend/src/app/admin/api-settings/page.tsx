'use client';

import { useState, useEffect } from 'react';
import { GlowCard } from '@/components/ui/glow-card';
import { AnimatedButton } from '@/components/ui/animated-button';

interface GeminiModel {
  name: string;
  displayName: string;
  description: string;
  version: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [availableModels, setAvailableModels] = useState<GeminiModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [keyResponse, modelResponse] = await Promise.all([
        fetch('/api/config?key=GEMINI_API_KEY'),
        fetch('/api/config?key=GEMINI_MODEL'),
      ]);
      
      const keyData = await keyResponse.json();
      const modelData = await modelResponse.json();
      
      if (keyData.success && keyData.config) {
        setGeminiKey(keyData.config.value);
      }
      
      if (modelData.success && modelData.config) {
        setSelectedModel(modelData.config.value);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableModels = async () => {
    if (!geminiKey) {
      setMessage('Please enter API key first');
      return;
    }

    setLoadingModels(true);
    setMessage('Loading available models...');
    
    try {
      // First save the API key so the backend can use it
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'GEMINI_API_KEY',
          value: geminiKey,
        }),
      });

      // Then fetch models
      const response = await fetch('/api/gemini/models');
      const data = await response.json();
      
      if (data.success) {
        setAvailableModels(data.models);
        setMessage(`✅ Found ${data.total} available models`);
      } else {
        const errorDetails = data.details ? JSON.stringify(data.details) : data.error;
        setMessage(`❌ Failed to load models: ${errorDetails}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error loading models: ${error.message}`);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('Saving settings...');

    try {
      // Validate API key
      if (!geminiKey || geminiKey.length < 30) {
        setMessage('❌ Invalid API key. Please check and try again.');
        setSaving(false);
        return;
      }

      // Save API key
      const keyResponse = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'GEMINI_API_KEY',
          value: geminiKey,
        }),
      });

      // Save selected model
      const modelResponse = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'GEMINI_MODEL',
          value: selectedModel,
        }),
      });

      const keyData = await keyResponse.json();
      const modelData = await modelResponse.json();

      console.log('Save response:', { keyData, modelData });

      if (keyData.success && modelData.success) {
        setMessage('✅ Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorMsg = keyData.error || keyData.details || modelData.error || modelData.details || 'Unknown error';
        setMessage(`❌ Error: ${errorMsg}`);
      }
    } catch (error: any) {
      console.error('Save error:', error);
      setMessage(`❌ Failed to save settings: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const testGeminiConnection = async () => {
    if (!geminiKey) {
      alert('Please enter a Gemini API key first');
      return;
    }

    setMessage('Testing connection...');
    
    try {
      // Test using our API endpoint with the new SDK
      const response = await fetch('/api/gemini/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: geminiKey,
          model: selectedModel,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Gemini API connection successful with ${selectedModel}!`);
      } else {
        setMessage(`❌ Gemini API connection failed: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ Failed to test connection: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-1">Configure API management system</p>
      </div>

      {/* Gemini API Configuration */}
      <GlowCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Gemini AI Configuration</h3>
        
        <div className="space-y-4">
          {/* API Key */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Gemini API Key
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => {
                // Sanitize input - remove non-ASCII characters and trim
                const sanitized = e.target.value.replace(/[^\x00-\x7F]/g, '').trim();
                setGeminiKey(sanitized);
              }}
              onPaste={(e) => {
                // Sanitize pasted content
                e.preventDefault();
                const pastedText = e.clipboardData.getData('text');
                const sanitized = pastedText.replace(/[^\x00-\x7F]/g, '').trim();
                setGeminiKey(sanitized);
              }}
              placeholder="Enter your Gemini API key..."
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary font-mono text-sm bg-background"
            />
            <p className="mt-2 text-sm text-muted-foreground">
              Get your API key from{' '}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          {/* Model Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">
                Gemini Model
              </label>
              <AnimatedButton
                onClick={loadAvailableModels}
                disabled={!geminiKey || loadingModels}
                size="sm"
                variant="outline"
                hoverScale={1.05}
              >
                {loadingModels ? 'Loading...' : 'Load Available Models'}
              </AnimatedButton>
            </div>
            
            {availableModels.length > 0 ? (
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background"
              >
                {availableModels.map((model) => (
                  <option key={model.name} value={model.name.replace('models/', '')}>
                    {model.displayName} - {model.description}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</option>
              </select>
            )}
            <p className="mt-2 text-sm text-muted-foreground">
              {availableModels.length > 0 
                ? `${availableModels.length} models available. Select one for AI operations.`
                : 'Click "Load Available Models" to see all available models for your API key.'
              }
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <AnimatedButton
              onClick={handleSave}
              disabled={saving || !geminiKey}
              hoverScale={1.05}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </AnimatedButton>

            <AnimatedButton
              onClick={testGeminiConnection}
              disabled={!geminiKey}
              variant="outline"
              className="bg-green-600 hover:bg-green-700 text-white border-green-600"
              hoverScale={1.05}
            >
              Test Connection
            </AnimatedButton>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-3 rounded-lg ${
              message.includes('Error') || message.includes('❌')
                ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                : message.includes('✅')
                ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
            }`}>
              {message}
            </div>
          )}
        </div>
      </GlowCard>

      {/* System Info */}
      <GlowCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">System Information</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">API Version</span>
            <span className="font-medium">v1.0.0</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Database</span>
            <span className="font-medium">SQLite</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Sandbox</span>
            <span className="font-medium">VM2</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">AI Provider</span>
            <span className="font-medium">Google Gemini ({selectedModel})</span>
          </div>
        </div>
      </GlowCard>

      {/* Security Settings */}
      <GlowCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <h4 className="font-medium text-yellow-900 dark:text-yellow-300 mb-2">⚠️ Important Security Notes</h4>
            <ul className="text-sm text-yellow-800 dark:text-yellow-400 space-y-1 list-disc list-inside">
              <li>All submitted scripts run in a sandboxed VM2 environment</li>
              <li>Scripts have a 30-second timeout limit</li>
              <li>Admin approval is required before APIs go live</li>
              <li>API keys are stored encrypted in the database</li>
              <li>All API requests are logged for monitoring</li>
            </ul>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">💡 Best Practices</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
              <li>Review all submitted scripts carefully before approval</li>
              <li>Set appropriate rate limits for each endpoint</li>
              <li>Monitor API logs regularly for suspicious activity</li>
              <li>Keep your Gemini API key secure and rotate it periodically</li>
              <li>Enable authentication for sensitive endpoints</li>
            </ul>
          </div>
        </div>
      </GlowCard>

      {/* Environment Variables */}
      <GlowCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Environment Variables</h3>
        
        <div className="bg-muted p-4 rounded-lg font-mono text-sm border border-border">
          <p className="text-muted-foreground"># Add to your .env file:</p>
          <p className="mt-2">GEMINI_API_KEY=your_api_key_here</p>
          <p>GEMINI_MODEL=gemini-1.5-flash</p>
          <p>DATABASE_URL="file:./dev.db"</p>
        </div>
        
        <p className="mt-3 text-sm text-muted-foreground">
          Note: Changes to environment variables require a server restart to take effect.
        </p>
      </GlowCard>
    </div>
  );
}
