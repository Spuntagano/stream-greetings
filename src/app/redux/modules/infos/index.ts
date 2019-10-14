import { Dispatch } from 'redux';
import { IRequest } from '../requests';
import { ISettings } from '../settings';
import { IProfiles } from '../configs';

export interface IInfo {
  profiles: IProfiles;
  requests: IRequest[];
  settings: ISettings;
}

export interface IInfosRequest {
  isFetching: boolean;
  isLoaded: boolean;
  error?: boolean;
  message?: any;
  data: IInfo;
}

/** Action Types */
export const GET_INFOS_REQUEST = 'GET_INFOS_REQUEST';
export const GET_INFOS_SUCCESS = 'GET_INFOS_SUCCESS';
export const GET_INFOS_FAILURE = 'GET_INFOS_FAILURE';

export interface IActionGetInfosRequest {
  type: typeof GET_INFOS_REQUEST;
}

export interface IActionGetInfosSuccess {
  type: typeof GET_INFOS_SUCCESS;
  data: IInfo;
}

export interface IActionGetInfosFailure {
  type: typeof GET_INFOS_FAILURE;
  message: string;
}

export type IInfosAction = IActionGetInfosRequest | IActionGetInfosSuccess | IActionGetInfosFailure;

/** Initial State */
const initialState: IInfosRequest = {
  isFetching: false,
  isLoaded: false,
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
    settings: {
      showImage: true,
      playSound: true,
      profanityFilter: true,
      showFirstJoinedNotification: false,
      showFirstChatMessageNotification: false,
      notificationImageUrl: '',
      notificationAudioUrl: '',
      fontSize: 24,
      fontWeight: 400,
      lineHeight: 1,
      firstJoinedMessageTemplate: 'Thank you {username} for watching my stream for the first time!',
      firstMessageMessageTemplate: 'Thank you {username} for the first time typing in my chat with message: {message}',
      primaryColor: '#ffffff',
      secondaryColor: '#00ffff',
      fontFamily: 'arial'
    },
    requests: []
  }
};

/** Reducer */
export function infosReducer(state = initialState, action: IInfosAction) {
  switch (action.type) {
    case GET_INFOS_REQUEST:
      return {
        ...state,
        isFetching: true
      };

    case GET_INFOS_SUCCESS:
      return {
        ...state,
        isFetching: false,
        data: action.data,
        isLoaded: true,
        error: false
      };

    case GET_INFOS_FAILURE:
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
export function getInfos(dispatch: Dispatch<IInfosAction>, streamer: string, apiUrl: string) {
  dispatch(getInfosRequest());

  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`${apiUrl}/user/${streamer}`);
      const json = await response.json();

      if (!response.ok) {
        throw (new Error(json.errorMessage));
      }

      const infos = {
        settings: JSON.parse(json.infos.settings.settings || {}),
        requests: JSON.parse(json.infos.settings.requests || {}),
        profiles: json.infos.profiles
      };
      dispatch(getInfosSuccess(infos));
      resolve(infos);
    } catch (e) {
      dispatch(getInfosFailure(e.message));
      reject(e);
    }
  });
}

/** Action Creator */
export function getInfosRequest(): IActionGetInfosRequest {
  return {
    type: GET_INFOS_REQUEST,
  };
}

/** Action Creator */
export function getInfosSuccess(data: IInfo): IActionGetInfosSuccess {
  return {
    type: GET_INFOS_SUCCESS,
    data,
  };
}

/** Action Creator */
export function getInfosFailure(message: string): IActionGetInfosFailure {
  return {
    type: GET_INFOS_FAILURE,
    message,
  };
}
