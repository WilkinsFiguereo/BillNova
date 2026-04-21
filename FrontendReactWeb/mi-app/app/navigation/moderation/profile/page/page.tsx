"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  Save,
  X,
  User,
  Mail,
  Phone,
  Building,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useSession } from "@/features/auth/login/hooks/useSession";
import { Sidebar } from "@/features/seller/dashboard/dashboards";
import { MODERATOR_NAV_ITEMS } from "@/features/moderator/moderationNav";
import { dashboardTheme as t, globalStyles } from "@/features/seller/dashboard/theme/dashboard.theme";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, updateProfile } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!isLoading && user && !initialized) {
      setFormData({
        name: user.name || user.email?.split("@")[0] || "",
        email: user.email || "",
        phone: user.phone || "",
        department: user.companyName || "",
      });
      setInitialized(true);
    }
  }, [user, isLoading, initialized]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSaveStatus("idle");
  };

  const handleSave = async () => {
    if (!formData.name.trim() && !formData.phone.trim()) return;
    setIsSaving(true);
    setSaveStatus("idle");
    
    try {
      const result = await updateProfile({
        name: formData.name,
        phone: formData.phone,
      });
      
      if (result.ok) {
        setSaveStatus("success");
        setIsEditing(false);
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const initials = formData.name
    ? formData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        background: t.bgMain,
        color: t.textPrimary,
      }}
    >
      <style>{globalStyles(t)}</style>
      <Sidebar navItems={MODERATOR_NAV_ITEMS} />

      <main style={{ flex: 1, overflow: "auto", padding: "32px" }}>
        <div style={{ marginBottom: 20 }}>
          <h1
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: t.textSecondary,
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Configuración
          </h1>
          <p
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: t.textPrimary,
              margin: "4px 0 0",
            }}
          >
            Mi Perfil
          </p>
        </div>

        <div
          style={{
            background: t.bgCard,
            borderRadius: 12,
            border: `1px solid ${t.border}`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: 24,
              borderBottom: `1px solid ${t.border}`,
            }}
          >
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${t.brand600}, ${t.brand400})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  initials
                )}
              </div>
              {isEditing && (
                <label
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: t.brand600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  <Camera size={14} color="white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
                {formData.name || "Usuario"}
              </h2>
              <p style={{ fontSize: 14, color: t.textSecondary, margin: "4px 0 0" }}>
                {formData.department || "Moderador"}
              </p>
            </div>
            <button
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
              disabled={isSaving}
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "none",
                background: isEditing ? t.success : t.brand600,
                color: "white",
                fontSize: 14,
                fontWeight: 500,
                cursor: isSaving ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                opacity: isSaving ? 0.7 : 1,
              }}
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  Guardando...
                </>
              ) : isEditing ? (
                <>
                  <Save size={16} />
                  Guardar
                </>
              ) : (
                "Editar Perfil"
              )}
            </button>
          </div>

          <div style={{ padding: 24 }}>
            <ProfileField
              icon={User}
              label="Nombre"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
            <ProfileField
              icon={Mail}
              label="Correo Electrónico"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              type="email"
            />
            <ProfileField
              icon={Phone}
              label="Teléfono"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              type="tel"
            />
            <ProfileField
              icon={Building}
              label="Empresa"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <div
              style={{
                padding: "0 24px 24px",
                display: "flex",
                gap: 12,
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: `1px solid ${t.border}`,
                  background: "transparent",
                  color: t.textSecondary,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <X size={16} />
                Cancelar
              </button>
            </div>
          )}
        </div>

        <div style={{ marginTop: 24 }}>
          <button
            onClick={() => router.push("/navigation/moderation/config/page")}
            style={{
              padding: "12px 20px",
              borderRadius: 8,
              border: "none",
              background: "transparent",
              color: t.textSecondary,
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <ArrowLeft size={18} />
            Volver a Configuración
          </button>
        </div>

        {saveStatus !== "idle" && (
          <div
            style={{
              position: "fixed",
              bottom: 24,
              right: 24,
              padding: "14px 20px",
              borderRadius: 12,
              background: saveStatus === "success" ? t.success : t.error,
              color: "white",
              fontSize: 14,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 10,
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              animation: "slideIn 0.3s ease",
            }}
          >
            {saveStatus === "success" ? (
              <>
                <CheckCircle size={18} />
                Perfil actualizado correctamente
              </>
            ) : (
              <>
                <AlertCircle size={18} />
                Error al guardar cambios
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function ProfileField({
  icon: Icon,
  label,
  name,
  value,
  onChange,
  disabled,
  type = "text",
}: {
  icon: React.ElementType;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px 0",
        borderBottom: `1px solid ${t.border}`,
      }}
    >
      <Icon size={20} style={{ color: t.textSecondary }} />
      <div style={{ flex: 1 }}>
        <label
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: t.textSecondary,
            display: "block",
            marginBottom: 4,
          }}
        >
          {label}
        </label>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          style={{
            width: "100%",
            padding: "8px 0",
            border: "none",
            background: "transparent",
            fontSize: 15,
            color: disabled ? t.textSecondary : t.textPrimary,
            fontFamily: "inherit",
            outline: "none",
          }}
        />
      </div>
    </div>
  );
}
