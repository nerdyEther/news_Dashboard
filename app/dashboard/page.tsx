
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import FilterSection from '@/components/FilterSection';
import NewsSection from '@/components/NewsSection';
import PayoutSection from '@/components/PayoutSection';
import { FilterProvider } from '@/components/contexts/FilterContext';

interface User {
  email: string;
  name: string;
  isAdmin?: boolean;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  if (!user) return null;

  return (
    <FilterProvider>
      <div className="min-h-screen 
        bg-gradient-to-b 
        from-gray-50 to-white 
        dark:bg-gradient-to-b 
        dark:from-gray-900 dark:to-black">
        <Navbar 
          userName={user.name || user.email.split('@')[0]} 
          isAdmin={user.isAdmin}
        />
        
      
        <main className="pt-20 pb-6">
          <div className="container max-w-7xl mx-auto px-4">
            <FilterSection />
            
           
            <div className="grid lg:grid-cols-2 gap-6">
             
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 ml-5">News & Updates</h2>
                <div className="
                  bg-white/50 dark:bg-gray-800/50 
                  backdrop-blur-sm 
                  rounded-lg 
                  shadow-sm 
                  dark:shadow-xl">
                  <NewsSection />
                </div>
              </div>

           
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Payout Analytics</h2>
                <div className="
                  bg-white/50 dark:bg-gray-800/50 
                  backdrop-blur-sm 
                  rounded-lg 
                  shadow-sm 
                  dark:shadow-xl">
                  <PayoutSection />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </FilterProvider>
  );
}