// ============================================================
// API CLIENT
// ------------------------------------------------------------
// Tiny fetch wrapper shared by every screen. Each screen calls
// its own endpoint, e.g.
//
//   const res = await apiPost('/driver/login', { email, password });
//
// On failure it throws an ApiError with the server's `message`
// and the per-field `errors` object (Laravel validation format):
//
//   { success: false, message: '...', errors: { email: ['...'] } }
// ============================================================

export const API_BASE_URL =
  'https://replete-software.com/projects/crazyindian/api';

export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

// Pass { token } for authenticated endpoints -> "Authorization: Bearer ..."
// A FormData body is sent as multipart (fetch sets the boundary itself).
const request = async (method, path, body, { token } = {}) => {
  const isForm = body instanceof FormData;
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(isForm ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined
        ? { body: isForm ? body : JSON.stringify(body) }
        : {}),
    });
  } catch (e) {
    throw new ApiError(
      'Unable to reach the server. Please check your internet connection.',
      0,
    );
  }

  let data = {};
  try {
    data = await response.json();
  } catch (e) {
    // Non-JSON body (e.g. HTML error page)
  }

  if (!response.ok || data.success === false) {
    throw new ApiError(
      data.message || `Request failed (${response.status})`,
      response.status,
      data.errors || {},
    );
  }

  return data;
};

export const apiPost = (path, body = {}, options) =>
  request('POST', path, body, options);

export const apiGet = (path, options) =>
  request('GET', path, undefined, options);

// { email: ['msg1', 'msg2'] } -> { email: 'msg1' }
export const firstFieldErrors = (errors = {}) =>
  Object.fromEntries(
    Object.entries(errors).map(([k, msgs]) => [
      k,
      Array.isArray(msgs) ? msgs[0] : String(msgs),
    ]),
  );
