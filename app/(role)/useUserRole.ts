import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

export function useUserRole() {
  const { userId, isSignedIn } = useAuth();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRole() {
      if (!userId) return;
      const res = await fetch("/api/role", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setRole(data.role);
      }
    }
    if (isSignedIn) fetchRole();
  }, [userId, isSignedIn]);

  return role;
}
