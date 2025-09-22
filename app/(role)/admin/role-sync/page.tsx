"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { RoleSync } from "@/components/role-sync";

export default function RoleSyncPage() {
  const { userId, isSignedIn } = useAuth();
  const [currentRole, setCurrentRole] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRole() {
      if (!userId) return;
      try {
        const res = await fetch("/api/role", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setCurrentRole(data.role);
        }
      } catch (error) {
        console.error("Error fetching role:", error);
      }
    }
    if (isSignedIn) fetchRole();
  }, [userId, isSignedIn]);

  if (!isSignedIn) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Role Sync Management</h1>
        <p>Please sign in to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Role Sync Management</h1>

      <div className="max-w-2xl">
        <RoleSync
          currentRole={currentRole || undefined}
          onRoleUpdate={(newRole) => setCurrentRole(newRole)}
        />

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">How to use:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>
              Click "Check Status" to see if your role in Clerk matches your
              role in the database
            </li>
            <li>
              If they don't match, click "Sync Role" to update your database
              role
            </li>
            <li>
              This is useful when you change your role in Clerk Dashboard but it
              doesn't automatically sync
            </li>
          </ol>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Troubleshooting:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>
              Make sure your webhook is properly configured in Clerk Dashboard
            </li>
            <li>
              Check the webhook URL:{" "}
              <code className="bg-gray-200 px-1 rounded">
                /api/webhooks/clerk
              </code>
            </li>
            <li>
              Ensure the webhook secret is set in your environment variables
            </li>
            <li>Check your server logs for webhook events</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
