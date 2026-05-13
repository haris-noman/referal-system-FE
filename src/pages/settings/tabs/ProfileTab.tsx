import { useEffect, useRef, useState } from "react";
import {
  User,
  Camera,
  Save,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { SettingCard, Field } from "../../../components/settings/SettingCard";
import { settingsApi, extractSettingsError } from "../../../lib/settingsApi";

type FormState = {
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  avatarUrl: string | null; // server-provided URL
  avatarFile: File | null; // newly selected file pending upload
  avatarPreview: string | null; // local preview when avatarFile is set
};

const INITIAL: FormState = {
  fullName: "",
  email: "",
  phoneNumber: "",
  role: "partner",
  avatarUrl: null,
  avatarFile: null,
  avatarPreview: null,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\d][\d\s().-]{6,}$/;

const ROLE_LABEL: Record<string, string> = {
  partner: "Partner",
  admin: "Administrator",
};

const initialsFrom = (name: string): string =>
  name
    ?.split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "U";

const ProfileTab = () => {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<
    Partial<Record<"fullName" | "email" | "phoneNumber" | "avatar", string>>
  >({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await settingsApi.profile.get();
        if (cancelled) return;
        setForm((prev) => ({
          ...prev,
          fullName: p.full_name ?? "",
          email: p.email ?? "",
          phoneNumber: p.phone_number ?? "",
          role: p.role ?? "partner",
          avatarUrl: p.profile_image,
          avatarFile: null,
          avatarPreview: null,
        }));
      } catch (err) {
        if (!cancelled)
          setLoadError(extractSettingsError(err, "Failed to load profile."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Release the object URL when the user replaces it or unmounts the tab.
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    if ((errors as Record<string, unknown>)[key])
      setErrors((p) => ({ ...p, [key]: undefined }));
    setSaved(false);
    setSubmitError(null);
  };

  const onUpload = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((p) => ({ ...p, avatar: "Please choose an image file." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, avatar: "Image must be 5MB or smaller." }));
      return;
    }
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setErrors((p) => ({ ...p, avatar: undefined }));
    setForm((p) => ({ ...p, avatarFile: file, avatarPreview: url }));
    setSaved(false);
  };

  const removeAvatar = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setForm((p) => ({
      ...p,
      avatarFile: null,
      avatarPreview: null,
      avatarUrl: null, // server image hidden; will refresh on next save
    }));
    setSaved(false);
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!EMAIL_RE.test(form.email.trim()))
      next.email = "Enter a valid email.";
    if (form.phoneNumber && !PHONE_RE.test(form.phoneNumber.trim()))
      next.phoneNumber = "Enter a valid phone number.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSubmitError(null);

    try {
      const updated = await settingsApi.profile.update({
        full_name: form.fullName.trim(),
        email: form.email.trim(),
        phone_number: form.phoneNumber.trim(),
        ...(form.avatarFile ? { profile_image: form.avatarFile } : {}),
      });
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
      setForm((p) => ({
        ...p,
        fullName: updated.full_name ?? p.fullName,
        email: updated.email ?? p.email,
        phoneNumber: updated.phone_number ?? p.phoneNumber,
        role: updated.role ?? p.role,
        avatarUrl: updated.profile_image,
        avatarFile: null,
        avatarPreview: null,
      }));
      try {
        const raw = localStorage.getItem("user");
        const stored = raw ? JSON.parse(raw) : {};
        const merged = {
          ...stored,
          full_name: updated.full_name,
          email: updated.email,
          role: updated.role,
          profile_image: updated.profile_image,
          phone_number: updated.phone_number,
        };
        localStorage.setItem("user", JSON.stringify(merged));
        // Notify the layout so the header avatar/name refresh immediately.
        window.dispatchEvent(
          new CustomEvent("profile-updated", { detail: merged }),
        );
      } catch {
        /* ignore */
      }
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSubmitError(extractSettingsError(err, "Failed to save profile."));
    } finally {
      setSaving(false);
    }
  };

  const initials = initialsFrom(form.fullName);
  const displayAvatar = form.avatarPreview || form.avatarUrl;

  if (loading) {
    return (
      <div className="bg-white border border-line rounded-card p-16 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-white border border-line rounded-card p-10 text-center">
        <AlertCircle className="w-8 h-8 mx-auto text-red-500" strokeWidth={1.5} />
        <p className="mt-3 text-sm font-medium text-ink">
          Couldn't load profile
        </p>
        <p className="mt-1 text-[12.5px] text-muted">{loadError}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSave} className="space-y-5" noValidate>
      <SettingCard
        title="Profile Settings"
        description="Update your personal information and how your account appears across the portal."
        icon={User}
      >
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-line-soft flex items-center justify-center overflow-hidden border border-line">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[20px] font-bold text-muted">
                    {initials}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-ink text-white flex items-center justify-center shadow-sm hover:bg-black transition-colors"
                aria-label="Upload new photo"
              >
                <Camera className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
              />
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="btn-secondary"
              >
                <Camera className="w-3.5 h-3.5" strokeWidth={2} />
                Upload Photo
              </button>
              {(form.avatarFile || form.avatarUrl) && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="inline-flex items-center gap-1.5 text-[11px] text-muted hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" strokeWidth={2} />
                  Remove
                </button>
              )}
              {errors.avatar && (
                <p className="flex items-center gap-1 text-[11px] text-red-600">
                  <AlertCircle className="w-3 h-3" strokeWidth={2} />
                  {errors.avatar}
                </p>
              )}
              <p className="text-[11px] text-muted-2 max-w-xs">
                PNG, JPG up to 5MB. A square image works best.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 w-full">
            <Field label="Full Name" required error={errors.fullName}>
              <input
                type="text"
                className={cn("field", errors.fullName && "border-red-500")}
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
              />
            </Field>
            <Field label="Email Address" required error={errors.email}>
              <input
                type="email"
                className={cn("field", errors.email && "border-red-500")}
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </Field>
            <Field label="Phone Number" error={errors.phoneNumber}>
              <input
                type="tel"
                className={cn("field", errors.phoneNumber && "border-red-500")}
                value={form.phoneNumber}
                onChange={(e) => update("phoneNumber", e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </Field>
            <Field
              label="Role"
              hint="Role assignments are managed by an administrator."
            >
              <div className="field flex items-center justify-between bg-line-soft/40 cursor-not-allowed">
                <span className="text-ink-soft">
                  {ROLE_LABEL[form.role] ?? form.role}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] bg-line-soft text-muted">
                  Read only
                </span>
              </div>
            </Field>
          </div>
        </div>
      </SettingCard>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-card px-4 py-2.5 flex items-center gap-2 text-[12.5px] font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
          {submitError}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-[12px] text-(--color-success-fg)">
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
            Changes saved
          </span>
        )}
        <button
          type="submit"
          disabled={saving}
          className="btn-primary min-w-[150px]"
        >
          {saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" strokeWidth={2} />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProfileTab;
