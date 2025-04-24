import React from 'react';

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