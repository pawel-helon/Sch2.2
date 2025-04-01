import React from 'react';

export const useHandleTheme = () => {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('dark');
  
  React.useEffect(() => {
    setTheme(localStorage.getItem('theme') as 'light' | 'dark');
  }, []);
  
  return { theme, setTheme };
}

export const useHandleBreakpoint = (props: {
  windowInnerWidth: number
}) => {
  const [ isBreakpoint, setIsBreakpoint ] = React.useState<boolean>(false);

  React.useEffect(() => {
    const callback = () => {
      if (window.innerWidth < props.windowInnerWidth) {
        setIsBreakpoint(true);
      } else {
        setIsBreakpoint(false);
      }
    }
    callback();
    
    window.addEventListener('resize', callback);

    return () => {
      window.removeEventListener('resize', callback);
    }
  }, [props.windowInnerWidth]);

  return isBreakpoint;
}

export const useHandleToast = () => {
  const [isMounted, setIsMounted] = React.useState<boolean>(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 500);

    return () => {
      clearTimeout(timer);
    }
  })

  return isMounted;
}
