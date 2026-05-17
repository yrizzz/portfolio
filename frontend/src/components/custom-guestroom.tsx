"use client";

import { useState, useEffect } from "react";
import { GlowCard } from "@/components/ui/glow-card";
import { FadeInOnScroll } from "@/components/scroll-animations";
import { MessageSquare, Send, Reply, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Reply {
  name: string;
  email: string;
  message: string;
  createdAt: string;
  isAdmin: boolean;
}

interface Message {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  replies?: Reply[];
  createdAt: string;
}

export function CustomGuestroom() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [replyForm, setReplyForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Message sent successfully!");
        setFormData({ name: "", email: "", subject: "", message: "" });
        loadMessages();
      } else {
        toast.error(data.error || "Failed to send message");
      }
    } catch (error) {
      toast.error("Error sending message");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (messageId: string) => {
    if (!replyForm.name || !replyForm.email || !replyForm.message) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const res = await fetch("/api/messages/reply-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          ...replyForm,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Reply sent!");
        setReplyForm({ name: "", email: "", message: "" });
        setReplyingTo(null);
        loadMessages();
      } else {
        toast.error(data.error || "Failed to send reply");
      }
    } catch (error) {
      toast.error("Error sending reply");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRelativeTime = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  return (
    <section className="space-y-8">
      <FadeInOnScroll>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0d47c4] via-[#136bfe] to-[#3b82f6] bg-clip-text text-transparent flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-[#136bfe]" />
            Guestroom
          </h2>
          <p className="text-sm text-muted-foreground">
            Leave a message and join the conversation!
          </p>
        </div>
      </FadeInOnScroll>

      {/* Submit Form */}
      <FadeInOnScroll delay={0.1}>
        <GlowCard hoverScale={1.01}>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Subject (optional)
              </label>
              <Input
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                placeholder="Message subject"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Message *
              </label>
              <Textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Write your message here..."
                rows={4}
                required
              />
            </div>
            <AnimatedButton
              type="submit"
              disabled={submitting}
              className="w-full"
              hoverScale={1.02}
            >
              <Send className="h-4 w-4 mr-2" />
              {submitting ? "Sending..." : "Send Message"}
            </AnimatedButton>
          </form>
        </GlowCard>
      </FadeInOnScroll>

      {/* Messages List */}
      <FadeInOnScroll delay={0.2}>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages ({messages.length})
          </h3>

          {loading ? (
            <GlowCard>
              <div className="p-8 text-center text-muted-foreground">
                Loading messages...
              </div>
            </GlowCard>
          ) : messages.length === 0 ? (
            <GlowCard>
              <div className="p-8 text-center text-muted-foreground">
                No messages yet. Be the first to leave a message!
              </div>
            </GlowCard>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <GlowCard key={msg._id} hoverScale={1.01}>
                  <div className="p-5 space-y-4 overflow-hidden">
                    {/* Main Message */}
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0d47c4] to-[#3b82f6] flex items-center justify-center text-white font-semibold text-sm">
                          {getInitials(msg.name)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{msg.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {getRelativeTime(msg.createdAt)}
                          </span>
                        </div>
                        {msg.subject && (
                          <p className="text-sm font-medium text-muted-foreground mt-0.5">
                            {msg.subject}
                          </p>
                        )}
                        <p className="text-sm mt-2 whitespace-pre-wrap break-words">
                          {msg.message}
                        </p>
                        
                        {/* Reply Button */}
                        <button
                          onClick={() => setReplyingTo(replyingTo === msg._id ? null : msg._id)}
                          className="text-xs text-[#136bfe] hover:text-[#0d47c4] font-medium mt-2 flex items-center gap-1 transition-colors"
                        >
                          <Reply className="h-3 w-3" />
                          Reply
                        </button>
                      </div>
                    </div>

                    {/* Replies Thread */}
                    {msg.replies && msg.replies.length > 0 && (
                      <div className="ml-8 md:ml-12 space-y-3 border-l-2 border-border pl-4">
                        {msg.replies.map((reply, idx) => (
                          <div key={idx} className="flex gap-3">
                            <div className="flex-shrink-0">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-semibold text-xs ${
                                reply.isAdmin 
                                  ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                                  : 'bg-gradient-to-br from-gray-400 to-gray-600'
                              }`}>
                                {reply.isAdmin ? <Shield className="h-4 w-4" /> : getInitials(reply.name)}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm">{reply.name}</span>
                                {reply.isAdmin && (
                                  <Badge variant="default" className="text-xs bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                                    Admin
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {getRelativeTime(reply.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm mt-1 whitespace-pre-wrap break-words">
                                {reply.message}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Form */}
                    {replyingTo === msg._id && (
                      <div className="ml-8 md:ml-12 mt-4 space-y-3 border-l-2 border-[#136bfe] pl-4 max-w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input
                            placeholder="Your name"
                            value={replyForm.name}
                            onChange={(e) =>
                              setReplyForm({ ...replyForm, name: e.target.value })
                            }
                            className="text-sm"
                          />
                          <Input
                            type="email"
                            placeholder="Your email"
                            value={replyForm.email}
                            onChange={(e) =>
                              setReplyForm({ ...replyForm, email: e.target.value })
                            }
                            className="text-sm"
                          />
                        </div>
                        <Textarea
                          placeholder="Write your reply..."
                          value={replyForm.message}
                          onChange={(e) =>
                            setReplyForm({ ...replyForm, message: e.target.value })
                          }
                          rows={3}
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <AnimatedButton
                            size="sm"
                            onClick={() => handleReply(msg._id)}
                            hoverScale={1.05}
                          >
                            <Send className="h-3 w-3 mr-1.5" />
                            Send Reply
                          </AnimatedButton>
                          <AnimatedButton
                            size="sm"
                            variant="outline"
                            onClick={() => setReplyingTo(null)}
                            hoverScale={1.05}
                          >
                            Cancel
                          </AnimatedButton>
                        </div>
                      </div>
                    )}
                  </div>
                </GlowCard>
              ))}
            </div>
          )}
        </div>
      </FadeInOnScroll>
    </section>
  );
}
