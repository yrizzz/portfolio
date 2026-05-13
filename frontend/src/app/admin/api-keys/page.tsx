'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { GlowCard } from '@/components/ui/GlowCard';

interface ApiKey {
  id: string;
  key: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
  _count: {
    requests: number;
  };
}

export default function ApiKeysPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeyName, setNewKeyName] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchApiKeys();
    }
  }, [status, router]);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/api-keys');
      const data = await response.json();
      
      if (response.ok) {
        setApiKeys(data.apiKeys);
      } else {
        console.error('Failed to fetch API keys:', data.error);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      alert('Please enter a name for the API key');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setNewKeyValue(data.apiKey.key);
        setShowNewKey(true);
        setNewKeyName('');
        fetchApiKeys();
      } else {
        alert(data.error || 'Failed to create API key');
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      alert('Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const toggleApiKey = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/api-keys/toggle', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus })
      });

      const data = await response.json();

      if (response.ok) {
        fetchApiKeys();
      } else {
        alert(data.error || 'Failed to toggle API key');
      }
    } catch (error) {
      console.error('Error toggling API key:', error);
      alert('Failed to toggle API key');
    }
  };

  const deleteApiKey = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/api-keys?id=${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        fetchApiKeys();
      } else {
        alert(data.error || 'Failed to delete API key');
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      alert('Failed to delete API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 12) return key;
    return `${key.substring(0, 12)}...${key.substring(key.length - 4)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-white text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">API Keys</h1>
          <p className="text-gray-300">Manage your API keys for accessing protected endpoints</p>
        </div>

        {/* New Key Modal */}
        {showNewKey && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <GlowCard className="max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold text-white mb-4">API Key Created Successfully!</h2>
              <div className="bg-yellow-900/30 border border-yellow-500 rounded-lg p-4 mb-4">
                <p className="text-yellow-200 text-sm mb-2">
                  ⚠️ Please save this API key securely. You won't be able to see it again!
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <code className="text-green-400 text-sm break-all">{newKeyValue}</code>
                  <button
                    onClick={() => copyToClipboard(newKeyValue)}
                    className="ml-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm whitespace-nowrap"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowNewKey(false);
                  setNewKeyValue('');
                }}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Close
              </button>
            </GlowCard>
          </div>
        )}

        {/* Create New Key */}
        <GlowCard className="p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Create New API Key</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Enter key name (e.g., Production App)"
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              disabled={creating}
            />
            <button
              onClick={createApiKey}
              disabled={creating || !newKeyName.trim()}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium"
            >
              {creating ? 'Creating...' : 'Create Key'}
            </button>
          </div>
        </GlowCard>

        {/* API Keys List */}
        <div className="space-y-4">
          {apiKeys.length === 0 ? (
            <GlowCard className="p-8 text-center">
              <p className="text-gray-400">No API keys yet. Create one to get started!</p>
            </GlowCard>
          ) : (
            apiKeys.map((key) => (
              <GlowCard key={key.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{key.name}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          key.isActive
                            ? 'bg-green-900/30 text-green-400 border border-green-500'
                            : 'bg-red-900/30 text-red-400 border border-red-500'
                        }`}
                      >
                        {key.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-3 mb-3 flex items-center justify-between">
                      <code className="text-gray-400 text-sm">{maskApiKey(key.key)}</code>
                      <button
                        onClick={() => copyToClipboard(key.key)}
                        className="ml-4 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
                      >
                        Copy
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Created</p>
                        <p className="text-white">{new Date(key.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Used</p>
                        <p className="text-white">
                          {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Requests</p>
                        <p className="text-white">{key._count.requests.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => toggleApiKey(key.id, key.isActive)}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        key.isActive
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {key.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => deleteApiKey(key.id, key.name)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </GlowCard>
            ))
          )}
        </div>

        {/* Usage Instructions */}
        <GlowCard className="p-6 mt-6">
          <h2 className="text-xl font-bold text-white mb-4">How to Use API Keys</h2>
          <div className="space-y-3 text-gray-300">
            <p>Include your API key in the Authorization header of your requests:</p>
            <div className="bg-gray-800 rounded-lg p-4">
              <code className="text-green-400 text-sm">
                Authorization: Bearer pk_your_api_key_here
              </code>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              Example using cURL:
            </p>
            <div className="bg-gray-800 rounded-lg p-4">
              <code className="text-green-400 text-sm block">
                curl -H "Authorization: Bearer pk_your_api_key_here" \<br />
                &nbsp;&nbsp;https://yourdomain.com/api/execute/v1/tool/example
              </code>
            </div>
          </div>
        </GlowCard>
      </div>
    </div>
  );
}
