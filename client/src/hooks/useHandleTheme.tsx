import React from 'react';
import { cn } from 'src/utils/cn';

export const useHandleTheme = () => {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('dark');
  
  React.useEffect(() => {
    document.body.className = cn(theme);
    setTheme(localStorage.getItem('theme') as 'light' | 'dark');
    return () => {
      document.body.className = '';
    };
  }, [theme]);
  
  return { theme, setTheme };
}