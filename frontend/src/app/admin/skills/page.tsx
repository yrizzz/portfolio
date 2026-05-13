"use client";

import { useState, useEffect } from "react";
import { GlowCard } from "@/components/ui/glow-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedButton, AnimatedIconButton } from "@/components/ui/animated-button";
import { Save, RefreshCw, Plus, Trash2, Edit, X } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/admin/modal";
import { Badge } from "@/components/ui/badge";

interface Skill {
  id: string;
  name: string;
  slug: string;
  category: "Frontend" | "Backend" | "Database & ORM" | "Tools";
}

const categories = ["Frontend", "Backend", "Database & ORM", "Tools"] as const;

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "Frontend" as Skill["category"],
  });

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const response = await fetch('/api/skills');
      const data = await response.json();
      setSkills(data);
    } catch (error) {
      console.error('Failed to load skills:', error);
      toast.error('Failed to load skills');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSaving(true);
    try {
      let updatedSkills;
      if (editingSkill) {
        updatedSkills = skills.map(skill =>
          skill.id === editingSkill.id
            ? { ...skill, ...formData }
            : skill
        );
      } else {
        const newSkill: Skill = {
          id: Date.now().toString(),
          ...formData,
        };
        updatedSkills = [...skills, newSkill];
      }

      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSkills),
      });

      if (response.ok) {
        setSkills(updatedSkills);
        toast.success(editingSkill ? "Skill updated!" : "Skill added!");
        handleCloseModal();
      } else {
        toast.error("Failed to save skill");
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error("Failed to save skill");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this skill?")) return;

    try {
      const updatedSkills = skills.filter(skill => skill.id !== id);
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSkills),
      });

      if (response.ok) {
        setSkills(updatedSkills);
        toast.success("Skill deleted!");
      } else {
        toast.error("Failed to delete skill");
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error("Failed to delete skill");
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      slug: skill.slug,
      category: skill.category,
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingSkill(null);
    setFormData({
      name: "",
      slug: "",
      category: "Frontend",
    });
  };

  const skillsByCategory = categories.map(category => ({
    category,
    skills: skills.filter(skill => skill.category === category),
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">Skills & Tools</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your technical skills and tools
          </p>
        </div>
        <AnimatedButton onClick={() => setModalOpen(true)} hoverScale={1.05}>
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </AnimatedButton>
      </div>

      {/* Skills by Category */}
      <div className="grid gap-6">
        {skillsByCategory.map(({ category, skills: categorySkills }) => (
          <GlowCard key={category}>
            <div className="p-4 md:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{category}</h3>
                <Badge variant="secondary">{categorySkills.length} skills</Badge>
              </div>
              
              {categorySkills.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No skills in this category yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {categorySkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="group relative flex flex-col items-center gap-2 p-3 rounded-lg border bg-muted/50 hover:bg-muted transition-all"
                    >
                      {/* Icon */}
                      <div className="h-10 w-10 flex items-center justify-center">
                        <img
                          src={`https://cdn.simpleicons.org/${skill.slug}`}
                          alt={skill.name}
                          className="h-8 w-8"
                          onError={(e) => {
                            e.currentTarget.src = `https://cdn.simpleicons.org/${skill.slug}/000/fff`;
                          }}
                        />
                      </div>
                      
                      {/* Name */}
                      <span className="text-xs font-medium text-center leading-tight line-clamp-2">
                        {skill.name}
                      </span>

                      {/* Actions (show on hover) */}
                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <AnimatedIconButton
                          size="icon"
                          variant="secondary"
                          className="h-6 w-6 rounded-full shadow-md"
                          onClick={() => handleEdit(skill)}
                          hoverScale={1.1}
                        >
                          <Edit className="h-3 w-3" />
                        </AnimatedIconButton>
                        <AnimatedIconButton
                          size="icon"
                          variant="destructive"
                          className="h-6 w-6 rounded-full shadow-md"
                          onClick={() => handleDelete(skill.id)}
                          hoverScale={1.1}
                        >
                          <Trash2 className="h-3 w-3" />
                        </AnimatedIconButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlowCard>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingSkill ? "Edit Skill" : "Add New Skill"}
        size="md"
      >
        <div className="space-y-6">
          {/* Skill Name */}
          <div className="space-y-2">
            <Label>Skill Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., React, Node.js, PostgreSQL"
            />
          </div>

          {/* Icon Slug */}
          <div className="space-y-2">
            <Label>Icon Slug (Simple Icons) *</Label>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="e.g., react, nodedotjs, postgresql"
            />
            <p className="text-xs text-muted-foreground">
              Find icon slugs at{" "}
              <a
                href="https://simpleicons.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                simpleicons.org
              </a>
            </p>
          </div>

          {/* Icon Preview */}
          {formData.slug && (
            <div className="space-y-2">
              <Label>Icon Preview</Label>
              <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50">
                <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-background">
                  <img
                    src={`https://cdn.simpleicons.org/${formData.slug}`}
                    alt="Preview"
                    className="h-8 w-8"
                    onError={(e) => {
                      e.currentTarget.src = `https://cdn.simpleicons.org/${formData.slug}/000/fff`;
                    }}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">{formData.name || "Skill Name"}</p>
                  <p className="text-xs text-muted-foreground">Slug: {formData.slug}</p>
                </div>
              </div>
            </div>
          )}

          {/* Category */}
          <div className="space-y-2">
            <Label>Category *</Label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Skill["category"] }))}
              className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <AnimatedButton
              variant="outline"
              onClick={handleCloseModal}
              className="flex-1"
            >
              Cancel
            </AnimatedButton>
            <AnimatedButton
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? "Saving..." : editingSkill ? "Update" : "Add Skill"}
            </AnimatedButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
