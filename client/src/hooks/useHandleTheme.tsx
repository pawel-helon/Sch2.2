import React from 'react';

export const useHandleTheme = () => {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('dark');
  
  React.useEffect(() => {
    setTheme(localStorage.getItem('theme') as 'light' | 'dark');
  }, []);
  
  return { theme, setTheme };
}