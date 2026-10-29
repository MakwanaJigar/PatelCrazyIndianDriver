import { apiGet, apiPost } from './client';
import { getSession, updateSessionDriver } from './session';

// ============================================================
// DRIVER PROFILE API
// ------------------------------------------------------------
//   GET  /driver/profile        -> current driver's details
//   POST /driver/profile/edit   -> update details (register fields)
//
// Both need the Bearer token from the saved session. Whatever the
// server returns is merged into the session so every screen sees
// the latest profile.
// ============================================================

// Find the driver object in the usual Laravel places
const extractDriver = res => {
  const data = res.data || {};
  return (
    data.driver || data.user || data.profile || res.driver || res.user || data
  );
};

export const fetchProfile = async () => {
  const session = await getSession();
  const res = await apiGet('/driver/profile', { token: session?.token });
  const next = await updateSessionDriver(extractDriver(res));
  return next.driver;
};

export const updateProfile = async payload => {
  const session = await getSession();
  const res = await apiPost('/driver/profile/edit', payload, {
    token: session?.token,
  });
  // Fall back to what was sent if the server doesn't echo the driver
  const next = await updateSessionDriver({ ...payload, ...extractDriver(res) });
  return { driver: next.driver, message: res.message };
};
