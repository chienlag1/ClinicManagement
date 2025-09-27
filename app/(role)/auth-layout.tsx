'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Link } from '@heroui/link';
import { Spinner } from '@heroui/spinner';
import dynamic from 'next/dynamic';

import { useUserRole } from './useUserRole';

import { Navbar } from '@/components/navbar';
const StaffLayout = dynamic(() => import('./staff-layout'));
const DoctorLayout = dynamic(() => import('./doctor-layout'));

export function AuthAwareChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth =
    pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up');
  const { role, isLoading } = useUserRole();

  // Show loading spinner while determining user role or auth state
  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-screen bg-gray-50'>
        <div className='flex flex-col items-center gap-4'>
          <Spinner color='primary' size='lg' />
          <p className='text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuth) {
    return (
      <div className='relative flex flex-col h-screen'>
        <main className='container mx-auto max-w-7xl pt-8 px-6 flex-grow'>
          {children}
        </main>
      </div>
    );
  }

  // Debug log - removed console.log

  if (role === 'staff') {
    return <StaffLayout>{children}</StaffLayout>;
  }
  if (role === 'doctor') {
    return <DoctorLayout>{children}</DoctorLayout>;
  }

  return (
    <div className='relative flex flex-col h-screen'>
      <Navbar />
      <main className='container mx-auto max-w-7xl pt-16 px-6 flex-grow'>
        {children}
      </main>
      <footer className='w-full flex items-center justify-center py-3'>
        <Link
          isExternal
          className='flex items-center gap-1 text-current'
          href='https://heroui.com?utm_source=next-app-template'
          title='heroui.com homepage'
        >
          <span className='text-default-600'>Powered by</span>
          <p className='text-primary'>HeroUI</p>
        </Link>
      </footer>
    </div>
  );
}
