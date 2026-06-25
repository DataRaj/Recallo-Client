/**
 * Auth store — RAM only, intentionally NOT persisted.
 *
 * Security rationale:
 *  - access_token lives only in memory (reset on page reload → triggers /me refetch).
 *  - refresh_token is stored exclusively in an httpOnly cookie managed by the
 *    Next.js API layer, so it is never accessible from JavaScript.
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AuthUser, AuthState } from '@/types/auth';

interface AuthActions {
    /** Call after a successful login / register / token refresh. */
    setAuth: (user: AuthUser | null, accessToken: string) => void;
    setLoading: (loading: boolean) => void;
    /** Mark that the initial /me hydration attempt has finished (success or fail). */
    setHydrated: (hydrated: boolean) => void;
    /** Clear all auth state (logout). */
    clearAuth: () => void;
}

const initialState: AuthState = {
    user: null,
    accessToken: null,
    isLoading: false,
    isHydrated: false,
};

export const useAuthStore = create<AuthState & AuthActions>()(
    devtools(
        set => ({
            ...initialState,
            setAuth: (user, accessToken) => set({ user, accessToken, isHydrated: true }),
            setLoading: isLoading => set({ isLoading }),
            setHydrated: isHydrated => set({ isHydrated }),
            clearAuth: () => set(initialState),
        }),
        { name: 'AuthStore' },
    ),
);
