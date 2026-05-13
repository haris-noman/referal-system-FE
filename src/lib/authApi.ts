import api from "./api";

export type UserRole = "partner" | "admin";

export type LoginRequest = {
  email: string;
  password: string;
};

/**
 * Two-shape response from POST /auth/login/:
 * - 2FA disabled → `access` is set, `requires_2fa` is false/missing.
 * - 2FA enabled  → `access` is null, `requires_2fa: true`, and a `temp_token`
 *   is returned to use with /auth/verify-2fa/.
 */
export type LoginResponse = {
  access: string | null;
  role: UserRole | null;
  full_name: string | null;
  two_factor_enabled: boolean | null;
  requires_2fa: boolean | null;
  temp_token: string | null;
  detail: string | null;
};

export type Verify2FARequest = {
  temp_token: string;
  code: string;
};

export type Verify2FAResponse = {
  access: string;
  role: UserRole;
  full_name: string;
};

export type AuthProfile = {
  email: string;
  full_name: string;
  role: UserRole;
};

export const authApi = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>("/auth/login/", payload);
    return res.data;
  },

  verify2fa: async (payload: Verify2FARequest): Promise<Verify2FAResponse> => {
    const res = await api.post<Verify2FAResponse>(
      "/auth/verify-2fa/",
      payload,
    );
    return res.data;
  },

  profile: async (): Promise<AuthProfile> => {
    const res = await api.get<AuthProfile>("/auth/profile/");
    return res.data;
  },
};

/**
 * Centralized session bootstrap so login and 2FA paths agree on what we
 * persist for `ProtectedRoute` and the layout to read back later.
 */
export const persistSession = (data: {
  access: string;
  role: UserRole;
  full_name: string;
  email?: string;
}) => {
  localStorage.setItem("access_token", data.access);
  localStorage.setItem(
    "user",
    JSON.stringify({
      role: data.role,
      full_name: data.full_name,
      ...(data.email ? { email: data.email } : {}),
    }),
  );
};
