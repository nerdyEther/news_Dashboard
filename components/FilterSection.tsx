
'use client';

import { useState } from 'react';
import { Search, Filter, Calendar, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validateDateRange, getOneMonthAgo } from '@/utils/dateValidation';
import { useFilters } from '@/components/contexts/FilterContext';

interface ContentType {
  label: string;
  value: string;
}

const contentTypes: ContentType[] = [
  { label: 'All Types', value: 'all' },
  { label: 'News', value: 'news' },
  { label: 'Blogs', value: 'blog' }
];

export default function FilterSection() {
  const { filters, updateFilters, resetFilters: resetContextFilters } = useFilters();
  const [tempFilters, setTempFilters] = useState(filters);
  const [dateError, setDateError] = useState<string | null>(null);
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFilters = () => {
    if (tempFilters.search && tempFilters.search.length < 2) {
      setError('Search term must be at least 2 characters');
      return false;
    }
    if (tempFilters.dateRange.from && !tempFilters.dateRange.to) {
      setError('Please select both start and end dates');
      return false;
    }
    setError(null);
    return true;
  };

  const handleDateChange = (type: 'from' | 'to', date: Date | undefined) => {
    const newDateRange = {
      ...tempFilters.dateRange,
      [type]: date
    };

    if (date) {
      const validation = validateDateRange(
        type === 'from' ? date : tempFilters.dateRange.from,
        type === 'to' ? date : tempFilters.dateRange.to
      );

      if (!validation.isValid) {
        setDateError(validation.error);
        return;
      }
    }

    setDateError(null);
    setTempFilters((prev) => ({
      ...prev,
      dateRange: newDateRange
    }));
  };

  const handleTempFilterChange = (newFilters: Partial<typeof filters>) => {
    setError(null);
    setTempFilters((prev) => ({
      ...prev,
      ...newFilters
    }));
  };

  const applyFilters = async () => {
    if (!validateFilters()) return;
    
    setIsLoading(true);
    try {
      await updateFilters(tempFilters);
    } catch (err) {
      setError('Failed to apply filters. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilters = () => {
    setIsLoading(true);
    try {
      resetContextFilters();
      setTempFilters(filters);
      setDateError(null);
      setError(null);
    } catch (err) {
      setError('Failed to reset filters');
    } finally {
      setIsLoading(false);
    }
  };

  const isDateDisabledForStart = (date: Date): boolean => {
    const today = new Date();
    const oneMonthAgo = getOneMonthAgo();
    return date > today || date < oneMonthAgo;
  };

  const isDateDisabledForEnd = (date: Date): boolean => {
    const today = new Date();
    const oneMonthAgo = getOneMonthAgo();
    if (date > today || date < oneMonthAgo) return true;
    if (tempFilters.dateRange.from && date < tempFilters.dateRange.from) return true;
    return false;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border dark:border-gray-700 rounded-lg p-3 sm:p-4 mb-6"
    >
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col space-y-3 sm:space-y-4">
       
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
         
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground dark:text-gray-400" />
            <Input
              placeholder="Search articles..."
              className="pl-9 bg-white dark:bg-gray-800 dark:text-gray-100 w-full"
              value={tempFilters.search}
              onChange={(e) => handleTempFilterChange({ search: e.target.value })}
              disabled={isLoading}
            />
          </div>


          <div className="col-span-1">
            <Input
              placeholder="Filter by author"
              className="bg-white dark:bg-gray-800 dark:text-gray-100 w-full"
              value={tempFilters.author}
              onChange={(e) => handleTempFilterChange({ author: e.target.value })}
              disabled={isLoading}
            />
          </div>

         
          <div className="col-span-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full bg-white dark:bg-gray-800 dark:text-gray-100 justify-between" 
                  disabled={isLoading}
                >
                  <span className="truncate">
                    {contentTypes.find(t => t.value === tempFilters.type)?.label || 'Content Type'}
                  </span>
                  <Filter className="ml-2 h-4 w-4 flex-shrink-0 dark:text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="dark:bg-gray-900 dark:border-gray-700">
                {contentTypes.map((type) => (
                  <DropdownMenuItem
                    key={type.value}
                    onClick={() => handleTempFilterChange({ type: type.value })}
                    className="dark:hover:bg-gray-800 dark:text-gray-100"
                  >
                    {type.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          
          <div className="col-span-1">
            <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full bg-white dark:bg-gray-800 dark:text-gray-100 justify-between"
                  disabled={isLoading}
                >
                  <span className="truncate">
                    {tempFilters.dateRange.from ? (
                      tempFilters.dateRange.to ? (
                        <>
                          {format(tempFilters.dateRange.from, "PP")} - {format(tempFilters.dateRange.to, "PP")}
                        </>
                      ) : (
                        format(tempFilters.dateRange.from, "PP")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </span>
                  <Calendar className="ml-2 h-4 w-4 flex-shrink-0 dark:text-gray-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3 dark:bg-gray-900 dark:border-gray-700" align="start">
                <div className="space-y-3">
                  <div className="grid gap-2">
                    <Label className="text-xs dark:text-gray-300">From</Label>
                    <CalendarComponent
                      mode="single"
                      selected={tempFilters.dateRange.from}
                      onSelect={(date) => handleDateChange('from', date)}
                      disabled={isDateDisabledForStart}
                      className="rounded-md border dark:border-gray-700"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs dark:text-gray-300">To</Label>
                    <CalendarComponent
                      mode="single"
                      selected={tempFilters.dateRange.to}
                      onSelect={(date) => handleDateChange('to', date)}
                      disabled={isDateDisabledForEnd}
                      className="rounded-md border dark:border-gray-700"
                    />
                  </div>

                  {dateError && (
                    <Alert variant="destructive">
                      <AlertDescription className="text-xs">{dateError}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      handleTempFilterChange({
                        dateRange: { from: undefined, to: undefined }
                      });
                      setDateError(null);
                    }}
                    className="w-full dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                    disabled={isLoading}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear dates
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

     
        <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-2">
          <Button 
            variant="outline" 
            onClick={resetFilters}
            className="w-full sm:w-auto dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Reset Filters
          </Button>
          <Button 
            onClick={applyFilters}
            className="w-full sm:w-auto dark:bg-blue-800 dark:text-gray-100 dark:hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Apply Filters
          </Button>
        </div>
      </div>
    </motion.div>
  );
}