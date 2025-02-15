'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Newspaper } from "lucide-react";
import Link from 'next/link';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    api: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateField = (name: string, value: string) => {
    let error = '';
    
    switch (name) {
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
        
      case 'password':
        if (!value) {
          error = 'Password is required';
        }
        break;
        
      default:
        break;
    }
    
    return error;
  };

  const validateForm = () => {
    const newErrors = {
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
      api: ''
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof typeof errors] || errors.api) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error,
        api: name === 'email' ? '' : prev.api
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors(prev => ({ ...prev, api: '' }));

    try {
     
      const userData = {
        email: formData.email,
        name: 'Demo User',
        isAdmin: formData.email === 'admin@example.com'
      };

      
      await new Promise(resolve => setTimeout(resolve, 1000));

      localStorage.setItem('user', JSON.stringify(userData));
      router.push('/dashboard');

    } catch (error) {
      setErrors(prev => ({
        ...prev,
        api: 'An unexpected error occurred. Please try again.'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <Newspaper className="h-12 w-12 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome to NewsHub</h1>
        <p className="text-gray-600 dark:text-gray-400">Stay informed, stay ahead 📚</p>
        <p className="text-sm text-gray-500 dark:text-gray-500">Login to access your news dashboard</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.api && (
          <Alert variant="destructive">
            <AlertDescription>{errors.api}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email" className="dark:text-gray-300">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className={`${errors.email ? 'border-red-500' : ''} dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700`}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="dark:text-gray-300">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            className={`${errors.password ? 'border-red-500' : ''} dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700`}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin mr-2">↻</span>
              Logging in...
            </span>
          ) : (
            'Login'
          )}
        </Button>

       
      </form>
    </>
  );
}