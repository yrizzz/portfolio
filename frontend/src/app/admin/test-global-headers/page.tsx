'use client';

import { useState } from 'react';
import { AnimatedButton } from '@/components/ui/animated-button';
import { GlowCard } from '@/components/ui/glow-card';
import { CheckCircle2, XCircle, ExternalLink, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function TestGlobalHeadersPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(prev => ({ ...prev, [testName]: true }));
    try {
      const result = await testFn();
      setResults((prev: any) => ({ ...prev, [testName]: result }));
    } catch (error: any) {
      setResults((prev: any) => ({ ...prev, [testName]: { error: error.message } }));
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(null), 2000);
  };

  const renderValue = (value: any, depth: number = 0): JSX.Element => {
    if (value === null) {
      return <span className="text-gray-500">null</span>;
    }
    
    if (value === undefined) {
      return <span className="text-gray-500">undefined</span>;
    }
    
    if (typeof value === 'boolean') {
      return <span className={value ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{String(value)}</span>;
    }
    
    if (typeof value === 'number') {
      return <span className="text-blue-600 dark:text-blue-400">{value}</span>;
    }
    
    if (typeof value === 'string') {
      // Check if it's a URL
      if (value.match(/^https?:\/\//)) {
        return (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            {value}
            <ExternalLink className="h-3 w-3" />
          </a>
        );
      }
      
      // Check if it's an email
      if (value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return (
          <a 
            href={`mailto:${value}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {value}
          </a>
        );
      }
      
      // Long strings (like cookies) - truncate with expand
      if (value.length > 100 && depth > 0) {
        return (
          <details className="inline">
            <summary className="cursor-pointer text-orange-600 dark:text-orange-400 hover:underline">
              "{value.substring(0, 50)}..." (click to expand)
            </summary>
            <div className="mt-1 ml-4 text-orange-600 dark:text-orange-400 break-all">
              "{value}"
            </div>
          </details>
        );
      }
      
      return <span className="text-orange-600 dark:text-orange-400">"{value}"</span>;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-500">[]</span>;
      }
      
      return (
        <div className="ml-4">
          <span className="text-gray-500">[</span>
          {value.map((item, index) => (
            <div key={index} className="ml-4">
              {renderValue(item, depth + 1)}
              {index < value.length - 1 && <span className="text-gray-500">,</span>}
            </div>
          ))}
          <span className="text-gray-500">]</span>
        </div>
      );
    }
    
    if (typeof value === 'object') {
      const entries = Object.entries(value);
      if (entries.length === 0) {
        return <span className="text-gray-500">{'{}'}</span>;
      }
      
      return (
        <div className="ml-4">
          <span className="text-gray-500">{'{'}</span>
          {entries.map(([key, val], index) => (
            <div key={key} className="ml-4">
              <span className="text-purple-600 dark:text-purple-400">"{key}"</span>
              <span className="text-gray-500">: </span>
              {renderValue(val, depth + 1)}
              {index < entries.length - 1 && <span className="text-gray-500">,</span>}
            </div>
          ))}
          <span className="text-gray-500">{'}'}</span>
        </div>
      );
    }
    
    return <span>{String(value)}</span>;
  };

  const getTestStatus = (testName: string) => {
    const result = results[testName];
    if (!result) return null;
    
    if (result.error) return 'error';
    
    if (testName === 'session') {
      return result.user ? 'success' : 'error';
    }
    
    if (testName === 'globalHeaders') {
      return result.success && result.headers?.length > 0 ? 'success' : 'error';
    }
    
    if (testName === 'sandboxTest') {
      return result.result?.output?.data?.hasGlobalHeaders ? 'success' : 'error';
    }
    
    return null;
  };

  const tests = {
    session: async () => {
      const res = await fetch('/api/auth/session');
      return await res.json();
    },
    globalHeaders: async () => {
      const res = await fetch('/api/global-headers');
      return await res.json();
    },
    sandboxTest: async () => {
      const res = await fetch('/api/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          code: `module.exports = async (params) => {
            return {
              code: 200,
              status: true,
              data: {
                hasGlobalHeaders: !!params._globalHeaders,
                services: Object.keys(params._globalHeaders || {}),
                instagramHeadersCount: params._globalHeaders?.instagram ? 
                  Object.keys(params._globalHeaders.instagram).length : 0
              }
            };
          }`,
          language: 'nodejs',
          testData: {}
        })
      });
      return await res.json();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Test Global Headers</h2>
        <p className="text-muted-foreground mt-1">Debug global headers integration</p>
      </div>

      <GlowCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Run Tests</h3>
        <div className="space-y-3">
          <AnimatedButton
            onClick={() => runTest('session', tests.session)}
            disabled={loading.session}
            className="w-full justify-start"
          >
            {loading.session ? (
              'Testing...'
            ) : (
              <>
                {getTestStatus('session') === 'success' && <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />}
                {getTestStatus('session') === 'error' && <XCircle className="h-4 w-4 mr-2 text-red-500" />}
                Test 1: Check Session
              </>
            )}
          </AnimatedButton>

          <AnimatedButton
            onClick={() => runTest('globalHeaders', tests.globalHeaders)}
            disabled={loading.globalHeaders}
            className="w-full justify-start"
          >
            {loading.globalHeaders ? (
              'Testing...'
            ) : (
              <>
                {getTestStatus('globalHeaders') === 'success' && <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />}
                {getTestStatus('globalHeaders') === 'error' && <XCircle className="h-4 w-4 mr-2 text-red-500" />}
                Test 2: Check Global Headers
              </>
            )}
          </AnimatedButton>

          <AnimatedButton
            onClick={() => runTest('sandboxTest', tests.sandboxTest)}
            disabled={loading.sandboxTest}
            className="w-full justify-start"
          >
            {loading.sandboxTest ? (
              'Testing...'
            ) : (
              <>
                {getTestStatus('sandboxTest') === 'success' && <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />}
                {getTestStatus('sandboxTest') === 'error' && <XCircle className="h-4 w-4 mr-2 text-red-500" />}
                Test 3: Test Sandbox Injection
              </>
            )}
          </AnimatedButton>
        </div>
      </GlowCard>

      {Object.keys(results).length > 0 && (
        <GlowCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Results</h3>
          <div className="space-y-4">
            {Object.entries(results).map(([testName, result]) => {
              const status = getTestStatus(testName);
              return (
                <div 
                  key={testName} 
                  className={`border-2 rounded-lg p-4 ${
                    status === 'success' 
                      ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' 
                      : status === 'error'
                      ? 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold capitalize flex items-center gap-2">
                      {status === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                      {status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                      {testName}
                    </h4>
                    <AnimatedButton
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(result, null, 2), testName)}
                      className="gap-2"
                    >
                      {copied === testName ? (
                        <>
                          <Check className="h-3 w-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy
                        </>
                      )}
                    </AnimatedButton>
                  </div>
                  <div className="bg-background/80 p-4 rounded-lg border overflow-auto max-h-[600px]">
                    <div className="font-mono text-sm">
                      {renderValue(result)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlowCard>
      )}
    </div>
  );
}
