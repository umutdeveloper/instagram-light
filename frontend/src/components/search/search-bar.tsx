'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Search users...',
  className = '',
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <div
        className={`relative flex items-center border rounded-lg transition-all ${
          isFocused ? 'border-primary ring-2 ring-primary/20' : 'border-input'
        }`}
      >
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="border-0 pl-10 pr-10 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 h-7 w-7"
            onClick={onClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
