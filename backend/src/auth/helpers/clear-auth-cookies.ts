import type { Response } from 'express';

import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from '../constants/auth.constants';
export const clearAuthCookies = (response: Response) => {
  response.clearCookie('accessToken', ACCESS_TOKEN_COOKIE_OPTIONS);
  response.clearCookie('refreshToken', REFRESH_TOKEN_COOKIE_OPTIONS);
};
