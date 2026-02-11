console.log("COGNITO_DOMAIN:", COGNITO_DOMAIN);
console.log("CLIENT_ID:", CLIENT_ID);
console.log("REDIRECT_URI:", REDIRECT_URI);


/// auth.js
const COGNITO_DOMAIN = import.meta.env.REACT_APP_COGNITO_DOMAIN;
const CLIENT_ID = import.meta.env.REACT_APP_CLIENT_ID;
const REDIRECT_URI = import.meta.env.REACT_APP_REDIRECT_URI;
const LOGOUT_URI = import.meta.env.REACT_APP_LOGOUT_URI;
const RESPONSE_TYPE = 'code';
const SCOPE = 'openid email phone';

export function signIn() {
  const loginUrl = `${COGNITO_DOMAIN}/oauth2/authorize?client_id=${CLIENT_ID}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(
    SCOPE
  )}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

  window.location.href = loginUrl;
}

export function signOut() {
  const logoutUrl = `${COGNITO_DOMAIN}/logout?client_id=${CLIENT_ID}&logout_uri=${encodeURIComponent(
    LOGOUT_URI
  )}`;
  window.location.href = logoutUrl;
}

export function getUser() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code) return null;
  return { code };
}
