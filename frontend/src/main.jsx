// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import AppLayout from './layouts/AppLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Applications from './pages/Applications';
import Documents from './pages/Documents';
import Profile from './pages/Profile';
import CardPreview from './pages/CardPreview';
import TypographyPreview from './pages/TypographyPreview';

// Global styles
import './styles/theme.css';

const router = createBrowserRouter([
  {
    element: <AppLayout />, // navbar + breadcrumbs on every child route
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/jobs', element: <Jobs /> },
      { path: '/jobs/:jobId', element: <JobDetails /> },
      { path: '/applications', element: <Applications /> },
      { path: '/documents', element: <Documents /> },
      { path: '/profile', element: <Profile /> },
      { path: '/cards', element: <CardPreview /> },
      { path: '/typography', element: <TypographyPreview /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
