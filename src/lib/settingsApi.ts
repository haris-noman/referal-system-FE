import api from "./api";
import type { UserRole } from "./authApi";

// ---------- Profile ----------

export type ApiProfile = {
  id: number;
  email: string;
  full_name: string;
  phone_number: string;
  profile_image: string | null;
  role: UserRole;
};

export type ProfileUpdate = {
  email?: string;
  full_name?: string;
  phone_number?: string;
  profile_image?: File | null;
};

// ---------- Notifications ----------

export type ApiNotifications = {
  email_notifications: boolean;
  referral_approval_alerts: boolean;
  new_referral_alerts: boolean;
  commission_payment_alerts: boolean;
  weekly_summary_reports: boolean;
};

export type NotificationsUpdate = Partial<ApiNotifications>;

// ---------- Appearance ----------

export type AppearanceLanguage = "en" | "es" | "fr" | "ar";

export type ApiAppearance = {
  dark_mode: boolean;
  language: AppearanceLanguage;
  theme_color: string;
};

export type AppearanceUpdate = Partial<ApiAppearance>;

// ---------- Security ----------

export type ApiTwoFactor = {
  two_factor_enabled: boolean;
};

export type ChangePasswordRequest = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

// ---------- Sessions ----------

export type ApiSession = {
  id: number;
  device_info: string;
  ip_address: string | null;
  created_at: string;
  last_activity: string;
  is_active: boolean;
};

export type SessionsPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiSession[];
};

// ---------- Referral Config ----------

export type ReferralCurrency = "USD" | "AUD" | "USDT";

export type ApiReferralConfig = {
  id: number;
  commission_rate: string;
  min_withdrawal_amount: string;
  referral_expiry_days: number;
  auto_approval: boolean;
  currency: ReferralCurrency;
  updated_at: string;
};

export type ReferralConfigUpdate = {
  commission_rate?: string;
  min_withdrawal_amount?: string;
  referral_expiry_days?: number;
  auto_approval?: boolean;
  currency?: ReferralCurrency;
};

// ---------------------------------------------------------------------------

const profileUpdateToFormData = (payload: ProfileUpdate): FormData => {
  const fd = new FormData();
  if (payload.email !== undefined) fd.append("email", payload.email);
  if (payload.full_name !== undefined) fd.append("full_name", payload.full_name);
  if (payload.phone_number !== undefined)
    fd.append("phone_number", payload.phone_number);
  if (payload.profile_image instanceof File) {
    fd.append("profile_image", payload.profile_image);
  }
  return fd;
};

export const settingsApi = {
  profile: {
    get: async (): Promise<ApiProfile> => {
      const res = await api.get<ApiProfile>("/settings/profile/");
      return res.data;
    },
    update: async (payload: ProfileUpdate): Promise<ApiProfile> => {
      const fd = profileUpdateToFormData(payload);
      const res = await api.patch<ApiProfile>("/settings/profile/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
  },

  notifications: {
    get: async (): Promise<ApiNotifications> => {
      const res = await api.get<ApiNotifications>("/settings/notifications/");
      return res.data;
    },
    update: async (
      payload: NotificationsUpdate,
    ): Promise<ApiNotifications> => {
      const res = await api.patch<ApiNotifications>(
        "/settings/notifications/",
        payload,
      );
      return res.data;
    },
  },

  appearance: {
    get: async (): Promise<ApiAppearance> => {
      const res = await api.get<ApiAppearance>("/settings/appearance/");
      return res.data;
    },
    update: async (payload: AppearanceUpdate): Promise<ApiAppearance> => {
      const res = await api.patch<ApiAppearance>(
        "/settings/appearance/",
        payload,
      );
      return res.data;
    },
  },

  twoFactor: {
    get: async (): Promise<ApiTwoFactor> => {
      const res = await api.get<ApiTwoFactor>("/settings/security/2fa/");
      return res.data;
    },
    set: async (enabled: boolean): Promise<ApiTwoFactor> => {
      const res = await api.post<{
        detail: string;
        two_factor_enabled: boolean;
      }>("/settings/security/2fa/", { two_factor_enabled: enabled });
      return { two_factor_enabled: res.data.two_factor_enabled };
    },
  },

  changePassword: async (payload: ChangePasswordRequest): Promise<string> => {
    const res = await api.post<{ detail: string }>(
      "/settings/security/change-password/",
      payload,
    );
    return res.data.detail;
  },

  sessions: {
    list: async (page = 1): Promise<SessionsPage> => {
      const res = await api.get<SessionsPage>("/settings/sessions/", {
        params: { page },
      });
      return res.data;
    },
    logoutAll: async (): Promise<string> => {
      const res = await api.post<{ detail: string }>(
        "/settings/sessions/logout-all/",
      );
      return res.data.detail;
    },
  },

  referralConfig: {
    get: async (): Promise<ApiReferralConfig> => {
      const res = await api.get<ApiReferralConfig>(
        "/settings/referral-config/",
      );
      return res.data;
    },
    update: async (
      payload: ReferralConfigUpdate,
    ): Promise<ApiReferralConfig> => {
      const res = await api.patch<ApiReferralConfig>(
        "/settings/referral-config/",
        payload,
      );
      return res.data;
    },
  },
};

/**
 * Extracts a user-friendly error message out of an axios error. Handles DRF
 * `detail`, `error`, top-level non_field_errors, and the first field-specific
 * error (so an inline field validation message can surface as a toast).
 */
export const extractSettingsError = (
  err: unknown,
  fallback: string,
): string => {
  const e = err as {
    response?: { data?: Record<string, unknown> | string };
    message?: string;
  };
  const data = e?.response?.data;
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    if (typeof data.detail === "string") return data.detail as string;
    if (typeof data.error === "string") return data.error as string;
    if (Array.isArray(data.non_field_errors) && data.non_field_errors[0])
      return String(data.non_field_errors[0]);
    for (const [, v] of Object.entries(data)) {
      if (Array.isArray(v) && typeof v[0] === "string") return v[0];
      if (typeof v === "string") return v;
    }
  }
  return e?.message ?? fallback;
};
