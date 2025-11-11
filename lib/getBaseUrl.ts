/**
 * Get base URL for the application
 * Works in both server and client components
 */
export function getBaseUrl() {
  // Browser should use relative URL
  if (typeof window !== 'undefined') return '';
  
  // SSR should use NEXT_PUBLIC_BASE_URL if set
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    console.log('Using NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  
  // Reference for Vercel
  if (process.env.VERCEL_URL) {
    const url = `https://${process.env.VERCEL_URL}`;
    console.log('Using VERCEL_URL:', url);
    return url;
  }
  
  // Assume localhost
  console.log('Using localhost fallback');
  return 'http://localhost:3000';
}

/**
 * Get absolute URL for server-side redirects and webhooks
 */
export function getAbsoluteUrl(path: string = '') {
  const baseUrl = getBaseUrl();
  const fullUrl = `${baseUrl}${path}`;
  console.log('Generated absolute URL:', fullUrl);
  return fullUrl;
}
