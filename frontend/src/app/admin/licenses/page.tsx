'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { GlowCard } from '@/components/ui/glow-card';
import { toast } from 'sonner';

interface License {
  id: string;
  type: string;
  price: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  autoRenew: boolean;
  createdAt: string;
}

export default function LicensesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('MONTHLY');

  const licenseTypes = [
    { type: 'DAILY', price: 5, duration: '1 Day', description: 'Perfect for testing' },
    { type: 'WEEKLY', price: 25, duration: '7 Days', description: 'Great for short projects' },
    { type: 'MONTHLY', price: 80, duration: '30 Days', description: 'Best value for regular use' },
  ];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchLicenses();
    }
  }, [status, router]);

  const fetchLicenses = async () => {
    try {
      const response = await fetch('/api/licenses');
      const data = await response.json();
      
      if (response.ok) {
        setLicenses(data.licenses);
      } else {
        console.error('Failed to fetch licenses:', data.error);
      }
    } catch (error) {
      console.error('Error fetching licenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseLicense = async () => {
    try {
      const response = await fetch('/api/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedType })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('License purchased successfully!');
        setShowPurchaseModal(false);
        fetchLicenses();
      } else {
        toast.error(data.error || 'Failed to purchase license');
      }
    } catch (error) {
      console.error('Error purchasing license:', error);
      toast.error('Failed to purchase license');
    }
  };

  const toggleAutoRenew = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/licenses/toggle-renew', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, autoRenew: !currentStatus })
      });

      const data = await response.json();

      if (response.ok) {
        fetchLicenses();
      } else {
        toast.error(data.error || 'Failed to toggle auto-renew');
      }
    } catch (error) {
      console.error('Error toggling auto-renew:', error);
      toast.error('Failed to toggle auto-renew');
    }
  };

  const cancelLicense = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this license?')) {
      return;
    }

    try {
      const response = await fetch(`/api/licenses?id=${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        fetchLicenses();
      } else {
        toast.error(data.error || 'Failed to cancel license');
      }
    } catch (error) {
      console.error('Error canceling license:', error);
      toast.error('Failed to cancel license');
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
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
          <h1 className="text-4xl font-bold text-white mb-2">My Licenses</h1>
          <p className="text-gray-300">Manage your API access licenses</p>
        </div>

        {/* Purchase Modal */}
        {showPurchaseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <GlowCard className="max-w-4xl w-full p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Purchase License</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {licenseTypes.map((license) => (
                  <div
                    key={license.type}
                    onClick={() => setSelectedType(license.type)}
                    className={`cursor-pointer p-6 rounded-lg border-2 transition-all ${
                      selectedType === license.type
                        ? 'border-purple-500 bg-purple-900/30'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <h3 className="text-xl font-bold text-white mb-2">{license.type}</h3>
                    <p className="text-3xl font-bold text-purple-400 mb-2">${license.price}</p>
                    <p className="text-gray-400 text-sm mb-2">{license.duration}</p>
                    <p className="text-gray-300 text-sm">{license.description}</p>
                  </div>
                ))}
              </div>

              <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4 mb-6">
                <p className="text-blue-200 text-sm">
                  ℹ️ This is a demo purchase flow. In production, integrate with a payment gateway like Stripe or PayPal.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={purchaseLicense}
                  className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
                >
                  Purchase {selectedType} License
                </button>
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </GlowCard>
          </div>
        )}

        {/* Purchase Button */}
        <GlowCard className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Need More Access?</h2>
              <p className="text-gray-300">Purchase a license to unlock full API access</p>
            </div>
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
            >
              Purchase License
            </button>
          </div>
        </GlowCard>

        {/* Active Licenses */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Active Licenses</h2>
          <div className="space-y-4">
            {licenses.filter(l => l.isActive && !isExpired(l.endDate)).length === 0 ? (
              <GlowCard className="p-8 text-center">
                <p className="text-gray-400">No active licenses. Purchase one to get started!</p>
              </GlowCard>
            ) : (
              licenses
                .filter(l => l.isActive && !isExpired(l.endDate))
                .map((license) => (
                  <GlowCard key={license.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-2xl font-bold text-white">{license.type} License</h3>
                          <span className="px-3 py-1 bg-green-900/30 text-green-400 border border-green-500 rounded-full text-xs font-medium">
                            Active
                          </span>
                          {license.autoRenew && (
                            <span className="px-3 py-1 bg-blue-900/30 text-blue-400 border border-blue-500 rounded-full text-xs font-medium">
                              Auto-Renew
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-gray-500">Price</p>
                            <p className="text-white font-medium">${license.price}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Start Date</p>
                            <p className="text-white">{new Date(license.startDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">End Date</p>
                            <p className="text-white">{new Date(license.endDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Days Remaining</p>
                            <p className="text-white font-bold">{getDaysRemaining(license.endDate)} days</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.max(0, Math.min(100, (getDaysRemaining(license.endDate) / 30) * 100))}%`
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => toggleAutoRenew(license.id, license.autoRenew)}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            license.autoRenew
                              ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {license.autoRenew ? 'Disable Auto-Renew' : 'Enable Auto-Renew'}
                        </button>
                        <button
                          onClick={() => cancelLicense(license.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </GlowCard>
                ))
            )}
          </div>
        </div>

        {/* Expired/Inactive Licenses */}
        {licenses.filter(l => !l.isActive || isExpired(l.endDate)).length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Expired Licenses</h2>
            <div className="space-y-4">
              {licenses
                .filter(l => !l.isActive || isExpired(l.endDate))
                .map((license) => (
                  <GlowCard key={license.id} className="p-6 opacity-60">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-white">{license.type} License</h3>
                          <span className="px-3 py-1 bg-red-900/30 text-red-400 border border-red-500 rounded-full text-xs font-medium">
                            Expired
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Price</p>
                            <p className="text-white">${license.price}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Start Date</p>
                            <p className="text-white">{new Date(license.startDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">End Date</p>
                            <p className="text-white">{new Date(license.endDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlowCard>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
