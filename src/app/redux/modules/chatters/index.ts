import { Dispatch } from 'redux';

export interface IChatter {
  firstJoinedTimestamp: string;
  firstChatMessage?: string;
  firstChatMessageTimestamp?: string;
}

export interface IChatters {
  [s: string]: IChatter;
}

export interface IChattersRequest {
  isFetching: boolean;
  isSaving: boolean;
  isLoaded: boolean;
  error?: boolean;
  message?: any;
  data: IChatters;
}

/** Action Types */
export const GET_CHATTERS_REQUEST = 'GET_CHATTERS_REQUEST';
export const SET_CHATTERS_REQUEST = 'SET_CHATTERS_REQUEST';
export const GET_LIVE_CHATTERS_REQUEST = 'GET_LIVE_CHATTERS_REQUEST';
export const GET_CHATTERS_SUCCESS = 'GET_CHATTERS_SUCCESS';
export const SET_CHATTERS_SUCCESS = 'SET_CHATTERS_SUCCESS';
export const GET_LIVE_CHATTERS_SUCCESS = 'GET_LIVE_CHATTERS_SUCCESS';
export const GET_CHATTERS_FAILURE = 'GET_CHATTERS_FAILURE';
export const SET_CHATTERS_FAILURE = 'SET_CHATTERS_FAILURE';
export const GET_LIVE_CHATTERS_FAILURE = 'GET_LIVE_CHATTERS_FAILURE';

export interface IActionGetChattersRequest {
  type: typeof GET_CHATTERS_REQUEST;
}

export interface IActionSetChattersRequest {
  type: typeof SET_CHATTERS_REQUEST;
  data: IChatters;
}

export interface IActionGetLiveChattersRequest {
  type: typeof GET_LIVE_CHATTERS_REQUEST;
}

export interface IActionGetChattersSuccess {
  type: typeof GET_CHATTERS_SUCCESS;
  data: IChatters;
}

export interface IActionSetChattersSuccess {
  type: typeof SET_CHATTERS_SUCCESS;
}

export interface IActionGetLiveChattersSuccess {
  type: typeof GET_LIVE_CHATTERS_SUCCESS;
  data: IChatters;
}

export interface IActionGetChattersFailure {
  type: typeof GET_CHATTERS_FAILURE;
  message: string;
}

export interface IActionSetChattersFailure {
  type: typeof SET_CHATTERS_FAILURE;
  message: string;
}

export interface IActionGetLiveChattersFailure {
  type: typeof GET_LIVE_CHATTERS_FAILURE;
  message: string;
}

export type IChattersAction = IActionGetChattersRequest | IActionGetChattersSuccess | IActionGetChattersFailure |
  IActionSetChattersRequest | IActionSetChattersSuccess | IActionSetChattersFailure | IActionGetLiveChattersRequest |
  IActionGetLiveChattersSuccess | IActionGetLiveChattersFailure;

/** Initial State */
const initialState: IChattersRequest = {
  isFetching: false,
  isLoaded: false,
  isSaving: false,
  data: {},
};

/** Reducer */
export function chattersReducer(state = initialState, action: IChattersAction) {
  switch (action.type) {
    case GET_CHATTERS_REQUEST:
      return {
        ...state,
        isFetching: true
      };

    case SET_CHATTERS_REQUEST:
      return {
        ...state,
        data: {
          ...state.data,
          ...action.data
        },
        isSaving: true
      };

    case GET_CHATTERS_SUCCESS:
      return {
        ...state,
        isLoaded: true,
        isFetching: false,
        data: action.data,
        error: false
      };

    case SET_CHATTERS_SUCCESS:
      return {
        ...state,
        isSaving: false,
        error: false
      };

    case GET_CHATTERS_FAILURE:
      return {
        ...state,
        isFetching: false,
        message: action.message,
        error: true
      };

    case SET_CHATTERS_FAILURE:
      return {
        ...state,
        isSaving: false,
        message: action.message
      };

    case GET_LIVE_CHATTERS_REQUEST:
      return {
        ...state,
        isFetching: true
      };

    case GET_LIVE_CHATTERS_SUCCESS:
      return {
        ...state,
        isFetching: false,
        data: {
          ...state.data,
          ...action.data
        },
      };

    case GET_LIVE_CHATTERS_FAILURE:
      return {
        ...state,
        isFetching: false,
        message: action.message
      };

    default:
      return state;
  }
}

/** Async Action Creator */
export function getChatters(dispatch: Dispatch<IChattersAction>, chat: string) {
  dispatch(getChattersRequest());

  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`https://ga7nmsy60j.execute-api.ca-central-1.amazonaws.com/test/chatters/${chat}`);
      const json = await response.json();

      if (!response.ok) {
        throw (new Error(json.errorMessage));
      }

      dispatch(getChattersSuccess(json.chatters));
      resolve(json.chatters);
    } catch (e) {
      dispatch(getChattersFailure(e.message));
      reject(e);
    }
  });
}

/** Async Action Creator */
export function setChatters(dispatch: Dispatch<IChattersAction>, chat: string, chatters: IChatters) {
  const usernames = Object.keys(chatters);
  usernames.length = 300;
  usernames.forEach((username, index) => {
    setTimeout(() => {
      dispatch(setChattersRequest(chatters));

      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch(`https://ga7nmsy60j.execute-api.ca-central-1.amazonaws.com/test/chatters`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              chat,
              username,
              firstChatMessage: chatters[username].firstChatMessage,
              firstChatMessageTimestamp: chatters[username].firstChatMessageTimestamp,
              firstJoinedTimestamp: chatters[username].firstJoinedTimestamp
            })
          });
          const json = await response.json();

          if (!response.ok) {
            throw (new Error(json.errorMessage));
          }

          dispatch(setChattersSuccess());
          resolve();
        } catch (e) {
          dispatch(getChattersFailure(e.message));
          reject(e);
        }
      });
    }, 200 * index);
  });
}

/** Async Action Creator */
export function getLiveChatters(dispatch: Dispatch<IChattersAction>, chat: string, chatters: IChatters) {
  dispatch(getLiveChattersRequest());

  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`https://ga7nmsy60j.execute-api.ca-central-1.amazonaws.com/test/live-chatters/${chat}`);
      const json = await response.json();

      if (!response.ok) {
        throw (new Error(json.errorMessage));
      }

      const newChatters: IChatters = {};
      const roles = ['broadcaster', 'vips', 'moderators', 'staff', 'admins', 'global_mods', 'viewers'];
      roles.forEach((role) => {
        json.chatters[role].forEach((username: string) => {
          if (!chatters[username]) {
            newChatters[username] = {
              firstJoinedTimestamp: String(new Date().getTime())
            };
          }
        });
      });

      dispatch(getLiveChattersSuccess(newChatters));
      resolve(newChatters);
    } catch (e) {
      dispatch(getLiveChattersFailure(e.message));
      reject(e);
    }
  });
}

/** Action Creator */
export function getChattersRequest(): IActionGetChattersRequest {
  return {
    type: GET_CHATTERS_REQUEST,
  };
}

/** Action Creator */
export function setChattersRequest(data: IChatters): IActionSetChattersRequest {
  return {
    type: SET_CHATTERS_REQUEST,
    data
  };
}

/** Action Creator */
export function getChattersSuccess(data: IChatters): IActionGetChattersSuccess {
  return {
    type: GET_CHATTERS_SUCCESS,
    data,
  };
}

/** Action Creator */
export function setChattersSuccess(): IActionSetChattersSuccess {
  return {
    type: SET_CHATTERS_SUCCESS
  };
}

/** Action Creator */
export function getChattersFailure(message: string): IActionGetChattersFailure {
  return {
    type: GET_CHATTERS_FAILURE,
    message,
  };
}

/** Action Creator */
export function setChattersFailure(message: string): IActionSetChattersFailure {
  return {
    type: SET_CHATTERS_FAILURE,
    message,
  };
}

/** Action Creator */
export function getLiveChattersRequest(): IActionGetLiveChattersRequest {
  return {
    type: GET_LIVE_CHATTERS_REQUEST,
  };
}

/** Action Creator */
export function getLiveChattersSuccess(data: IChatters): IActionGetLiveChattersSuccess {
  return {
    type: GET_LIVE_CHATTERS_SUCCESS,
    data,
  };
}

/** Action Creator */
export function getLiveChattersFailure(message: string): IActionGetLiveChattersFailure {
  return {
    type: GET_LIVE_CHATTERS_FAILURE,
    message,
  };
}
