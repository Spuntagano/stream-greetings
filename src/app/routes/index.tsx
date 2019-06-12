import { App, Settings, Requests, Notifications } from '../containers';

export const routes = [
  {
    component: App,
    routes: [
      {
        path: '/',
        exact: true,
        component: Settings,
      },
      {
        path: '/settings',
        component: Settings,
      },
      {
        path: '/requests',
        component: Requests,
      },
      {
        path: '/feed',
        component: Notifications,
      }
    ],
  },
];
