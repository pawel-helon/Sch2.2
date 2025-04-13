import React from 'react';
import { setupListeners } from '@reduxjs/toolkit/query';
import { Provider } from 'react-redux';
import { store } from './store';

export const StoreProvider = (props: {
  children: React.ReactNode
}) => {
  React.useEffect(() => {
    const unsubscribe = setupListeners(store.dispatch);
    return unsubscribe;
  },[])

  return (
    <Provider store={store}>
      {props.children}
    </Provider>
  )
} 