import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

export function useUserRole() {
  const { userId, isSignedIn, isLoaded } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only run on client side after mounting
    if (!isMounted) {
      return;
    }

    // Wait for Clerk to load first
    if (!isLoaded) {
      return;
    }

    async function fetchRole() {
      if (!userId || !isSignedIn) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/role', { cache: 'no-store' });

        if (res.ok) {
          const data = await res.json();

          // Debug log - removed console.log
          setRole(data.role);
        } else {
          // Error fetching role - removed console.error
        }
      } catch {
        // Error fetching user role - removed console.error
      } finally {
        setIsLoading(false);
      }
    }

    fetchRole();
  }, [userId, isSignedIn, isLoaded, isMounted]);

  return { role, isLoading };
}
