import { App, Settings, Chatters, Notifications } from '../containers';

export const routes = [
  {
    component: App,
    routes: [
      {
        path: '/settings',
        component: Settings,
      },
      {
        path: '/chatters',
        component: Chatters,
      },
      {
        path: '/feed',
        component: Notifications,
      }
    ],
  },
];
