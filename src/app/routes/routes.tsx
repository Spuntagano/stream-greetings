import { App, Settings, Dashboard } from '../containers'

export const routes = [
  {
    component: App,
    routes: [
      {
        path: '/dashboard',
        component: Dashboard,
      },
      {
        path: '/settings',
        component: Settings,
      },
    ],
  },
]
