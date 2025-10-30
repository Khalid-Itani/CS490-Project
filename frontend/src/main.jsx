import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'

// Pages
// Dashboard overview
import ProfileDashboard from './pages/ProfileDashboard.jsx'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import JobDetails from './pages/JobDetails'
import Applications from './pages/Applications'
//import Documents from './pages/Documents'
import Profile from './pages/Profile'
import CardPreview from './pages/CardPreview'
import TypographyPreview from './pages/TypographyPreview'
import EducationPage from './pages/EducationPage'
import CertificationsPage from './pages/CertificationsPage'
import ProjectsPage from './pages/ProjectsPage'
// Public pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Logout from './pages/Logout'
import PasswordResetRequest from './pages/PasswordResetRequest'
import PasswordResetComplete from './pages/PasswordResetComplete'

import './index.css'
import './styles/globals.css'
import './styles/theme.css'

// UC-014 color system tokens
//import "./CS490/UC-014/styles/colors.css";

const router = createBrowserRouter([
  // Public routes (no AppLayout)
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/terms', element: <Terms /> },
  { path: '/privacy', element: <Privacy /> },
  { path: '/reset-password', element: <PasswordResetRequest /> },
  { path: '/reset-password/:token', element: <PasswordResetComplete /> },
  { path: '/logout', element: <Logout /> },

  // Authenticated app routes under layout
  {
    element: <AppLayout />, // navbar + breadcrumbs on every child route
    children: [
      { path: '/dashboard', element: <ProfileDashboard /> },
      { path: '/jobs', element: <Jobs /> },
      { path: '/jobs/:jobId', element: <JobDetails /> },
      { path: '/applications', element: <Applications /> },
      //{ path: '/documents', element: <Documents /> },
      { path: '/profile', element: <Profile /> },
      { path: '/education', element: <EducationPage /> },
      { path: '/certifications', element: <CertificationsPage /> },
      { path: '/projects', element: <ProjectsPage /> },
      { path: '/cards', element: <CardPreview /> },
      { path: '/typography', element: <TypographyPreview /> },
    ],
  },
])


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

