import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { RouteFallback } from '@/components/layout/RouteFallback';

// Each page becomes its own chunk instead of one ~1.5MB bundle every visitor
// downloads regardless of which page they land on. The payoff is biggest for
// MapPage: it pulls in maplibre-gl (500KB+ on its own), so a visit to
// /settings, /archive, /privacy or /terms no longer fetches the map library
// at all. Named exports throughout this app, not default ones - React.lazy
// needs a default export, so each import is adapted here rather than adding
// a default export to every page file for the sake of one call site.
const WelcomePage = lazy(() => import('@/pages/WelcomePage').then((m) => ({ default: m.WelcomePage })));
const IndexRoute = lazy(() => import('@/pages/IndexRoute').then((m) => ({ default: m.IndexRoute })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const ArchivePage = lazy(() => import('@/pages/ArchivePage').then((m) => ({ default: m.ArchivePage })));
const CenturyPage = lazy(() => import('@/pages/CenturyPage').then((m) => ({ default: m.CenturyPage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('@/pages/TermsPage').then((m) => ({ default: m.TermsPage })));
const GuidePage = lazy(() => import('@/pages/GuidePage').then((m) => ({ default: m.GuidePage })));
const MethodologyPage = lazy(() => import('@/pages/MethodologyPage').then((m) => ({ default: m.MethodologyPage })));
const CreditsPage = lazy(() => import('@/pages/CreditsPage').then((m) => ({ default: m.CreditsPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

// Vite exposes whatever base it was built with as BASE_URL, so the router prefix
// follows the build instead of being repeated here and drifting from it. The trailing
// slash goes: react-router wants the basename without one, and "/" becomes "", which
// it reads as no prefix at all.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

export const router = createBrowserRouter([
  // Outside AppLayout on purpose: a true threshold, no sidebar/header chrome. Its own
  // Suspense boundary since there's no AppLayout content area to hold a shared one.
  {
    path: '/welcome',
    element: (
      <Suspense fallback={<RouteFallback />}>
        <WelcomePage />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true,          element: <IndexRoute /> },
      { path: 'dashboard',    element: <DashboardPage /> },
      { path: 'archive',      element: <ArchivePage /> },
      { path: 'century',      element: <CenturyPage /> },
      { path: 'settings',     element: <SettingsPage /> },
      { path: 'privacy',      element: <PrivacyPage /> },
      { path: 'terms',        element: <TermsPage /> },
      { path: 'guide',        element: <GuidePage /> },
      { path: 'methodology',  element: <MethodologyPage /> },
      { path: 'credits',      element: <CreditsPage /> },
      { path: '*',            element: <NotFoundPage /> },
    ],
  },
], { basename });
