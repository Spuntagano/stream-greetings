export interface IEnv {
  SL_API_GATEWAY_URL: string;
  PAYPAL_API_GATEWAY_URL: string;
  PAYPAL_PAYMENT_URL: string;
  WS_API_GATEWAY: string;
  PUB_KEY: string;
}

/** Initial State */
const initialState: any = process.env.STAGING;

/** Reducer */
export function envReducer(state = initialState) {
  return state;
}
