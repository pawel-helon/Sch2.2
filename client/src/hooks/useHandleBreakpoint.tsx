import { useEffect, useState } from 'react';

export const useHandleBreakpoint = (props: {
  windowInnerWidth: number
}) => {
  const [ isBreakpoint, setIsBreakpoint ] = useState<boolean>(false);

  useEffect(() => {
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