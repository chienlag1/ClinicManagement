import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

export function useUserRole() {
  const { userId, isSignedIn, isLoaded } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
        const res = await fetch("/api/role", { cache: "no-store" });

        if (res.ok) {
          const data = await res.json();
          console.log("Role fetched:", data.role); // Debug log
          setRole(data.role);
        } else {
          console.error("Failed to fetch role, status:", res.status);
        }
      } catch (error) {
        console.error("Failed to fetch user role:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRole();
  }, [userId, isSignedIn, isLoaded]);

  return { role, isLoading };
}
