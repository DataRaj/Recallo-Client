/**
 * Type-safe route definitions
 * Use these instead of hardcoding route paths
 */

export const ROUTES = {
  // Marketing/Public
  HOME_PAGE: '/',

  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  OAUTH_SUCCESS: '/oauth/success',

  // Protected - Dashboard
  HOME: '/home',
  SETTINGS: '/settings',

  // Protected - Meetings
  MEETINGS: '/meetings',
  MEETING_DETAIL: (roomId: string) => `/meeting/${roomId}`,

  // Protected - Webinars
  WEBINARS: '/webinars',
  WEBINAR_DETAIL: (roomId: string) => `/webinar/${roomId}`,

  // Protected - Chat
  CHATS: '/chat',
  CHAT_CONVERSATION: (conversationId: string) => `/chat/${conversationId}`,

  // Protected - Archive
  TRANSCRIPTS: '/transcripts',
  TRANSCRIPT_DETAIL: (meetingId: string) => `/transcripts/${meetingId}`,
  SUMMARIES: '/summaries',
  SUMMARY_DETAIL: (meetingId: string) => `/summaries/${meetingId}`,

  // API
  API_AUTH_LOGIN: '/api/auth/login',
  API_AUTH_REGISTER: '/api/auth/register',
  API_AUTH_LOGOUT: '/api/auth/logout',
  API_AUTH_REFRESH: '/api/auth/refresh',
  API_CHAT_MESSAGES: (conversationId: string) => `/api/chat/${conversationId}/messages`,
  API_CHAT_CONVERSATIONS: '/api/chat/conversations',
  API_ROOMS_CREATE: '/api/rooms/create',
  API_ROOMS_JOIN: '/api/rooms/join',
} as const;

/**
 * Route patterns for protected vs public routes
 */
export const PROTECTED_ROUTES = [
  ROUTES.HOME,
  ROUTES.MEETINGS,
  ROUTES.WEBINARS,
  ROUTES.CHATS,
  ROUTES.CHAT_CONVERSATION('*'),
  ROUTES.TRANSCRIPTS,
  ROUTES.TRANSCRIPT_DETAIL('*'),
  ROUTES.SUMMARIES,
  ROUTES.SUMMARY_DETAIL('*'),
  ROUTES.SETTINGS,
];

export const AUTH_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.OAUTH_SUCCESS,
];

export const PUBLIC_ROUTES = [
  ROUTES.HOME_PAGE,
  ROUTES.MEETING_DETAIL('*'),
  ROUTES.WEBINAR_DETAIL('*'),
];

/**
 * Check if a route is protected (requires authentication)
 */
export function isProtectedRoute(pathname: string): boolean {
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[a-z]{2})?(?=\/|$)/i, '') || '/';
  return PROTECTED_ROUTES.some((pattern) => {
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    return regex.test(pathWithoutLocale) || regex.test(pathname);
  });
}

/**
 * Check if a route is an auth route
 */
export function isAuthRoute(pathname: string): boolean {
  // Pathname might have a locale prefix (e.g., /en/login)
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[a-z]{2})?(?=\/|$)/i, '') || '/';
  return AUTH_ROUTES.some(route => pathWithoutLocale.startsWith(route) || pathname.startsWith(route));
}

/**
 * Check if a route is public
 */
export function isPublicRoute(pathname: string): boolean {
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[a-z]{2})?(?=\/|$)/i, '') || '/';
  return PUBLIC_ROUTES.some((pattern) => {
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    return regex.test(pathWithoutLocale) || regex.test(pathname);
  });
}
