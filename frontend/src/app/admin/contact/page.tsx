"use client";

import { useState, useEffect } from "react";
import { GlowCard } from "@/components/ui/glow-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedButton, AnimatedIconButton } from "@/components/ui/animated-button";
import { Save, RefreshCw, Plus, Trash2, Mail, Phone, MapPin, Edit } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/admin/modal";

interface ContactInfo {
  id: string;
  type: "Email" | "Phone" | "Location";
  value: string;
  href: string | null;
  icon: "mail" | "phone" | "map-pin";
}

const iconMap = {
  mail: Mail,
  phone: Phone,
  "map-pin": MapPin,
};

const colorMap = {
  Email: "from-blue-500 to-cyan-500",
  Phone: "from-green-500 to-emerald-500",
  Location: "from-purple-500 to-violet-500",
};

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ContactInfo>({
    id: "",
    type: "Email",
    value: "",
    href: "",
    icon: "mail",
  });

  useEffect(() => {
    loadContactInfo();
  }, []);

  const loadContactInfo = async () => {
    try {
      const response = await fetch("/api/contact-info");
      const data = await response.json();
      setContactInfo(data);
    } catch (error) {
      console.error("Failed to load contact info:", error);
      toast.error("Failed to load contact info");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/contact-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactInfo),
      });

      if (response.ok) {
        toast.success("Contact info saved successfully!");
      } else {
        toast.error("Failed to save contact info");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save contact info");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      id: Date.now().toString(),
      type: "Email",
      value: "",
      href: "",
      icon: "mail",
    });
    setModalOpen(true);
  };

  const handleEdit = (info: ContactInfo) => {
    setEditingId(info.id);
    setFormData({ ...info });
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this contact info?")) {
      setContactInfo((prev) => prev.filter((item) => item.id !== id));
      toast.success("Contact info deleted");
    }
  };

  const handleModalSave = () => {
    if (!formData.value) {
      toast.error("Please fill in the value");
      return;
    }

    if (editingId) {
      setContactInfo((prev) =>
        prev.map((item) => (item.id === editingId ? formData : item))
      );
      toast.success("Contact info updated");
    } else {
      setContactInfo((prev) => [...prev, formData]);
      toast.success("Contact info added");
    }
    setModalOpen(false);
  };

  const handleTypeChange = (type: "Email" | "Phone" | "Location") => {
    const iconMap: Record<string, "mail" | "phone" | "map-pin"> = {
      Email: "mail",
      Phone: "phone",
      Location: "map-pin",
    };
    
    const hrefMap: Record<string, string> = {
      Email: "mailto:",
      Phone: "tel:",
      Location: "",
    };

    setFormData((prev) => ({
      ...prev,
      type,
      icon: iconMap[type],
      href: type === "Location" ? null : hrefMap[type] + prev.value,
    }));
  };

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">Contact Information</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage contact information displayed on the homepage
          </p>
        </div>
        <div className="flex flex-row gap-2">
          <AnimatedButton variant="outline" onClick={loadContactInfo}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </AnimatedButton>
          <AnimatedButton onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </AnimatedButton>
        </div>
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <AnimatedButton onClick={handleAdd} hoverScale={1.05}>
          <Plus className="h-4 w-4 mr-2" />
          Add Contact Info
        </AnimatedButton>
      </div>

      {/* Contact Info Grid */}
      <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {contactInfo.map((info) => {
          const Icon = iconMap[info.icon];
          const colorClass = colorMap[info.type];

          return (
            <GlowCard key={info.id} hoverScale={1.02}>
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${colorClass}`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{info.type}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {info.value}
                      </p>
                    </div>
                  </div>
                </div>

                {info.href && (
                  <a
                    href={info.href}
                    className="text-xs text-primary hover:underline block truncate"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {info.href}
                  </a>
                )}

                <div className="flex gap-2 pt-2 border-t">
                  <AnimatedButton
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(info)}
                    className="flex-1"
                    hoverScale={1.05}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </AnimatedButton>
                  <AnimatedIconButton
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(info.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    hoverScale={1.1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </AnimatedIconButton>
                </div>
              </div>
            </GlowCard>
          );
        })}

        {contactInfo.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <p>No contact information added yet</p>
            <p className="text-sm mt-2">Click "Add Contact Info" to get started</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Contact Info" : "Add Contact Info"}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["Email", "Phone", "Location"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.type === type
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    {type === "Email" && <Mail className="h-5 w-5" />}
                    {type === "Phone" && <Phone className="h-5 w-5" />}
                    {type === "Location" && <MapPin className="h-5 w-5" />}
                    <span className="text-xs font-medium">{type}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Value *</Label>
            <Input
              value={formData.value}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, value: e.target.value }))
              }
              placeholder={
                formData.type === "Email"
                  ? "your@email.com"
                  : formData.type === "Phone"
                  ? "+1 (234) 567-890"
                  : "City, Country"
              }
            />
          </div>

          {formData.type !== "Location" && (
            <div className="space-y-2">
              <Label>Link (href)</Label>
              <Input
                value={formData.href || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, href: e.target.value }))
                }
                placeholder={
                  formData.type === "Email"
                    ? "mailto:your@email.com"
                    : "tel:+1234567890"
                }
              />
              <p className="text-xs text-muted-foreground">
                {formData.type === "Email"
                  ? "Format: mailto:your@email.com"
                  : "Format: tel:+1234567890"}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <AnimatedButton
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </AnimatedButton>
            <AnimatedButton onClick={handleModalSave} className="flex-1">
              {editingId ? "Update" : "Add"}
            </AnimatedButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
