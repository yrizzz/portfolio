"use client";

import { useState, useEffect } from "react";
import { GlowCard } from "@/components/ui/glow-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedButton, AnimatedIconButton } from "@/components/ui/animated-button";
import { Save, RefreshCw, Plus, Trash2, Edit, Briefcase, GraduationCap, MapPin, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/admin/modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
}

interface ExperienceData {
  experiences: Experience[];
  education: Education[];
}

export default function ExperiencePage() {
  const [data, setData] = useState<ExperienceData>({
    experiences: [],
    education: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);
  const [modalType, setModalType] = useState<"experience" | "education">("experience");

  const [expForm, setExpForm] = useState<Omit<Experience, "id">>({
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: null,
    current: false,
    description: ""
  });

  const [eduForm, setEduForm] = useState<Omit<Education, "id">>({
    degree: "",
    institution: "",
    location: "",
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('/api/experiences');
      const result = await response.json();
      
      console.log('[Experience Load] Raw data:', result);
      
      // Helper to parse period if dates are missing
      const parsePeriod = (period: string) => {
        if (!period) return { start: '', end: '' };
        const [start, end] = period.split(' - ').map(s => s.trim());
        return { 
          start: start || '', 
          end: end === 'Present' ? null : (end || '') 
        };
      };
      
      // Ensure startDate and endDate exist, parse from period if needed
      const processedData = {
        experiences: (result.experiences || []).map((exp: any) => {
          const parsed = parsePeriod(exp.period);
          return {
            ...exp,
            startDate: exp.startDate || parsed.start,
            endDate: exp.endDate !== undefined ? exp.endDate : parsed.end,
          };
        }),
        education: (result.education || []).map((edu: any) => {
          const parsed = parsePeriod(edu.period);
          return {
            ...edu,
            startDate: edu.startDate || parsed.start,
            endDate: edu.endDate || parsed.end,
          };
        }),
      };
      
      console.log('[Experience Load] Processed data:', processedData);
      setData(processedData);
    } catch (error) {
      console.error('Failed to load:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Validate data before sending
      const hasInvalidDates = data.experiences.some(exp => !exp.startDate) || 
                              data.education.some(edu => !edu.startDate);
      
      if (hasInvalidDates) {
        console.warn('[Experience Save] Some items missing startDate!');
      }
      
      console.log('[Experience Save] Data being sent:', JSON.stringify(data, null, 2));
      
      const response = await fetch('/api/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Saved successfully!");
        loadData();
      } else {
        const error = await response.json();
        console.error('[Experience Save] Error response:', error);
        console.error('[Experience Save] Status:', response.status);
        toast.error(`Failed to save: ${error.details || error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[Experience Save] Exception:', error);
      toast.error(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const openAddExperience = () => {
    setModalType("experience");
    setEditingExp(null);
    setExpForm({
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: null,
      current: false,
      description: ""
    });
    setModalOpen(true);
  };

  const openEditExperience = (exp: Experience) => {
    setModalType("experience");
    setEditingExp(exp);
    setExpForm(exp);
    setModalOpen(true);
  };

  const openAddEducation = () => {
    setModalType("education");
    setEditingEdu(null);
    setEduForm({
      degree: "",
      institution: "",
      location: "",
      startDate: "",
      endDate: ""
    });
    setModalOpen(true);
  };

  const openEditEducation = (edu: Education) => {
    setModalType("education");
    setEditingEdu(edu);
    setEduForm(edu);
    setModalOpen(true);
  };

  const handleSaveExperience = () => {
    if (!expForm.title || !expForm.company || !expForm.startDate) {
      toast.error("Please fill required fields");
      return;
    }

    if (editingExp) {
      setData(prev => ({
        ...prev,
        experiences: prev.experiences.map(e =>
          e.id === editingExp.id ? { ...expForm, id: e.id } : e
        )
      }));
      toast.success("Experience updated");
    } else {
      const newExp: Experience = {
        ...expForm,
        id: Date.now().toString()
      };
      setData(prev => ({
        ...prev,
        experiences: [...prev.experiences, newExp]
      }));
      toast.success("Experience added");
    }
    setModalOpen(false);
  };

  const handleSaveEducation = () => {
    if (!eduForm.degree || !eduForm.institution || !eduForm.startDate) {
      toast.error("Please fill required fields");
      return;
    }

    if (editingEdu) {
      setData(prev => ({
        ...prev,
        education: prev.education.map(e =>
          e.id === editingEdu.id ? { ...eduForm, id: e.id } : e
        )
      }));
      toast.success("Education updated");
    } else {
      const newEdu: Education = {
        ...eduForm,
        id: Date.now().toString()
      };
      setData(prev => ({
        ...prev,
        education: [...prev.education, newEdu]
      }));
      toast.success("Education added");
    }
    setModalOpen(false);
  };

  const deleteExperience = (id: string) => {
    if (confirm("Delete this experience?")) {
      setData(prev => ({
        ...prev,
        experiences: prev.experiences.filter(e => e.id !== id)
      }));
      toast.success("Experience deleted");
    }
  };

  const deleteEducation = (id: string) => {
    if (confirm("Delete this education?")) {
      setData(prev => ({
        ...prev,
        education: prev.education.filter(e => e.id !== id)
      }));
      toast.success("Education deleted");
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">Experience & Education</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your work experience and education history
          </p>
        </div>
        <div className="flex flex-row gap-2">
          <AnimatedButton variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </AnimatedButton>
          <AnimatedButton onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            Save All
          </AnimatedButton>
        </div>
      </div>

      <Tabs defaultValue="experience" className="space-y-6">
        <TabsList>
          <TabsTrigger value="experience">
            <Briefcase className="h-4 w-4 mr-2" />
            Experience
          </TabsTrigger>
          <TabsTrigger value="education">
            <GraduationCap className="h-4 w-4 mr-2" />
            Education
          </TabsTrigger>
        </TabsList>

        {/* Experience Tab */}
        <TabsContent value="experience" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Work Experience</h3>
            <AnimatedButton onClick={openAddExperience} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </AnimatedButton>
          </div>

          <div className="grid gap-4">
            {data.experiences.map((exp) => (
              <GlowCard key={exp.id}>
                <div className="p-4 md:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-semibold">{exp.title}</h4>
                        {exp.current && (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">{exp.company}</p>
                      <p className="text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 inline mr-1" />{exp.location} • <Calendar className="h-3 w-3 inline mr-1" />{formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate || "")}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <AnimatedIconButton
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditExperience(exp)}
                      >
                        <Edit className="h-4 w-4" />
                      </AnimatedIconButton>
                      <AnimatedIconButton
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteExperience(exp.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </AnimatedIconButton>
                    </div>
                  </div>
                </div>
              </GlowCard>
            ))}
            {data.experiences.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No experience added yet</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Education</h3>
            <AnimatedButton onClick={openAddEducation} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </AnimatedButton>
          </div>

          <div className="grid gap-4">
            {data.education.map((edu) => (
              <GlowCard key={edu.id}>
                <div className="p-4 md:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <h4 className="text-lg font-semibold">{edu.degree}</h4>
                      <p className="text-sm font-medium text-muted-foreground">{edu.institution}</p>
                      <p className="text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 inline mr-1" />{edu.location} • <Calendar className="h-3 w-3 inline mr-1" />{formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <AnimatedIconButton
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditEducation(edu)}
                      >
                        <Edit className="h-4 w-4" />
                      </AnimatedIconButton>
                      <AnimatedIconButton
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteEducation(edu.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </AnimatedIconButton>
                    </div>
                  </div>
                </div>
              </GlowCard>
            ))}
            {data.education.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No education added yet</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalType === "experience"
          ? (editingExp ? "Edit Experience" : "Add Experience")
          : (editingEdu ? "Edit Education" : "Add Education")
        }
      >
        {modalType === "experience" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={expForm.title}
                onChange={(e) => setExpForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Senior Full Stack Developer"
              />
            </div>
            <div className="space-y-2">
              <Label>Company *</Label>
              <Input
                value={expForm.company}
                onChange={(e) => setExpForm(prev => ({ ...prev, company: e.target.value }))}
                placeholder="e.g., Tech Company Inc."
              />
            </div>
            <div className="space-y-2">
              <Label>Location *</Label>
              <Input
                value={expForm.location}
                onChange={(e) => setExpForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Remote"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="month"
                  value={expForm.startDate}
                  onChange={(e) => setExpForm(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="month"
                  value={expForm.endDate || ""}
                  onChange={(e) => setExpForm(prev => ({ ...prev, endDate: e.target.value || null }))}
                  disabled={expForm.current}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="current"
                checked={expForm.current}
                onChange={(e) => setExpForm(prev => ({
                  ...prev,
                  current: e.target.checked,
                  endDate: e.target.checked ? null : prev.endDate
                }))}
                className="rounded"
              />
              <Label htmlFor="current" className="cursor-pointer">I currently work here</Label>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={expForm.description}
                onChange={(e) => setExpForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your role and achievements..."
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <AnimatedButton variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </AnimatedButton>
              <AnimatedButton onClick={handleSaveExperience}>
                {editingExp ? "Update" : "Add"}
              </AnimatedButton>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Degree *</Label>
              <Input
                value={eduForm.degree}
                onChange={(e) => setEduForm(prev => ({ ...prev, degree: e.target.value }))}
                placeholder="e.g., Bachelor of Computer Science"
              />
            </div>
            <div className="space-y-2">
              <Label>Institution *</Label>
              <Input
                value={eduForm.institution}
                onChange={(e) => setEduForm(prev => ({ ...prev, institution: e.target.value }))}
                placeholder="e.g., University Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Location *</Label>
              <Input
                value={eduForm.location}
                onChange={(e) => setEduForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., City, State"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="month"
                  value={eduForm.startDate}
                  onChange={(e) => setEduForm(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input
                  type="month"
                  value={eduForm.endDate}
                  onChange={(e) => setEduForm(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <AnimatedButton variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </AnimatedButton>
              <AnimatedButton onClick={handleSaveEducation}>
                {editingEdu ? "Update" : "Add"}
              </AnimatedButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
