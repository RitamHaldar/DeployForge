import { routes } from './app.routes';
import { RouterProvider } from 'react-router';

export function App() {
  return (
    <RouterProvider router={routes}/>
  );
}

export default App;
