'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/LoginForm';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
   
    const user = localStorage.getItem('user');
    if (user) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-6 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-xl">
        <LoginForm />
        
     
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
          <p>Demo credentials:</p>
          <p>Email: demo@example.com</p>
          <p>Password: demo123</p>
        </div>
      </div>
    </main>
  );
}