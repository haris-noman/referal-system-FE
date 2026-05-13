import { useRef, useState } from "react";
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

const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
];

const INITIAL = {
  fullName: "Pedro Alvarez",
  email: "pedro.alvarez@networkportal.com",
  phone: "+1 (415) 555-0142",
  role: "user",
  avatar: null as string | null,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\d][\d\s().-]{6,}$/;

const ProfileTab = () => {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof INITIAL, string>>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof typeof INITIAL>(key: K, value: (typeof INITIAL)[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
    setSaved(false);
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
    const url = URL.createObjectURL(file);
    setErrors((p) => ({ ...p, avatar: undefined }));
    setForm((p) => ({ ...p, avatar: url }));
  };

  const initials = form.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const validate = () => {
    const next: Partial<Record<keyof typeof INITIAL, string>> = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!EMAIL_RE.test(form.email.trim())) next.email = "Enter a valid email.";
    if (!form.phone.trim()) next.phone = "Phone number is required.";
    else if (!PHONE_RE.test(form.phone.trim())) next.phone = "Enter a valid phone number.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

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
                {form.avatar ? (
                  <img
                    src={form.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[20px] font-bold text-muted">
                    {initials || "U"}
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
              {form.avatar && (
                <button
                  type="button"
                  onClick={() => update("avatar", null)}
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
            <Field label="Phone Number" required error={errors.phone}>
              <input
                type="tel"
                className={cn("field", errors.phone && "border-red-500")}
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </Field>
            <Field label="Role" hint="Role assignments are managed by an administrator.">
              <select
                className="field appearance-none bg-no-repeat bg-[right_0.75rem_center]"
                value={form.role}
                onChange={(e) => update("role", e.target.value)}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      </SettingCard>

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-[12px] text-(--color-success-fg)">
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
            Changes saved
          </span>
        )}
        <button type="submit" disabled={saving} className="btn-primary min-w-[150px]">
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
