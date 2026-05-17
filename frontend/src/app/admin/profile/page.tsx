"use client";

import { useState, useRef, useEffect } from "react";
import { GlowCard } from "@/components/ui/glow-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedButton, AnimatedIconButton } from "@/components/ui/animated-button";
import { Save, RefreshCw, Upload, X, Plus, Trash2, MapPin, Mail, Download } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/admin/modal";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: "github" | "linkedin" | "twitter" | "instagram" | "facebook" | "youtube" | "dribbble" | "behance";
}

interface ProfileData {
  name: string;
  title: string;
  subtitle: string;
  location: string;
  bio1: string;
  bio2: string;
  avatarUrl: string;
  status: string;
  cvUrl: string;
  socialLinks: SocialLink[];
}

const defaultSocialLinks: SocialLink[] = [
  { id: "1", platform: "GitHub", url: "https://github.com/yrizzz", icon: "github" },
  { id: "2", platform: "LinkedIn", url: "https://linkedin.com", icon: "linkedin" }
];

const iconOptions = [
  { value: "github", label: "GitHub", svg: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" },
  { value: "linkedin", label: "LinkedIn", svg: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" },
  { value: "twitter", label: "Twitter/X", svg: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { value: "instagram", label: "Instagram", svg: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
  { value: "facebook", label: "Facebook", svg: "M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" },
  { value: "youtube", label: "YouTube", svg: "M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" },
  { value: "dribbble", label: "Dribbble", svg: "M12 0c-6.628 0-12 5.373-12 12s5.372 12 12 12 12-5.373 12-12-5.372-12-12-12zm9.885 11.441c-2.575-.422-4.943-.445-7.103-.073-.244-.563-.497-1.125-.767-1.68 2.31-1 4.165-2.358 5.548-4.082 1.35 1.594 2.197 3.619 2.322 5.835zm-3.842-7.282c-1.205 1.554-2.868 2.783-4.986 3.68-1.016-1.861-2.178-3.676-3.488-5.438.779-.197 1.591-.314 2.431-.314 2.275 0 4.368.779 6.043 2.072zm-10.516-.993c1.331 1.742 2.511 3.538 3.537 5.381-2.43.715-5.331 1.082-8.684 1.105.692-2.835 2.601-5.193 5.147-6.486zm-5.44 8.834l.013-.256c3.849-.005 7.169-.448 9.95-1.322.233.475.456.952.67 1.432-3.38 1.057-6.165 3.222-8.337 6.48-1.432-1.719-2.296-3.927-2.296-6.334zm3.829 7.81c1.969-3.088 4.482-5.098 7.598-6.027.928 2.42 1.609 4.91 2.043 7.46-3.349 1.291-7.21.873-9.641-1.433zm11.586.43c-.438-2.353-1.08-4.653-1.92-6.897 1.876-.265 3.94-.196 6.199.196-.437 2.786-2.028 5.192-4.279 6.701z" },
  { value: "behance", label: "Behance", svg: "M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988h-6.466v-14.967h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zm-3.466-8.988h3.584c2.508 0 2.906-3-.312-3h-3.272v3zm3.391 3h-3.391v3.016h3.341c3.055 0 2.868-3.016.05-3.016z" }
];

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string>("/profile.jpg");

  const [formData, setFormData] = useState<ProfileData>({
    name: "YrizzzDev",
    title: "Full Stack Developer",
    subtitle: "Full-Stack Web Specialist 🚀",
    location: "Indonesia",
    bio1: "With over 5 years of professional experience, I specialize in crafting robust and scalable web applications. My expertise lies in building modern, high-performance solutions using Laravel and Livewire.",
    bio2: "From concept to deployment, I deliver end-to-end solutions that combine elegant code architecture with exceptional user experiences.",
    avatarUrl: "/profile.jpg",
    status: "Available to be partner",
    cvUrl: "/cv.pdf",
    socialLinks: defaultSocialLinks,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [iconPickerOpen, setIconPickerOpen] = useState<string | null>(null); // ID of link being edited

  // Load profile data on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      
      // Handle both old and new response format
      const profileData = data.success && data.profile ? data.profile : data;
      
      setFormData(profileData);
      setImagePreview(profileData.avatarUrl);
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, avatarUrl: result }));
        toast.success("Image uploaded successfully");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSocialLink = () => {
    const newLink: SocialLink = {
      id: Date.now().toString(),
      platform: "",
      url: "",
      icon: "github"
    };
    setFormData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, newLink]
    }));
  };

  const handleRemoveSocialLink = (id: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter(link => link.id !== id)
    }));
    toast.info("Social link removed");
  };

  const handleSocialLinkChange = (id: string, field: keyof SocialLink, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map(link =>
        link.id === id ? { ...link, [field]: value } : link
      )
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.title || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success("Profile updated successfully! Refresh homepage to see changes.");
      } else {
        toast.error(result.error || "Failed to save profile");
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "YrizzzDev",
      title: "Full Stack Developer",
      subtitle: "Full-Stack Web Specialist 🚀",
      location: "Indonesia",
      bio1: "With over 5 years of professional experience, I specialize in crafting robust and scalable web applications. My expertise lies in building modern, high-performance solutions using Laravel and Livewire.",
      bio2: "From concept to deployment, I deliver end-to-end solutions that combine elegant code architecture with exceptional user experiences.",
      avatarUrl: "/profile.jpg",
      status: "Available to be partner",
      cvUrl: "/cv.pdf",
      socialLinks: defaultSocialLinks,
    });
    setImagePreview("/profile.jpg");
    toast.info("Form reset to default values");
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">Profile & Hero Section</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your profile information displayed on the homepage
          </p>
        </div>
        <div className="flex flex-row gap-2">
          <AnimatedButton variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </AnimatedButton>
          <AnimatedButton onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </AnimatedButton>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Image Upload */}
        <GlowCard>
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Profile Image</h3>
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                  <AvatarImage src={imagePreview} alt="Profile" />
                  <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-[#0d47c4] to-[#3b82f6] text-white">
                    {formData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {imagePreview !== "/profile.jpg" && (
                  <button
                    onClick={() => {
                      setImagePreview("/profile.jpg");
                      setFormData(prev => ({ ...prev, avatarUrl: "/profile.jpg" }));
                    }}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <AnimatedButton
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                hoverScale={1.05}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </AnimatedButton>
              <p className="text-xs text-muted-foreground text-center">
                Recommended: Square image, max 5MB
              </p>
            </div>
          </div>
        </GlowCard>

        {/* Basic Info */}
        <GlowCard className="lg:col-span-2">
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle/Tagline</Label>
                <Input id="subtitle" name="subtitle" value={formData.subtitle} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input id="location" name="location" value={formData.location} onChange={handleChange} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="status">Status Message *</Label>
                <Input id="status" name="status" value={formData.status} onChange={handleChange} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="cvUrl">CV/Resume URL</Label>
                <Input id="cvUrl" name="cvUrl" value={formData.cvUrl} onChange={handleChange} />
              </div>
            </div>
          </div>
        </GlowCard>
      </div>

      {/* Bio Section */}
      <GlowCard>
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">About / Bio</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio1">Bio Paragraph 1 *</Label>
              <Textarea id="bio1" name="bio1" value={formData.bio1} onChange={handleChange} rows={4} className="resize-none" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio2">Bio Paragraph 2 *</Label>
              <Textarea id="bio2" name="bio2" value={formData.bio2} onChange={handleChange} rows={3} className="resize-none" />
            </div>
          </div>
        </div>
      </GlowCard>

      {/* Social Media Links */}
      <GlowCard>
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Social Media Links</h3>
            <AnimatedButton variant="outline" size="sm" onClick={handleAddSocialLink} hoverScale={1.05}>
              <Plus className="h-4 w-4 mr-2" />
              Add Link
            </AnimatedButton>
          </div>
          <div className="space-y-4 md:space-y-6">
            {formData.socialLinks.map((link) => (
              <div key={link.id} className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50">
                {/* Selected Icon Display */}
                <button
                  type="button"
                  onClick={() => setIconPickerOpen(link.id)}
                  className="flex-shrink-0 p-3 rounded-lg border-2 border-primary bg-primary/10 hover:bg-primary/20 transition-all"
                  title="Change icon"
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d={iconOptions.find(opt => opt.value === link.icon)?.svg} />
                  </svg>
                </button>
                
                {/* URL Input */}
                <div className="flex-1 space-y-1">
                  <Label htmlFor={`url-${link.id}`} className="text-xs text-muted-foreground">
                    {iconOptions.find(opt => opt.value === link.icon)?.label} URL
                  </Label>
                  <Input
                    id={`url-${link.id}`}
                    type="url"
                    value={link.url}
                    onChange={(e) => handleSocialLinkChange(link.id, 'url', e.target.value)}
                    placeholder="https://..."
                    className="h-9"
                  />
                </div>
                
                {/* Delete Button */}
                <AnimatedIconButton
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveSocialLink(link.id)}
                  className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  hoverScale={1.1}
                >
                  <Trash2 className="h-4 w-4" />
                </AnimatedIconButton>
              </div>
            ))}
            {formData.socialLinks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No social links added yet</p>
              </div>
            )}
          </div>
        </div>
      </GlowCard>

      {/* Preview - Sama Persis dengan Hero Section */}
      <GlowCard>
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Preview (Hero Section)</h3>
          <p className="text-sm text-muted-foreground">This is exactly how your profile will appear on the homepage</p>
          
          {/* Preview Container - Match actual hero section */}
          <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-background/60 via-background/40 to-background/60 p-6 lg:p-10">
            {/* Free Palestine Banner */}
            <div className="mb-6 lg:mb-8 flex justify-center">
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-background/20 dark:bg-background/15 backdrop-blur-md shadow-lg border border-white/10 dark:border-white/5">
                <span className="text-sm font-bold">
                  🇵🇸 Free Palestine
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
              {/* LEFT: Photo, Name, Socials */}
              <div className="flex flex-col items-center gap-4 lg:gap-6 text-center">
                {/* Avatar */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#0d47c4] via-[#3b82f6] to-[#136bfe] rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
                  <Avatar className="relative h-28 w-28 lg:h-40 lg:w-40 border-4 border-white/20 dark:border-white/10 shadow-2xl backdrop-blur-sm">
                    <AvatarImage src={imagePreview} alt={formData.name} />
                    <AvatarFallback className="text-2xl lg:text-4xl font-bold bg-gradient-to-br from-[#0d47c4] to-[#3b82f6] text-white">
                      {formData.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Name & Title */}
                <div className="space-y-1.5 lg:space-y-2">
                  <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-[#0d47c4] via-[#3b82f6] to-[#136bfe] bg-clip-text text-transparent">
                    {formData.name}
                  </h1>
                  <p className="text-base lg:text-xl font-medium text-muted-foreground">
                    {formData.title}
                  </p>
                </div>

                {/* Location & Status */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{formData.location}</span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 px-4 py-1.5 backdrop-blur-sm"
                  >
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    {formData.status}
                  </Badge>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-3">
                  {formData.socialLinks.map((link) => {
                    const iconData = iconOptions.find(opt => opt.value === link.icon);
                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative"
                      >
                        <div className="absolute -inset-2 bg-gradient-to-r from-[#0d47c4] to-[#3b82f6] rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                        <div className="relative h-10 w-10 lg:h-12 lg:w-12 rounded-lg bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 backdrop-blur-sm border border-white/20 dark:border-white/10 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg">
                          <svg className="h-5 w-5 lg:h-6 lg:w-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d={iconData?.svg} />
                          </svg>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT: Bio & Actions */}
              <div className="flex flex-col gap-4 lg:gap-6 text-center lg:text-left">
                <div className="space-y-3 lg:space-y-5">
                  <h2 className="text-xl lg:text-3xl font-bold">
                    {formData.subtitle}
                  </h2>
                  <div className="space-y-2.5 lg:space-y-3">
                    <p className="text-sm lg:text-lg text-muted-foreground leading-relaxed text-justify">
                      {formData.bio1}
                    </p>
                    <p className="text-sm lg:text-lg text-muted-foreground leading-relaxed text-justify">
                      {formData.bio2}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <AnimatedButton
                    size="lg"
                    className="gap-2 font-semibold shadow-lg shadow-primary/20 rounded-xl px-6 backdrop-blur-sm"
                    hoverScale={1.05}
                  >
                    <Mail className="h-4 w-4" />
                    Contact Me
                  </AnimatedButton>
                  {formData.cvUrl && (
                    <AnimatedButton
                      size="lg"
                      variant="outline"
                      className="gap-2 border-2 rounded-xl px-6 backdrop-blur-sm bg-white/5 hover:bg-white/10 shadow-lg"
                      hoverScale={1.05}
                      onClick={() => window.open(formData.cvUrl, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                      Download CV
                    </AnimatedButton>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlowCard>

      {/* Icon Picker Modal */}
      <Modal
        isOpen={iconPickerOpen !== null}
        onClose={() => setIconPickerOpen(null)}
        title="Select Social Media Icon"
        size="md"
      >
        <div className="grid grid-cols-4 gap-3">
          {iconOptions.map((option) => {
            const currentLink = formData.socialLinks.find(l => l.id === iconPickerOpen);
            const isSelected = currentLink?.icon === option.value;
            
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  if (iconPickerOpen) {
                    handleSocialLinkChange(iconPickerOpen, 'icon', option.value);
                    setIconPickerOpen(null);
                  }
                }}
                className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                  isSelected 
                    ? 'border-primary bg-primary/10 shadow-md' 
                    : 'border-border hover:border-primary/50'
                }`}
                title={option.label}
              >
                <svg className="h-8 w-8 mx-auto" viewBox="0 0 24 24" fill="currentColor">
                  <path d={option.svg} />
                </svg>
                <p className="text-xs mt-2 text-center font-medium">{option.label}</p>
              </button>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
