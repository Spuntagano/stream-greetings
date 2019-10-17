import { Dispatch } from 'redux';
import { IChatter } from '../chatters';

export interface INotification {
  type: string;
  username: string;
  chatter: IChatter;
  timestamp: number;
}

export interface INotificationsRequest {
  isFetching: boolean;
  isLoaded: boolean;
  error?: boolean;
  message?: any;
  data: INotification[];
}

/** Action Types */
export const GET_NOTIFICATIONS_REQUEST = 'GET_NOTIFICATIONS_REQUEST';
export const GET_NOTIFICATIONS_SUCCESS = 'GET_NOTIFICATIONS_SUCCESS';
export const GET_NOTIFICATIONS_FAILURE = 'GET_NOTIFICATIONS_FAILURE';
export const SET_NOTIFICATIONS_REQUEST = 'SET_NOTIFICATIONS_REQUEST';
export const SET_NOTIFICATIONS_SUCCESS = 'SET_NOTIFICATIONS_SUCCESS';
export const SET_NOTIFICATIONS_FAILURE = 'SET_NOTIFICATIONS_FAILURE';
export const DELETE_NOTIFICATIONS_REQUEST = 'DELETE_NOTIFICATIONS_REQUEST';
export const DELETE_NOTIFICATIONS_SUCCESS = 'DELETE_NOTIFICATIONS_SUCCESS';
export const DELETE_NOTIFICATIONS_FAILURE = 'DELETE_NOTIFICATIONS_FAILURE';
export const ADD_NOTIFICATION = 'ADD_NOTIFICATION';

export interface IActionGetNotificationsRequest {
  type: typeof GET_NOTIFICATIONS_REQUEST;
}

export interface IActionGetNotificationsSuccess {
  type: typeof GET_NOTIFICATIONS_SUCCESS;
  data: INotification[];
}

export interface IActionGetNotificationsFailure {
  type: typeof GET_NOTIFICATIONS_FAILURE;
  message: string;
}

export interface IActionSetNotificationsRequest {
  type: typeof SET_NOTIFICATIONS_REQUEST;
}

export interface IActionSetNotificationsSuccess {
  type: typeof SET_NOTIFICATIONS_SUCCESS;
  data: INotification[];
}

export interface IActionSetNotificationsFailure {
  type: typeof SET_NOTIFICATIONS_FAILURE;
  message: string;
}

export interface IActionDeleteNotificationsRequest {
  type: typeof DELETE_NOTIFICATIONS_REQUEST;
}

export interface IActionDeleteNotificationsSuccess {
  type: typeof DELETE_NOTIFICATIONS_SUCCESS;
}

export interface IActionDeleteNotificationsFailure {
  type: typeof DELETE_NOTIFICATIONS_FAILURE;
  message: string;
}

export interface IActionAddNotification {
  type: typeof ADD_NOTIFICATION;
  notification: INotification;
}

export type INotificationsAction = IActionGetNotificationsRequest | IActionGetNotificationsSuccess | IActionGetNotificationsFailure | IActionAddNotification |
            IActionSetNotificationsRequest | IActionSetNotificationsSuccess | IActionSetNotificationsFailure | IActionDeleteNotificationsRequest |
            IActionDeleteNotificationsSuccess | IActionDeleteNotificationsFailure;

/** Initial State */
const initialState: INotificationsRequest = {
  isFetching: false,
  isLoaded: false,
  data: []
};

/** Reducer */
export function notificationsReducer(state = initialState, action: INotificationsAction) {
  switch (action.type) {
    case GET_NOTIFICATIONS_REQUEST:
      return {
        ...state,
        isFetching: true
      };

    case SET_NOTIFICATIONS_REQUEST:
      return {
        ...state,
        isSaving: true
      };

    case DELETE_NOTIFICATIONS_REQUEST:
      return {
        ...state,
        isDeleting: true
      };

    case GET_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        isFetching: false,
        isLoaded: true,
        data: action.data,
        error: false
      };

    case SET_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        isSaving: false,
        data: action.data,
        error: false
      };

    case DELETE_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        isDeleting: false,
        data: [],
        error: false
      };

    case GET_NOTIFICATIONS_FAILURE:
      return {
        ...state,
        isFetching: false,
        message: action.message,
        error: true
      };

    case SET_NOTIFICATIONS_FAILURE:
      return {
        ...state,
        isSaving: false,
        message: action.message
      };

    case DELETE_NOTIFICATIONS_FAILURE:
      return {
        ...state,
        isDeleting: false,
        message: action.message
      };

    case ADD_NOTIFICATION:
      return {
        ...state,
        data: [
          action.notification,
          ...state.data
        ]
      };

    default:
      return state;
  }
}

/** Async Action Creator */
export function getNotifications(dispatch: Dispatch<INotificationsAction>) {
  dispatch(getNotificationsRequest());

  return new Promise(async (resolve, reject) => {
    try {
      const notifications = await window.Streamlabs.userSettings.get('notifications') || initialState.data;

      dispatch(getNotificationsSuccess(notifications));
      resolve(notifications);
    } catch (e) {
      dispatch(getNotificationsFailure(e.message));
      reject(e);
    }
  });
}

/** Async Action Creator */
export function setNotifications(dispatch: Dispatch<INotificationsAction>, data: INotification[]) {
  const newData = [...data];
  if (newData.length > 50) { newData.length = 50; }
  dispatch(setNotificationsRequest());

  return new Promise(async (resolve, reject) => {
    try {
      await window.Streamlabs.userSettings.set('notifications', newData);

      dispatch(setNotificationsSuccess(newData));
      resolve(newData);
    } catch (e) {
      dispatch(setNotificationsFailure(e.message));
      reject(e);
    }
  });
}

/** Async Action Creator */
export function deleteNotifications(dispatch: Dispatch<INotificationsAction>) {
  dispatch(deleteNotificationsRequest());

  return new Promise(async (resolve, reject) => {
    try {
      await window.Streamlabs.userSettings.delete('notifications');

      dispatch(deleteNotificationsSuccess());
      resolve([]);
    } catch (e) {
      dispatch(deleteNotificationsFailure(e.message));
      reject(e);
    }
  });
}

/** Async Action Creator */
export function addNotification(dispatch: Dispatch<INotificationsAction>, notification: INotification) {
  dispatch(addNotificationAction(notification));
}

/** Action Creator */
export function getNotificationsRequest(): IActionGetNotificationsRequest {
  return {
    type: GET_NOTIFICATIONS_REQUEST,
  };
}

/** Action Creator */
export function getNotificationsSuccess(data: INotification[]): IActionGetNotificationsSuccess {
  return {
    type: GET_NOTIFICATIONS_SUCCESS,
    data,
  };
}

/** Action Creator */
export function getNotificationsFailure(message: string): IActionGetNotificationsFailure {
  return {
    type: GET_NOTIFICATIONS_FAILURE,
    message,
  };
}

/** Action Creator */
export function setNotificationsRequest(): IActionSetNotificationsRequest {
  return {
    type: SET_NOTIFICATIONS_REQUEST,
  };
}

/** Action Creator */
export function setNotificationsSuccess(data: INotification[]): IActionSetNotificationsSuccess {
  return {
    type: SET_NOTIFICATIONS_SUCCESS,
    data,
  };
}

/** Action Creator */
export function setNotificationsFailure(message: string): IActionSetNotificationsFailure {
  return {
    type: SET_NOTIFICATIONS_FAILURE,
    message,
  };
}

/** Action Creator */
export function deleteNotificationsRequest(): IActionDeleteNotificationsRequest {
  return {
    type: DELETE_NOTIFICATIONS_REQUEST,
  };
}

/** Action Creator */
export function deleteNotificationsSuccess(): IActionDeleteNotificationsSuccess {
  return {
    type: DELETE_NOTIFICATIONS_SUCCESS,
  };
}

/** Action Creator */
export function deleteNotificationsFailure(message: string): IActionDeleteNotificationsFailure {
  return {
    type: DELETE_NOTIFICATIONS_FAILURE,
    message,
  };
}

/** Action Creator */
export function addNotificationAction(notification: INotification): IActionAddNotification {
  return {
    type: ADD_NOTIFICATION,
    notification,
  };
}
