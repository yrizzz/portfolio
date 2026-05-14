'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { GlowCard } from '@/components/ui/glow-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { toast } from 'sonner';

interface Submission {
  id: string;
  name: string;
  description: string;
  method: string;
  path: string;
  category: string;
  language: string;
  rawScript: string;
  code: string;
  aiAnalysis: any;
  status: string;
  createdAt: string;
  requiresAuth: boolean;
  rateLimit: number;
}

export default function APIReviewPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    fetchSubmissions();
  }, [session, filter]);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`/api/endpoints/review?status=${filter}`);
      const data = await response.json();
      if (data.success) {
        setSubmissions(data.submissions);
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject', rejectedReason?: string) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/endpoints/review', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          action,
          rejectedReason,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Submission ${action}ed successfully!`);
        setSelectedSubmission(null);
        fetchSubmissions();
      } else {
        toast.error(`Failed to ${action}: ${data.error}`);
      }
    } catch (error) {
      toast.error(`Error: ${error}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (!session || session.user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlowCard className="p-8">
          <p>Access Denied - Admin Only</p>
        </GlowCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">API Submissions Review</h2>
        <p className="text-muted-foreground mt-1">Review and approve/reject API script submissions</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected'].map((status) => (
          <AnimatedButton
            key={status}
            onClick={() => setFilter(status)}
            variant={filter === status ? 'default' : 'outline'}
            className="capitalize"
            hoverScale={1.05}
          >
            {status}
          </AnimatedButton>
        ))}
      </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <GlowCard className="p-8 text-center">
            <p className="text-muted-foreground">No {filter} submissions found</p>
          </GlowCard>
        ) : (
          <div className="grid gap-4">
            {submissions.map((submission) => (
              <GlowCard key={submission.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{submission.name}</h3>
                    <p className="text-muted-foreground text-sm">{submission.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    submission.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                    submission.status === 'approved' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                    'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  }`}>
                    {submission.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Method:</span>
                    <span className="ml-2 font-medium">{submission.method}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Path:</span>
                    <span className="ml-2 font-mono text-xs">{submission.path}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Language:</span>
                    <span className="ml-2 font-medium">{submission.language}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <span className="ml-2 font-medium">{submission.category}</span>
                  </div>
                </div>

                {submission.aiAnalysis && (
                  <div className="mb-4 p-4 bg-accent rounded-lg border border-border">
                    <h4 className="font-semibold mb-2">AI Analysis:</h4>
                    {submission.aiAnalysis.security_concerns && (
                      <div className="mb-2 p-2 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded text-sm">
                        <strong className="text-yellow-800 dark:text-yellow-300">⚠️ Security:</strong>
                        <p className="text-yellow-700 dark:text-yellow-400">{submission.aiAnalysis.security_concerns}</p>
                      </div>
                    )}
                    {submission.aiAnalysis.suggestions && (
                      <div className="p-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded text-sm">
                        <strong className="text-blue-800 dark:text-blue-300">💡 Suggestions:</strong>
                        <p className="text-blue-700 dark:text-blue-400">{submission.aiAnalysis.suggestions}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <AnimatedButton
                    onClick={() => setSelectedSubmission(submission)}
                    variant="outline"
                    size="sm"
                    hoverScale={1.05}
                  >
                    View Details
                  </AnimatedButton>
                  
                  {submission.status === 'pending' && (
                    <>
                      <AnimatedButton
                        onClick={() => handleAction(submission.id, 'approve')}
                        disabled={actionLoading}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        hoverScale={1.05}
                      >
                        ✓ Approve
                      </AnimatedButton>
                      <AnimatedButton
                        onClick={() => {
                          const reason = prompt('Reason for rejection:');
                          if (reason) handleAction(submission.id, 'reject', reason);
                        }}
                        disabled={actionLoading}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                        hoverScale={1.05}
                      >
                        ✗ Reject
                      </AnimatedButton>
                    </>
                  )}
                </div>
              </GlowCard>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <GlowCard className="max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedSubmission.name}</h2>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-muted-foreground hover:text-foreground text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Original Script:</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs border border-border">
                    {selectedSubmission.rawScript}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Adapted Code:</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs border border-border">
                    {selectedSubmission.code}
                  </pre>
                </div>

                {selectedSubmission.aiAnalysis && (
                  <div>
                    <h3 className="font-semibold mb-2">Full AI Analysis:</h3>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs border border-border">
                      {JSON.stringify(selectedSubmission.aiAnalysis, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </GlowCard>
          </div>
        )}
    </div>
  );
}
