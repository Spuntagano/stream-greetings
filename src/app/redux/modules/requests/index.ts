import { Dispatch } from 'redux';

export interface IRequest {
  title: string;
  description: string;
  amount: number;
  active: boolean;
  imageUrl: string;
}

export interface IRequestsRequest {
  isFetching: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  isLoaded: boolean;
  error?: boolean;
  message?: any;
  data: IRequest[];
}

/** Action Types */
export const GET_REQUESTS_REQUEST = 'GET_REQUESTS_REQUEST';
export const SET_REQUESTS_REQUEST = 'SET_REQUESTS_REQUEST';
export const DELETE_REQUESTS_REQUEST = 'DELETE_REQUESTS_REQUEST';
export const GET_REQUESTS_SUCCESS = 'GET_REQUESTS_SUCCESS';
export const SET_REQUESTS_SUCCESS = 'SET_REQUESTS_SUCCESS';
export const DELETE_REQUESTS_SUCCESS = 'DELETE_REQUESTS_SUCCESS';
export const GET_REQUESTS_FAILURE = 'GET_REQUESTS_FAILURE';
export const SET_REQUESTS_FAILURE = 'SET_REQUESTS_FAILURE';
export const DELETE_REQUESTS_FAILURE = 'DELETE_REQUESTS_FAILURE';

export interface IActionGetRequestsRequest {
  type: typeof GET_REQUESTS_REQUEST;
}

export interface IActionSetRequestsRequest {
  type: typeof SET_REQUESTS_REQUEST;
}

export interface IActionDeleteRequestsRequest {
  type: typeof DELETE_REQUESTS_REQUEST;
}

export interface IActionGetRequestsSuccess {
  type: typeof GET_REQUESTS_SUCCESS;
  data: IRequest[];
}

export interface IActionSetRequestsSuccess {
  type: typeof SET_REQUESTS_SUCCESS;
  data: IRequest[];
}

export interface IActionDeleteRequestsSuccess {
  type: typeof DELETE_REQUESTS_SUCCESS;
  data: IRequest[];
}

export interface IActionGetRequestsFailure {
  type: typeof GET_REQUESTS_FAILURE;
  message: string;
}

export interface IActionSetRequestsFailure {
  type: typeof SET_REQUESTS_FAILURE;
  message: string;
}

export interface IActionDeleteRequestsFailure {
  type: typeof DELETE_REQUESTS_FAILURE;
  message: string;
}

export type IRequestsAction = IActionGetRequestsRequest | IActionGetRequestsSuccess | IActionGetRequestsFailure |
  IActionSetRequestsRequest | IActionSetRequestsSuccess | IActionSetRequestsFailure |
  IActionDeleteRequestsRequest | IActionDeleteRequestsSuccess | IActionDeleteRequestsFailure;

/** Initial State */
const initialState: IRequestsRequest = {
  isFetching: false,
  isSaving: false,
  isDeleting: false,
  isLoaded: false,
  data: [],
};

/** Reducer */
export function requestsReducer(state = initialState, action: IRequestsAction) {
  switch (action.type) {
    case GET_REQUESTS_REQUEST:
      return {
        ...state,
        isFetching: true
      };

    case SET_REQUESTS_REQUEST:
      return {
        ...state,
        isSaving: true
      };

    case DELETE_REQUESTS_REQUEST:
      return {
        ...state,
        isDeleting: true
      };

    case GET_REQUESTS_SUCCESS:
      return {
        ...state,
        isFetching: false,
        data: action.data,
        isLoaded: true,
        error: false
      };

    case SET_REQUESTS_SUCCESS:
      return {
        ...state,
        isSaving: false,
        data: action.data,
        error: false
      };

    case DELETE_REQUESTS_SUCCESS:
      return {
        ...state,
        isDeleting: false,
        data: action.data,
        error: false
      };

    case GET_REQUESTS_FAILURE:
      return {
        ...state,
        isFetching: false,
        message: action.message,
        error: true
      };

    case SET_REQUESTS_FAILURE:
      return {
        ...state,
        isSaving: false,
        message: action.message
      };

    case DELETE_REQUESTS_FAILURE:
      return {
        ...state,
        isDeleting: false,
        message: action.message
      };

    default:
      return state;
  }
}

/** Async Action Creator */
export function getRequests(dispatch: Dispatch<IRequestsAction>) {
  dispatch(getRequestsRequest());

  return new Promise(async (resolve, reject) => {
    try {
      const requests = await window.Streamlabs.userSettings.get('requests') || initialState.data;
      dispatch(getRequestsSuccess(requests));
      resolve(requests);
    } catch (e) {
      dispatch(getRequestsFailure(e.message));
      reject(e);
    }
  });
}

/** Async Action Creator */
export function setRequests(dispatch: Dispatch<IRequestsAction>, request: IRequest, data: IRequest[], editIndex: number) {
  dispatch(setRequestsRequest());

  return new Promise(async (resolve, reject) => {
    try {
      const newData = [
        ...data.slice(0, editIndex),
        request,
        ...data.slice(editIndex + 1)
      ];

      await window.Streamlabs.userSettings.set('requests', newData);
      dispatch(setRequestsSuccess(newData));
      resolve(newData);
    } catch (e) {
      dispatch(setRequestsFailure(e.message));
      reject(e);
    }
  });
}

export function deleteRequests(dispatch: Dispatch<IRequestsAction>, data: IRequest[], editIndex: number) {
  dispatch(deleteRequestsRequest());

  return new Promise(async (resolve, reject) => {
    try {
      const newData = [
        ...data.slice(0, editIndex),
        ...data.slice(editIndex + 1)
      ];

      await window.Streamlabs.userSettings.set('requests', newData);
      dispatch(deleteRequestsSuccess(newData));
      resolve(newData);
    } catch (e) {
      dispatch(deleteRequestsFailure(e.message));
      reject(e);
    }
  });
}

/** Action Creator */
export function getRequestsRequest(): IActionGetRequestsRequest {
  return {
    type: GET_REQUESTS_REQUEST,
  };
}

/** Action Creator */
export function setRequestsRequest(): IActionSetRequestsRequest {
  return {
    type: SET_REQUESTS_REQUEST,
  };
}

/** Action Creator */
export function deleteRequestsRequest(): IActionDeleteRequestsRequest {
  return {
    type: DELETE_REQUESTS_REQUEST,
  };
}

/** Action Creator */
export function getRequestsSuccess(data: IRequest[]): IActionGetRequestsSuccess {
  return {
    type: GET_REQUESTS_SUCCESS,
    data,
  };
}

/** Action Creator */
export function setRequestsSuccess(data: IRequest[]): IActionSetRequestsSuccess {
  return {
    type: SET_REQUESTS_SUCCESS,
    data,
  };
}

/** Action Creator */
export function deleteRequestsSuccess(data: IRequest[]): IActionDeleteRequestsSuccess {
  return {
    type: DELETE_REQUESTS_SUCCESS,
    data,
  };
}

/** Action Creator */
export function getRequestsFailure(message: string): IActionGetRequestsFailure {
  return {
    type: GET_REQUESTS_FAILURE,
    message,
  };
}

/** Action Creator */
export function setRequestsFailure(message: string): IActionSetRequestsFailure {
  return {
    type: SET_REQUESTS_FAILURE,
    message,
  };
}

/** Action Creator */
export function deleteRequestsFailure(message: string): IActionDeleteRequestsFailure {
  return {
    type: DELETE_REQUESTS_FAILURE,
    message,
  };
}
