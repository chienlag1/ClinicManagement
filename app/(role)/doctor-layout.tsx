'use client';

import React from 'react';

import { DoctorSidebar } from '@/components/sidebar/doctor-sidebar';

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex h-screen bg-gray-50 overflow-hidden'>
      {/* Sidebar */}
      <DoctorSidebar />

      {/* Main content */}
      <div className='flex-1 flex flex-col lg:ml-0 ml-16 overflow-hidden'>
        {/* Top bar */}
        <header className='bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0'>
          <div className='flex items-center justify-between'>
            <h1 className='text-xl font-semibold text-gray-800'>
              Doctor Dashboard
            </h1>
            <div className='flex items-center gap-4'>
              <div className='text-sm text-gray-500'>Welcome back, Doctor!</div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className='flex-1 p-6 overflow-y-auto'>{children}</main>
      </div>
    </div>
  );
}
