/**
 * Get base URL for the application
 * Works in both server and client components
 */
export function getBaseUrl() {
  // Browser should use relative URL
  if (typeof window !== 'undefined') return '';
  
  // SSR should use NEXT_PUBLIC_BASE_URL if set
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  
  // Reference for Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Assume localhost
  return 'http://localhost:3000';
}

/**
 * Get absolute URL for server-side redirects and webhooks
 */
export function getAbsoluteUrl(path: string = '') {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${path}`;
}
