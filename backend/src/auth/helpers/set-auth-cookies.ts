import type { Response } from 'express';
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from '../constants/auth.constants';
// this is a helper function to set cookies.
export const setAuthCookies = (response: Response, authTokens: AuthTokens) => {
  response.cookie(
    'accessToken',
    authTokens.accessToken,
    ACCESS_TOKEN_COOKIE_OPTIONS,
  );
  response.cookie(
    'refreshToken',
    authTokens.refreshToken,
    REFRESH_TOKEN_COOKIE_OPTIONS,
  );
};
