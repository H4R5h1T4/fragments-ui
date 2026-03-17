import { signIn, signOut, handleRedirectCallback, getIdToken, isLoggedIn } from './auth.js';

const API_URL = 'http://3.142.248.221:8080';

async function apiRequest(path, options = {}) {
  const token = getIdToken();

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  return response;
}

function renderFragments(fragments) {
  const list = document.querySelector('#fragments-list');
  list.innerHTML = '';

  if (!fragments.length) {
    const li = document.createElement('li');
    li.textContent = 'No fragments found.';
    list.appendChild(li);
    return;
  }

  fragments.forEach((fragment) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>ID:</strong> ${fragment.id}<br>
      <strong>Type:</strong> ${fragment.type}<br>
      <strong>Size:</strong> ${fragment.size}<br>
      <strong>Created:</strong> ${fragment.created}<br>
      <strong>Updated:</strong> ${fragment.updated}
    `;
    list.appendChild(li);
  });
}

async function loadFragments() {
  const result = document.querySelector('#create-result');

  try {
    const response = await apiRequest('/v1/fragments?expand=1');

    if (!response.ok) {
      throw new Error('Failed to load fragments');
    }

    const data = await response.json();
    renderFragments(data.fragments || []);
  } catch (err) {
    result.textContent = `Error loading fragments: ${err.message}`;
  }
}

async function createFragment() {
  const type = document.querySelector('#fragment-type').value;
  const content = document.querySelector('#fragment-content').value;
  const result = document.querySelector('#create-result');

  try {
    const response = await apiRequest('/v1/fragments', {
      method: 'POST',
      headers: {
        'Content-Type': type,
      },
      body: content,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || 'Failed to create fragment');
    }

    const location = response.headers.get('Location');
    result.textContent = `Fragment created successfully. Location: ${location}`;

    document.querySelector('#fragment-content').value = '';
    await loadFragments();
  } catch (err) {
    result.textContent = `Error creating fragment: ${err.message}`;
  }
}

async function init() {
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  const userSection = document.querySelector('#user');
  const createSection = document.querySelector('#create-fragment');
  const listSection = document.querySelector('#fragments-list-section');
  const username = document.querySelector('.username');
  const refreshBtn = document.querySelector('#refresh-fragments');
  const submitBtn = document.querySelector('#submit-fragment');

  loginBtn.onclick = () => signIn();
  logoutBtn.onclick = () => signOut();
  refreshBtn.onclick = () => loadFragments();
  submitBtn.onclick = () => createFragment();

  try {
    await handleRedirectCallback();
  } catch (err) {
    document.querySelector('#create-result').textContent = `Login error: ${err.message}`;
  }

  if (isLoggedIn()) {
    userSection.hidden = false;
    createSection.hidden = false;
    listSection.hidden = false;
    username.innerText = 'Harshita';
    loginBtn.disabled = true;

    await loadFragments();
  }
}

document.addEventListener('DOMContentLoaded', init);