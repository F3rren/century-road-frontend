import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { MapPage } from '@/pages/MapPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { TermsPage } from '@/pages/TermsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Vite exposes whatever base it was built with as BASE_URL, so the router prefix
// follows the build instead of being repeated here and drifting from it. The trailing
// slash goes: react-router wants the basename without one, and "/" becomes "", which
// it reads as no prefix at all.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true,          element: <MapPage /> },
      { path: 'dashboard',    element: <DashboardPage /> },
      { path: 'settings',     element: <SettingsPage /> },
      { path: 'privacy',      element: <PrivacyPage /> },
      { path: 'terms',        element: <TermsPage /> },
      { path: '*',            element: <NotFoundPage /> },
    ],
  },
], { basename });
