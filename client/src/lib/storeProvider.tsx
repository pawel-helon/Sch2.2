import React from 'react';
import { setupListeners } from '@reduxjs/toolkit/query';
import { Provider } from 'react-redux';
import { AppStore, store } from './store';

export const StoreProvider = (props: {
  children: React.ReactNode
}) => {
  const storeRef = React.useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = store;
  }

  React.useEffect(() => {
    if (storeRef.current !== null) {
      const unsubscribe = setupListeners(storeRef.current.dispatch);
      return unsubscribe;
    }
  },[])

  return (
    <Provider store={storeRef.current}>
      {props.children}
    </Provider>
  )
}