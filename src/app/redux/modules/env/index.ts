export interface IEnv {
  SL_API_GATEWAY_URL: string;
  PAYPAL_API_GATEWAY_URL: string;
  PAYPAL_PAYMENT_URL: string;
  WS_API_GATEWAY: string;
  PUB_KEY: string;
}

const envParam = (typeof URLSearchParams !== 'undefined') ? new URLSearchParams(location.search).get('env') : 'production';
const env = (envParam) ? envParam : process.env.ENV || 'production';

/** Initial State */
const initialState: IEnv = process.env[env.toUpperCase() as any] as any;

/** Reducer */
export function envReducer(state = initialState) {
  return state;
}
