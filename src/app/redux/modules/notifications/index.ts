import { Dispatch } from 'redux';

export interface INotification {
  streamer: string;
  request: string;
  message: string;
  amount: number;
  username: string;
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

export interface IActionAddNotification {
  type: typeof ADD_NOTIFICATION;
  notification: INotification;
}

export type INotificationsAction = IActionGetNotificationsRequest | IActionGetNotificationsSuccess | IActionGetNotificationsFailure | IActionAddNotification;

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

    case GET_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        isFetching: false,
        isLoaded: true,
        data: action.data,
        error: false
      };

    case GET_NOTIFICATIONS_FAILURE:
      return {
        ...state,
        isFetching: false,
        message: action.message,
        error: true
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
export function addNotificationAction(notification: INotification): IActionAddNotification {
  return {
    type: ADD_NOTIFICATION,
    notification,
  };
}
