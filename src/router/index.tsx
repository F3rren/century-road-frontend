import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { IndexRoute } from '@/pages/IndexRoute';
import { WelcomePage } from '@/pages/WelcomePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ArchivePage } from '@/pages/ArchivePage';
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
  // Outside AppLayout on purpose: a true threshold, no sidebar/header chrome.
  { path: '/welcome', element: <WelcomePage /> },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true,          element: <IndexRoute /> },
      { path: 'dashboard',    element: <DashboardPage /> },
      { path: 'archive',      element: <ArchivePage /> },
      { path: 'settings',     element: <SettingsPage /> },
      { path: 'privacy',      element: <PrivacyPage /> },
      { path: 'terms',        element: <TermsPage /> },
      { path: '*',            element: <NotFoundPage /> },
    ],
  },
], { basename });
