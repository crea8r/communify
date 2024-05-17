import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import './output.css';
import Signatures from './pages/Signatures';
import Layout from './layout/main';
import Draft from './pages/Draft';
import V0 from './layout/v0';
import CreateToken from './pages/CreateToken';
import ManageToken from './pages/ManageToken';
import Wallet from './pages/Wallet';
import Intro from './pages/Intro';

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
    path: '/signatures',
    element: (
      <Layout>
        <Signatures />
      </Layout>
    ),
  },
  {
    path: '/tokens',
    element: <Draft />,
  },
  {
    path: '/create-token',
    element: (
      <V0>
        <CreateToken />
      </V0>
    ),
  },
  {
    path: '/manage-token',
    element: (
      <V0>
        <ManageToken />
      </V0>
    ),
  },
  {
    path: '/wallet',
    element: (
      <V0>
        <Wallet />
      </V0>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
