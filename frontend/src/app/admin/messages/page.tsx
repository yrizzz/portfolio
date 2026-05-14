'use client';

import { useState, useEffect } from 'react';
import { Mail, Trash2, Eye, EyeOff, Search, Inbox } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GlowCard } from '@/components/ui/glow-card';
import { toast } from 'sonner';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRead = async (id: string, read: boolean) => {
    try {
      const res = await fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: !read }),
      });

      if (res.ok) {
        fetchMessages();
      }
    } catch (error) {
      toast.error('Failed to update message');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return;

    try {
      const res = await fetch(`/api/messages?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Message deleted');
        if (selectedMessage?.id === id) setSelectedMessage(null);
        fetchMessages();
      } else {
        toast.error('Failed to delete message');
      }
    } catch (error) {
      toast.error('Error deleting message');
    }
  };

  const filteredMessages = messages.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.subject?.toLowerCase().includes(search.toLowerCase()) ||
    m.message.toLowerCase().includes(search.toLowerCase())
  );

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Messages</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Contact form submissions</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="default" className="text-sm">
              {unreadCount} unread
            </Badge>
          )}
          <Badge variant="secondary" className="text-sm">
            <Inbox className="h-3.5 w-3.5 mr-1.5" />
            {messages.length} total
          </Badge>
        </div>
      </div>

      {/* Search */}
      <GlowCard className="p-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <button
            onClick={fetchMessages}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Refresh
          </button>
        </div>
      </GlowCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Messages List */}
        <GlowCard className="lg:col-span-1 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Loading messages...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No messages</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-auto">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (!msg.read) handleToggleRead(msg.id, msg.read);
                  }}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                    selectedMessage?.id === msg.id ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                  } ${!msg.read ? 'border-l-2 border-l-primary' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`text-sm truncate text-gray-900 dark:text-gray-100 ${!msg.read ? 'font-semibold' : 'font-medium'}`}>
                        {msg.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{msg.subject || 'No subject'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-1">{msg.message}</p>
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-500 shrink-0">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlowCard>

        {/* Message Detail */}
        <GlowCard className="lg:col-span-2 p-6">
          {selectedMessage ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedMessage.subject || 'No subject'}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    From: <span className="font-medium text-gray-900 dark:text-gray-100">{selectedMessage.name}</span> ({selectedMessage.email})
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleRead(selectedMessage.id, selectedMessage.read)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title={selectedMessage.read ? 'Mark as unread' : 'Mark as read'}
                  >
                    {selectedMessage.read ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <hr className="border-gray-200 dark:border-gray-700" />
              <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                {selectedMessage.message}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-500 dark:text-gray-500">
              <Mail className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">Select a message to read</p>
            </div>
          )}
        </GlowCard>
      </div>
    </div>
  );
}
