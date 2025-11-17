'use client';

import { useState } from 'react';
import { Button } from '@heroui/button';
import { useAuth } from '@clerk/nextjs';

interface RoleSyncProps {
  currentRole?: string;
  onRoleUpdate?: (newRole: string) => void;
}

export function RoleSync({ currentRole, onRoleUpdate }: RoleSyncProps) {
  const { userId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [syncInfo, setSyncInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkSyncStatus = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sync-role');
      const data = await response.json();

      if (response.ok) {
        setSyncInfo(data);
      } else {
        setError(data.error || 'Failed to check sync status');
      }
    } catch {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const syncRole = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sync-role', {
        method: 'POST',
      });
      const data = await response.json();

      if (response.ok) {
        setSyncInfo(data);
        if (onRoleUpdate) {
          onRoleUpdate(data.role);
        }
      } else {
        setError(data.error || 'Failed to sync role');
      }
    } catch {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='space-y-4 p-4 border rounded-lg'>
      <h3 className='text-lg font-semibold'>Role Sync Status</h3>

      {currentRole && (
        <div className='text-sm'>
          <strong>Current Role:</strong> {currentRole}
        </div>
      )}

      {syncInfo && (
        <div className='space-y-2 text-sm'>
          <div>
            <strong>Clerk Role:</strong> {syncInfo.clerkRole}
          </div>
          <div>
            <strong>Database Role:</strong> {syncInfo.dbRole}
          </div>
          <div
            className={`font-medium ${syncInfo.isSynced ? 'text-green-600' : 'text-red-600'}`}
          >
            Status: {syncInfo.isSynced ? 'Synced' : 'Out of sync'}
          </div>
        </div>
      )}

      {error && <div className='text-red-600 text-sm'>Error: {error}</div>}

      <div className='flex gap-2'>
        <Button
          isLoading={isLoading}
          size='sm'
          variant='bordered'
          onPress={checkSyncStatus}
        >
          Check Status
        </Button>

        <Button
          color='primary'
          isLoading={isLoading}
          size='sm'
          onPress={syncRole}
        >
          Sync Role
        </Button>
      </div>
    </div>
  );
}
