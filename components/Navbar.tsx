'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

interface NavbarProps {
  userName?: string;
  isAdmin?: boolean;
}

export default function Navbar({ userName = 'Demo User', isAdmin = false }: NavbarProps) {
  console.log('Username received:', userName);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 border-b 
        bg-blue-50/30 dark:bg-gray-900/30 
        backdrop-blur-md 
        supports-[backdrop-filter]:bg-blue-50/30 
        dark:supports-[backdrop-filter]:bg-gray-900/30"
    >
      <div className="flex h-16 items-center px-4 sm:px-6 container max-w-7xl mx-auto">
        
        <div className="flex items-center flex-1">
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.02 }}
          >
            <span className="font-bold text-xl sm:text-2xl 
              bg-gradient-to-r from-blue-600 to-blue-400 
              text-transparent bg-clip-text">
              NewsFlow
            </span>
          </motion.div>
          
        
          <div className="hidden lg:flex items-center space-x-6 ml-8">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              className="text-sm font-medium 
                text-blue-600/80 dark:text-blue-400/80 
                hover:text-blue-700 dark:hover:text-blue-500 
                transition-colors"
            >
              Dashboard
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              className="text-sm font-medium 
                text-blue-600/80 dark:text-blue-400/80 
                hover:text-blue-700 dark:hover:text-blue-500 
                transition-colors"
            >
              Analytics
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              className="text-sm font-medium 
                text-blue-600/80 dark:text-blue-400/80 
                hover:text-blue-700 dark:hover:text-blue-500 
                transition-colors"
            >
              Reports
            </motion.button>
          </div>
        </div>

       
        <div className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mr-2 text-blue-600 dark:text-blue-400"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

       
        <div className="flex items-center space-x-2 sm:space-x-4">
         
          <div className="mr-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="
                text-blue-600 dark:text-blue-400 
                hover:bg-blue-100 dark:hover:bg-gray-800 
                transition-colors"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button 
                  variant="ghost" 
                  className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full 
                    hover:bg-blue-100/50 dark:hover:bg-gray-800/50"
                >
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 
                    ring-2 ring-blue-500/20 dark:ring-blue-400/20">
                    <AvatarFallback className="
                      bg-gradient-to-br from-blue-500 to-blue-400 
                      text-white text-xs sm:text-sm">
                      {userName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-56 
                bg-white dark:bg-gray-900 
                border dark:border-gray-700" 
              align="end" 
              forceMount
            >
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium dark:text-gray-100">{userName}</p>
                  {isAdmin && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      Admin
                    </p>
                  )}
                </div>
              </div>
              <DropdownMenuItem
                className="
                  text-red-600 dark:text-red-400 
                  cursor-pointer font-medium mt-2 
                  hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={handleLogout}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

    
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="
            lg:hidden border-t 
            bg-white dark:bg-gray-900 
            dark:border-gray-800"
        >
          <div className="px-4 py-3 space-y-3">
            <button className="
              w-full text-left px-3 py-2 
              text-sm font-medium 
              text-blue-600/80 dark:text-blue-400/80 
              hover:text-blue-700 dark:hover:text-blue-500 
              hover:bg-blue-50 dark:hover:bg-gray-800 
              rounded-md transition-colors"
            >
              Dashboard
            </button>
            <button className="
              w-full text-left px-3 py-2 
              text-sm font-medium 
              text-blue-600/80 dark:text-blue-400/80 
              hover:text-blue-700 dark:hover:text-blue-500 
              hover:bg-blue-50 dark:hover:bg-gray-800 
              rounded-md transition-colors"
            >
              Analytics
            </button>
            <button className="
              w-full text-left px-3 py-2 
              text-sm font-medium 
              text-blue-600/80 dark:text-blue-400/80 
              hover:text-blue-700 dark:hover:text-blue-500 
              hover:bg-blue-50 dark:hover:bg-gray-800 
              rounded-md transition-colors"
            >
              Reports
            </button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}