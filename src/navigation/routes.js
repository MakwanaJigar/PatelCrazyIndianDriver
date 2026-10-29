// ============================================================
// ROUTE NAMES
// ------------------------------------------------------------
// Every screen name lives here. Always navigate with these
// constants instead of typing strings, e.g.
//
//   navigation.navigate(ROUTES.PROFILE)
//
// so a typo becomes an error instead of a silent no-op.
// ============================================================

export const ROUTES = {
  // Root stack
  SPLASH: 'Splash',
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',
  OTP: 'Otp',
  RESET_PASSWORD: 'ResetPassword',
  MAIN_TABS: 'MainTabs',
  EDIT_PROFILE: 'EditProfile',
  ORDER_DETAILS: 'OrderDetails',
  NOTIFICATIONS: 'Notifications',
  SMART_ROUTE: 'SmartRoute',

  // Bottom tabs (inside MAIN_TABS)
  HOME: 'Home',
  HISTORY: 'History',
  PROFILE: 'Profile',
};
