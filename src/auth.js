const COGNITO_DOMAIN = process.env.REACT_APP_COGNITO_DOMAIN;
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI;
const LOGOUT_URI = process.env.REACT_APP_LOGOUT_URI;
const RESPONSE_TYPE = 'code';
const SCOPE = 'openid email phone';

console.log('COGNITO_DOMAIN =', COGNITO_DOMAIN);
console.log('CLIENT_ID =', CLIENT_ID);
console.log('REDIRECT_URI =', REDIRECT_URI);

function getTokenEndpoint() {
  return `${COGNITO_DOMAIN}/oauth2/token`;
}

export function signIn() {
  const loginUrl = `${COGNITO_DOMAIN}/oauth2/authorize?client_id=${CLIENT_ID}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(
    SCOPE
  )}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

  window.location.href = loginUrl;
}

export function signOut() {
  localStorage.removeItem('id_token');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');

  const logoutUrl = `${COGNITO_DOMAIN}/logout?client_id=${CLIENT_ID}&logout_uri=${encodeURIComponent(
    LOGOUT_URI
  )}`;
  window.location.href = logoutUrl;
}

export function getIdToken() {
  return localStorage.getItem('id_token');
}

export function isLoggedIn() {
  return !!getIdToken();
}

export async function handleRedirectCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  if (!code) {
    return null;
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: CLIENT_ID,
    code,
    redirect_uri: REDIRECT_URI,
  });

  const response = await fetch(getTokenEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    throw new Error('Failed to exchange authorization code for tokens');
  }

  const tokens = await response.json();

  localStorage.setItem('id_token', tokens.id_token);
  localStorage.setItem('access_token', tokens.access_token || '');
  localStorage.setItem('refresh_token', tokens.refresh_token || '');

  // Clean the URL after login so the code param disappears
  window.history.replaceState({}, document.title, window.location.pathname);

  return tokens;
}