import { App, Settings, Chatters } from '../containers'

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
      }
    ],
  },
]
