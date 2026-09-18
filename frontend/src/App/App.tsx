import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { RouterProvider } from 'react-router';
import { routes } from './app.routes';
import { authApi } from '../features/auth/services/authApi';
import { setUser } from '../features/auth/auth.slice';
import type { AppDispatch } from './app.store';

export function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    authApi.getUser().then((user) => {
      if (user) {
        dispatch(setUser({ user }));
      }
    });
  }, [dispatch]);

  return (
    <RouterProvider router={routes}/>
  );
}

export default App;
