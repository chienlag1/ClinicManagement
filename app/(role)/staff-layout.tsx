'use client';

import React from 'react';

import { StaffSidebar } from '@/components/sidebar/staff-sidebar';

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex h-screen bg-gray-50 overflow-hidden'>
      {/* Sidebar */}
      <StaffSidebar />

      {/* Main content */}
      <div className='flex-1 flex flex-col lg:ml-0 ml-16 overflow-hidden'>
        {/* Page content */}
        <main className='flex-1 p-6 overflow-y-auto'>{children}</main>
      </div>
    </div>
  );
}
