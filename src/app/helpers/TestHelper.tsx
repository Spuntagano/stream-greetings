import * as React from 'react'
import { mount, ComponentClass } from 'enzyme'
import { Provider } from 'react-redux'
import { createStore, Middleware, AnyAction, Store } from 'redux'
import { MemoryRouter, Route } from 'react-router'
import rootReducer from '../redux/reducers'
import configureStore from 'redux-mock-store'
import { IStore } from '../redux/IStore'

const fetchMock = require('fetch-mock')

/** Redux Mock Store Configuration */

const middlewares: Middleware[] = []
const mockStore = configureStore(middlewares)

/** Render Component */
function renderComponent<T>(
  Component: ComponentClass<T>,
  props: any = {},
  store: Store<IStore, AnyAction> = createStore(rootReducer, {})
) {
  return mount(
    <Provider store={store}>
      <MemoryRouter>
        <Component {...props} />
      </MemoryRouter>
    </Provider>
  )
}

function renderComponentWithRouter<T>(
  Component: ComponentClass<T>,
  store: Store<IStore, AnyAction> = createStore(rootReducer, {}),
  pathname: string = '',
  search: string = '',
  pathToMatch: string = '/',
  initialEntries: string[] = [pathname + search],
  initialIndex: number = 0
) {
  return mount(
    <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
      <Provider store={store}>
        <Route path={pathToMatch} component={Component} />
      </Provider>
    </MemoryRouter>
  )
}

function createState(s?: Partial<IStore>): IStore {
  const state: any = {}

  return { ...state, ...s }
}

export { mockStore, fetchMock, renderComponent, createState, renderComponentWithRouter }
