import { Dispatch } from 'redux';

export interface ISettings {
  paypalEmail: string;
  showImage: boolean;
  playSound: boolean;
  profanityFilter: boolean;
  notificationImageUrl: string;
  notificationAudioUrl: string;
}

export interface ISettingsRequest {
  isFetching: boolean;
  isSaving: boolean;
  isLoaded: boolean;
  error?: boolean;
  message?: any;
  data: ISettings;
}

/** Action Types */
export const GET_SETTINGS_REQUEST = 'GET_SETTINGS_REQUEST';
export const SET_SETTINGS_REQUEST = 'SET_SETTINGS_REQUEST';
export const GET_SETTINGS_SUCCESS = 'GET_SETTINGS_SUCCESS';
export const SET_SETTINGS_SUCCESS = 'SET_SETTINGS_SUCCESS';
export const GET_SETTINGS_FAILURE = 'GET_SETTINGS_FAILURE';
export const SET_SETTINGS_FAILURE = 'SET_SETTINGS_FAILURE';

export interface IActionGetSettingsRequest {
  type: typeof GET_SETTINGS_REQUEST;
}

export interface IActionSetSettingsRequest {
  type: typeof SET_SETTINGS_REQUEST;
}

export interface IActionGetSettingsSuccess {
  type: typeof GET_SETTINGS_SUCCESS;
  data: ISettings;
}

export interface IActionSetSettingsSuccess {
  type: typeof SET_SETTINGS_SUCCESS;
  data: ISettings;
}

export interface IActionGetSettingsFailure {
  type: typeof GET_SETTINGS_FAILURE;
  message: string;
}

export interface IActionSetSettingsFailure {
  type: typeof SET_SETTINGS_FAILURE;
  message: string;
}

export type ISettingsAction = IActionGetSettingsRequest | IActionGetSettingsSuccess | IActionGetSettingsFailure |
  IActionSetSettingsRequest | IActionSetSettingsSuccess | IActionSetSettingsFailure;

/** Initial State */
const initialState: ISettingsRequest = {
  isFetching: false,
  isLoaded: false,
  isSaving: false,
  data: {
    paypalEmail: '',
    showImage: false,
    playSound: false,
    profanityFilter: false,
    notificationImageUrl: '',
    notificationAudioUrl: ''
  },
};

/** Reducer */
export function settingsReducer(state = initialState, action: ISettingsAction) {
  switch (action.type) {
    case GET_SETTINGS_REQUEST:
      return {
        ...state,
        isFetching: true
      };

    case SET_SETTINGS_REQUEST:
      return {
        ...state,
        isSaving: true
      };

    case GET_SETTINGS_SUCCESS:
      return {
        ...state,
        isLoaded: true,
        isFetching: false,
        data: action.data,
        error: false
      };

    case SET_SETTINGS_SUCCESS:
      return {
        ...state,
        isSaving: false,
        data: action.data,
        error: false
      };

    case GET_SETTINGS_FAILURE:
      return {
        ...state,
        isFetching: false,
        message: action.message,
        error: true
      };

    case SET_SETTINGS_FAILURE:
      return {
        ...state,
        isSaving: false,
        message: action.message
      };

    default:
      return state;
  }
}

/** Async Action Creator */
export function getSettings(dispatch: Dispatch<ISettingsAction>) {
  dispatch(getSettingsRequest());

  return new Promise(async (resolve, reject) => {
    try {
      const settings = await window.Streamlabs.userSettings.get('settings') || initialState.data;
      dispatch(getSettingsSuccess(settings));
      resolve(settings);
    } catch (e) {
      dispatch(getSettingsFailure(e.message));
      reject(e);
    }
  });
}

/** Async Action Creator */
export function setSettings(dispatch: Dispatch<ISettingsAction>, data: ISettings) {
  dispatch(setSettingsRequest());

  return new Promise(async (resolve, reject) => {
    try {
      await window.Streamlabs.userSettings.set('settings', data);
      dispatch(setSettingsSuccess(data));
      resolve(data);
    } catch (e) {
      dispatch(setSettingsFailure(e.message));
      reject(e);
    }
  });
}

/** Action Creator */
export function getSettingsRequest(): IActionGetSettingsRequest {
  return {
    type: GET_SETTINGS_REQUEST,
  };
}

/** Action Creator */
export function setSettingsRequest(): IActionSetSettingsRequest {
  return {
    type: SET_SETTINGS_REQUEST,
  };
}

/** Action Creator */
export function getSettingsSuccess(data: ISettings): IActionGetSettingsSuccess {
  return {
    type: GET_SETTINGS_SUCCESS,
    data,
  };
}

/** Action Creator */
export function setSettingsSuccess(data: ISettings): IActionSetSettingsSuccess {
  return {
    type: SET_SETTINGS_SUCCESS,
    data,
  };
}

/** Action Creator */
export function getSettingsFailure(message: string): IActionGetSettingsFailure {
  return {
    type: GET_SETTINGS_FAILURE,
    message,
  };
}

/** Action Creator */
export function setSettingsFailure(message: string): IActionSetSettingsFailure {
  return {
    type: SET_SETTINGS_FAILURE,
    message,
  };
}
