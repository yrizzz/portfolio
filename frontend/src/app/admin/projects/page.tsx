"use client";

import { useState, useEffect, useRef } from "react";
import { GlowCard } from "@/components/ui/glow-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedButton, AnimatedIconButton } from "@/components/ui/animated-button";
import { Plus, Edit, Trash2, Upload, X, ExternalLink, GitBranch, Star } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/admin/modal";
import { Badge } from "@/components/ui/badge";

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  liveUrl: string;
  githubUrl: string;
  category: "fullstack" | "frontend" | "backend";
  featured?: boolean;
}

const defaultProjects: Project[] = [
  {
    id: "1",
    title: "E-Commerce Platform",
    description: "Full-stack e-commerce solution with payment integration and admin dashboard.",
    image: "https://images.unsplash.com/photo-1557821552-17105176677c?w=400&h=300&fit=crop",
    tags: ["Next.js", "TypeScript", "Prisma", "Stripe"],
    liveUrl: "#",
    githubUrl: "#",
    category: "fullstack",
    featured: true,
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [tagInput, setTagInput] = useState("");

  const [formData, setFormData] = useState<Project>({
    id: "",
    title: "",
    description: "",
    image: "",
    tags: [],
    liveUrl: "",
    githubUrl: "",
    category: "fullstack",
    featured: false,
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      
      // Handle both old and new response format
      const projectsData = data.success && data.projects ? data.projects : data;
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSaving(true);
    try {
      let updatedProjects;
      if (editingProject) {
        updatedProjects = projects.map(p => p.id === formData.id ? formData : p);
      } else {
        const newProject = { ...formData, id: Date.now().toString() };
        updatedProjects = [...projects, newProject];
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProjects),
      });

      if (response.ok) {
        setProjects(updatedProjects);
        setModalOpen(false);
        resetForm();
        toast.success(editingProject ? "Project updated!" : "Project added!");
      } else {
        toast.error("Failed to save project");
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error("Failed to save project");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const updatedProjects = projects.filter(p => p.id !== id);
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProjects),
      });

      if (response.ok) {
        setProjects(updatedProjects);
        setDeleteConfirm(null);
        toast.success("Project deleted!");
      }
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData(project);
    setImagePreview(project.image);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    resetForm();
    setModalOpen(true);
  };

  const resetForm = () => {
    setEditingProject(null);
    setFormData({
      id: "",
      title: "",
      description: "",
      image: "",
      tags: [],
      liveUrl: "",
      githubUrl: "",
      category: "fullstack",
      featured: false,
    });
    setImagePreview("");
    setTagInput("");
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
        setFormData(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">Projects</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your portfolio projects
          </p>
        </div>
        <AnimatedButton onClick={handleAddNew} hoverScale={1.05}>
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </AnimatedButton>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {projects.map((project) => (
          <GlowCard key={project.id} hoverScale={1.02}>
            <div className="flex flex-col h-full">
              {/* Image */}
              <div className="relative h-48 rounded-t-xl overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
                {project.featured && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-yellow-500 text-white">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Featured
                    </Badge>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">{project.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {project.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Badge variant="secondary" className="text-xs">
                    {project.category}
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 p-4 pt-0">
                <AnimatedButton
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(project)}
                  hoverScale={1.05}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </AnimatedButton>
                <AnimatedButton
                  variant="outline"
                  size="sm"
                  className="flex-1 text-destructive hover:text-destructive"
                  onClick={() => setDeleteConfirm(project.id)}
                  hoverScale={1.05}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </AnimatedButton>
              </div>
            </div>
          </GlowCard>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No projects yet. Add your first project!</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        title={editingProject ? "Edit Project" : "Add New Project"}
        size="lg"
      >
        <div className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-4">
            <Label>Project Image</Label>
            {imagePreview && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    setImagePreview("");
                    setFormData(prev => ({ ...prev, image: "" }));
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
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
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {imagePreview ? "Change Image" : "Upload Image"}
            </AnimatedButton>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Project title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Project description"
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add tag (press Enter)"
              />
              <AnimatedButton onClick={handleAddTag} variant="outline">
                <Plus className="h-4 w-4" />
              </AnimatedButton>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
              className="w-full px-3 py-2 rounded-lg border bg-background"
            >
              <option value="fullstack">Full Stack</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
            </select>
          </div>

          {/* URLs */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Live URL</Label>
              <Input
                value={formData.liveUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, liveUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>GitHub URL</Label>
              <Input
                value={formData.githubUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                placeholder="https://github.com/..."
              />
            </div>
          </div>

          {/* Featured */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="featured" className="cursor-pointer">
              Mark as featured project
            </Label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <AnimatedButton
              variant="outline"
              onClick={() => {
                setModalOpen(false);
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </AnimatedButton>
            <AnimatedButton
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? "Saving..." : "Save Project"}
            </AnimatedButton>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Project"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Are you sure you want to delete this project? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <AnimatedButton
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              className="flex-1"
            >
              Cancel
            </AnimatedButton>
            <AnimatedButton
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="flex-1 bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AnimatedButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
