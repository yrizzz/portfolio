"use client";

import { useState, useEffect } from "react";
import { GlowCard } from "@/components/ui/glow-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { FadeInOnScroll, StaggerContainer, StaggerItem, SlideInRight } from "@/components/scroll-animations";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState<any[]>([
    {
      id: "1",
      type: "Email",
      value: "your@email.com",
      href: "mailto:your@email.com",
      icon: "mail"
    },
    {
      id: "2",
      type: "Phone",
      value: "+1 (234) 567-890",
      href: "tel:+1234567890",
      icon: "phone"
    },
    {
      id: "3",
      type: "Location",
      value: "Your City, Country",
      href: null,
      icon: "map-pin"
    }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/contact-info')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setContactInfo(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load contact info:', err);
        setLoading(false);
      });
  }, []);

  const getIconComponent = (iconName: string) => {
    const icons: any = { mail: Mail, phone: Phone, 'map-pin': MapPin };
    return icons[iconName] || Mail;
  };

  const getColorClass = (type: string) => {
    const colors: any = {
      'Email': 'from-blue-500 to-cyan-500',
      'Phone': 'from-green-500 to-emerald-500',
      'Location': 'from-purple-500 to-violet-500'
    };
    return colors[type] || 'from-blue-500 to-cyan-500';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success("Message sent successfully!");
    setFormData({ name: "", email: "", message: "" });
    setIsSubmitting(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Contact info will be loaded from API

  return (
    <section className="space-y-6">
      <FadeInOnScroll>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0d47c4] via-[#136bfe] to-[#3b82f6] bg-clip-text text-transparent">
            Get In Touch
          </h2>
          <p className="text-sm text-muted-foreground">
            Let's discuss your project
          </p>
        </div>
      </FadeInOnScroll>

      <div className="grid gap-6 lg:grid-cols-3">
        <StaggerContainer className="space-y-4">
          {contactInfo.map((info) => {
            const Icon = getIconComponent(info.icon);
            const colorClass = getColorClass(info.type);
            return (
              <StaggerItem key={info.id}>
                <GlowCard hoverScale={1.03}>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${colorClass}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="text-sm font-semibold">{info.type}</h3>
                    </div>
                    {info.href ? (
                      <a href={info.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">{info.value}</p>
                    )}
                  </div>
                </GlowCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        <SlideInRight className="lg:col-span-2">
          <GlowCard hoverScale={1.005}>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-1">Send a Message</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Fill out the form and I'll get back to you soon
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell me about your project..."
                    className="min-h-[120px] resize-none"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <AnimatedButton
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                  hoverScale={1.05}
                  tapScale={0.95}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Send Message
                    </span>
                  )}
                </AnimatedButton>
              </form>
            </div>
          </GlowCard>
        </SlideInRight>
      </div>
    </section>
  );
}
