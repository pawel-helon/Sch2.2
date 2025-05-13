import { ReactNode, useEffect } from 'react';
import { setupListeners } from '@reduxjs/toolkit/query';
import { Provider } from 'react-redux';
import { store } from 'src/redux/store';

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider = (props: StoreProviderProps) => {
  useEffect(() => {
    const unsubscribe = setupListeners(store.dispatch);
    return unsubscribe;
  },[])

  return (
    <Provider store={store}>
      {props.children}
    </Provider>
  )
} 