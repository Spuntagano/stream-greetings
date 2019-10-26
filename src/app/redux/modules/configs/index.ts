import { Dispatch } from 'redux';

export interface IStreamlabs {
  id: number;
  name: string;
}

export interface ITwitch {
  twitch_id: string;
  display_name: string;
  name: string;
}

export interface IProfiles {
  primary: string;
  streamlabs: IStreamlabs;
  twitch: ITwitch;
}

export interface IConfigs {
  profiles: IProfiles;
  token: string;
  jwToken: string;
}

export interface IConfigsRequest {
  isFetching: boolean;
  isLoaded: boolean;
  error?: boolean;
  message?: any;
  data: IConfigs;
}

/** Action Types */
export const GET_CONFIGS_REQUEST = 'GET_CONFIGS_REQUEST';
export const GET_CONFIGS_SUCCESS = 'GET_CONFIGS_SUCCESS';
export const GET_CONFIGS_FAILURE = 'GET_CONFIGS_FAILURE';

export interface IActionGetConfigsRequest {
  type: typeof GET_CONFIGS_REQUEST;
}

export interface IActionGetConfigsSuccess {
  type: typeof GET_CONFIGS_SUCCESS;
  data: IConfigs;
}

export interface IActionGetConfigsFailure {
  type: typeof GET_CONFIGS_FAILURE;
  message: string;
}

export type IConfigsAction = IActionGetConfigsRequest | IActionGetConfigsSuccess | IActionGetConfigsFailure;

/** Initial State */
const initialState: IConfigsRequest = {
  isLoaded: false,
  isFetching: false,
  data: {
    profiles: {
      primary: 'twitch',
      streamlabs: {
        id: 0,
        name: ''
      },
      twitch: {
        twitch_id: '',
        display_name: '',
        name: ''
      }
    },
    token: '',
    jwToken: ''
  }
};

/** Reducer */
export function configsReducer(state = initialState, action: IConfigsAction) {
  switch (action.type) {
    case GET_CONFIGS_REQUEST:
      return {
        ...state,
        isFetching: true
      };

    case GET_CONFIGS_SUCCESS:
      const configs = { ...action.data };
      const urlParams = new URLSearchParams(window.location.search);
      configs.profiles.twitch.name = urlParams.get('override') || configs.profiles.twitch.name;

      return {
        ...state,
        isFetching: false,
        isLoaded: true,
        data: configs,
        error: false
      };

    case GET_CONFIGS_FAILURE:
      return {
        ...state,
        isFetching: false,
        message: action.message,
        error: true
      };

    default:
      return state;
  }
}

/** Async Action Creator */
export function getConfigs(dispatch: Dispatch<IConfigsAction>) {
  dispatch(getConfigsRequest());

  return new Promise(async (resolve: (data: IConfigs) => void, reject) => {
    try {
      const data = await window.Streamlabs.init({ receiveEvents: true });

      dispatch(getConfigsSuccess(data));
      resolve(data);
    } catch (e) {
      dispatch(getConfigsFailure(e.message));
      reject(e);
    }
  });
}

/** Action Creator */
export function getConfigsRequest(): IActionGetConfigsRequest {
  return {
    type: GET_CONFIGS_REQUEST,
  };
}

/** Action Creator */
export function getConfigsSuccess(data: IConfigs): IActionGetConfigsSuccess {
  return {
    type: GET_CONFIGS_SUCCESS,
    data,
  };
}

/** Action Creator */
export function getConfigsFailure(message: string): IActionGetConfigsFailure {
  return {
    type: GET_CONFIGS_FAILURE,
    message,
  };
}
