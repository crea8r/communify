import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import './output.css';
import V0 from './layout/v0';
import Wallet from './pages/Wallet';
import Intro from './pages/Intro';
import Admin from './pages/Admin';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <V0>
        <Intro />
      </V0>
    ),
  },
  {
    path: '/admin',
    element: (
      <V0>
        <Admin />
      </V0>
    ),
  },
  {
    path: '/member',
    element: (
      <V0>
        <Wallet />
      </V0>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
