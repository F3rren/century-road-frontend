import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { MapPage } from '@/pages/MapPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { HistoryTestPage } from '@/pages/HistoryTestPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true,          element: <MapPage /> },
      { path: 'dashboard',    element: <DashboardPage /> },
      { path: 'settings',     element: <SettingsPage /> },
      { path: 'history-test', element: <HistoryTestPage /> },
      { path: '*',            element: <NotFoundPage /> },
    ],
  },
]);
