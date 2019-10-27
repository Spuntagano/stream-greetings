import { Dispatch } from 'redux'

export interface IHints {
  showIntroModal: boolean
  showToggleNotificationWarningModal: boolean
}

export interface IHintsRequest {
  isFetching: boolean
  isSaving: boolean
  isLoaded: boolean
  isDeleting: boolean
  error?: boolean
  message?: any
  data: IHints
}

/** Action Types */
export const GET_HINTS_REQUEST = 'GET_HINTS_REQUEST'
export const SET_HINTS_REQUEST = 'SET_HINTS_REQUEST'
export const DELETE_HINTS_REQUEST = 'DELETE_HINTS_REQUEST'
export const GET_HINTS_SUCCESS = 'GET_HINTS_SUCCESS'
export const SET_HINTS_SUCCESS = 'SET_HINTS_SUCCESS'
export const DELETE_HINTS_SUCCESS = 'DELETE_HINTS_SUCCESS'
export const GET_HINTS_FAILURE = 'GET_HINTS_FAILURE'
export const SET_HINTS_FAILURE = 'SET_HINTS_FAILURE'
export const DELETE_HINTS_FAILURE = 'DELETE_HINTS_FAILURE'

export interface IActionGetHintsRequest {
  type: typeof GET_HINTS_REQUEST
}

export interface IActionSetHintsRequest {
  type: typeof SET_HINTS_REQUEST
}

export interface IActionDeleteHintsRequest {
  type: typeof DELETE_HINTS_REQUEST
}

export interface IActionGetHintsSuccess {
  type: typeof GET_HINTS_SUCCESS
  data: IHints
}

export interface IActionSetHintsSuccess {
  type: typeof SET_HINTS_SUCCESS
  data: IHints
}

export interface IActionDeleteHintsSuccess {
  type: typeof DELETE_HINTS_SUCCESS
}

export interface IActionGetHintsFailure {
  type: typeof GET_HINTS_FAILURE
  message: string
}

export interface IActionSetHintsFailure {
  type: typeof SET_HINTS_FAILURE
  message: string
}

export interface IActionDeleteHintsFailure {
  type: typeof DELETE_HINTS_FAILURE
  message: string
}

export type IHintsAction = IActionGetHintsRequest | IActionGetHintsSuccess | IActionGetHintsFailure |
  IActionSetHintsRequest | IActionSetHintsSuccess | IActionSetHintsFailure | IActionDeleteHintsRequest | IActionDeleteHintsSuccess | IActionDeleteHintsFailure

/** Initial State */
const initialState: IHintsRequest = {
  isFetching: false,
  isLoaded: false,
  isSaving: false,
  isDeleting: false,
  data: {
    showIntroModal: true,
    showToggleNotificationWarningModal: true
  },
}

/** Reducer */
export function hintsReducer(state = initialState, action: IHintsAction) {
  switch (action.type) {
    case GET_HINTS_REQUEST:
      return {
        ...state,
        isFetching: true
      }

    case SET_HINTS_REQUEST:
      return {
        ...state,
        isSaving: true
      }

    case DELETE_HINTS_REQUEST:
      return {
        ...state,
        isDeleting: true
      }

    case GET_HINTS_SUCCESS:
      return {
        ...state,
        isLoaded: true,
        isFetching: false,
        data: {
          ...initialState.data,
          ...action.data
        },
        error: false
      }

    case SET_HINTS_SUCCESS:
      return {
        ...state,
        isSaving: false,
        data: action.data,
        error: false
      }

    case DELETE_HINTS_SUCCESS:
      return {
        ...state,
        isDeleting: false,
        data: initialState.data,
        error: false
      }

    case GET_HINTS_FAILURE:
      return {
        ...state,
        isFetching: false,
        message: action.message,
        error: true
      }

    case SET_HINTS_FAILURE:
      return {
        ...state,
        isSaving: false,
        message: action.message
      }

    case DELETE_HINTS_FAILURE:
      return {
        ...state,
        isDeleting: false,
        message: action.message
      }

    default:
      return state
  }
}

/** Async Action Creator */
export function getHints(dispatch: Dispatch<IHintsAction>) {
  dispatch(getHintsRequest())

  return new Promise(async (resolve, reject) => {
    try {
      const hints = await window.Streamlabs.userSettings.get('hints') || initialState.data
      dispatch(getHintsSuccess(hints))
      resolve(hints)
    } catch (e) {
      dispatch(getHintsFailure(e.message))
      reject(e)
    }
  })
}

/** Async Action Creator */
export function setHints(dispatch: Dispatch<IHintsAction>, data: IHints) {
  dispatch(setHintsRequest())

  return new Promise(async (resolve, reject) => {
    try {
      await window.Streamlabs.userSettings.set('hints', data)
      dispatch(setHintsSuccess(data))
      resolve(data)
    } catch (e) {
      dispatch(setHintsFailure(e.message))
      reject(e)
    }
  })
}

/** Async Action Creator */
export function deleteHints(dispatch: Dispatch<IHintsAction>) {
  dispatch(deleteHintsRequest())

  return new Promise(async (resolve, reject) => {
    try {
      await window.Streamlabs.userSettings.delete('hints')
      dispatch(deleteHintsSuccess())
      resolve(initialState.data)
    } catch (e) {
      dispatch(deleteHintsFailure(e.message))
      reject(e)
    }
  })
}

/** Action Creator */
export function getHintsRequest(): IActionGetHintsRequest {
  return {
    type: GET_HINTS_REQUEST,
  }
}

/** Action Creator */
export function setHintsRequest(): IActionSetHintsRequest {
  return {
    type: SET_HINTS_REQUEST,
  }
}

/** Action Creator */
export function deleteHintsRequest(): IActionDeleteHintsRequest {
  return {
    type: DELETE_HINTS_REQUEST,
  }
}

/** Action Creator */
export function getHintsSuccess(data: IHints): IActionGetHintsSuccess {
  return {
    type: GET_HINTS_SUCCESS,
    data,
  }
}

/** Action Creator */
export function setHintsSuccess(data: IHints): IActionSetHintsSuccess {
  return {
    type: SET_HINTS_SUCCESS,
    data,
  }
}

/** Action Creator */
export function deleteHintsSuccess(): IActionDeleteHintsSuccess {
  return {
    type: DELETE_HINTS_SUCCESS
  }
}

/** Action Creator */
export function getHintsFailure(message: string): IActionGetHintsFailure {
  return {
    type: GET_HINTS_FAILURE,
    message,
  }
}

/** Action Creator */
export function setHintsFailure(message: string): IActionSetHintsFailure {
  return {
    type: SET_HINTS_FAILURE,
    message,
  }
}

/** Action Creator */
export function deleteHintsFailure(message: string): IActionDeleteHintsFailure {
  return {
    type: DELETE_HINTS_FAILURE,
    message,
  }
}
