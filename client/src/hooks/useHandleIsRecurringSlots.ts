import React from 'react';

export const useHandleIsRecurringSlotsOnly = () => {
  const [isRecurringSlotsOnly, setIsRecurringSlotsOnly] = React.useState<boolean>(() => {
    return localStorage.getItem('recurringSlotsOnly') === 'true';
  });

  const setRecurringSlotsOnly = (value: boolean) => {
    setIsRecurringSlotsOnly(value);
    localStorage.setItem('recurringSlotsOnly', value.toString());
  };

  return { isRecurringSlotsOnly, setRecurringSlotsOnly };
};