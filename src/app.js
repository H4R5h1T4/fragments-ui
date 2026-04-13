import { signIn, signOut, handleRedirectCallback, getIdToken, isLoggedIn } from './auth.js';

const API_URL = process.env.API_URL || 'http://localhost:8080';

let editingFragment = null;

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
      <strong>Updated:</strong> ${fragment.updated}<br><br>

      <button class="edit-fragment" data-id="${fragment.id}" data-type="${fragment.type}">
        Edit
      </button>

      <button class="delete-fragment" data-id="${fragment.id}">
        Delete
      </button>
    `;

    list.appendChild(li);
  });

  document.querySelectorAll('.delete-fragment').forEach((button) => {
    button.onclick = async () => {
      const id = button.dataset.id;
      await deleteFragment(id);
    };
  });

  document.querySelectorAll('.edit-fragment').forEach((button) => {
    button.onclick = async () => {
      const id = button.dataset.id;
      const type = button.dataset.type;
      await startEditFragment(id, type);
    };
  });
}

async function loadFragments() {
  const result = document.querySelector('#create-result');

  try {
    const response = await apiRequest('/v1/fragments?expand=1');

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Load failed: ${response.status} ${text}`);
    }

    const data = await response.json();
    renderFragments(data.fragments || []);
  } catch (err) {
    result.textContent = `Error loading fragments: ${err.message}`;
    console.error(err);
  }
}

async function createFragment() {
  const type = document.querySelector('#fragment-type').value;
  const content = document.querySelector('#fragment-content').value;
  const result = document.querySelector('#create-result');

  try {
    const isEditing = !!editingFragment;

    const path = isEditing
      ? `/v1/fragments/${editingFragment.id}`
      : '/v1/fragments';

    const method = isEditing ? 'PUT' : 'POST';

    const response = await apiRequest(path, {
      method,
      headers: {
        'Content-Type': type,
      },
      body: content,
    });

    const text = await response.text();
    let data = {};

    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      throw new Error(data?.error?.message || `Request failed: ${response.status}`);
    }

    if (isEditing) {
      result.textContent = `Fragment updated successfully: ${editingFragment.id}`;

      editingFragment = null;
      document.querySelector('#submit-fragment').textContent = 'Create Fragment';
    } else {
      const location = response.headers.get('Location');

      result.textContent = `Fragment created successfully. Location: ${location}`;
    }

    document.querySelector('#fragment-content').value = '';

    await loadFragments();
  } catch (err) {
    result.textContent = `Error creating/updating fragment: ${err.message}`;
  }
}

async function deleteFragment(id) {
  const result = document.querySelector('#create-result');

  try {
    const response = await apiRequest(`/v1/fragments/${id}`, {
      method: 'DELETE',
    });

    const text = await response.text();
    let data = {};

    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      throw new Error(data?.error?.message || 'Delete failed');
    }

    result.textContent = `Fragment deleted successfully: ${id}`;

    if (editingFragment && editingFragment.id === id) {
      editingFragment = null;
      document.querySelector('#fragment-content').value = '';
      document.querySelector('#submit-fragment').textContent = 'Create Fragment';
    }

    await loadFragments();
  } catch (err) {
    result.textContent = `Error deleting fragment: ${err.message}`;
  }
}

async function startEditFragment(id, type) {
  const result = document.querySelector('#create-result');

  try {
    const response = await apiRequest(`/v1/fragments/${id}`);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to load fragment: ${text}`);
    }

    const content = await response.text();

    editingFragment = { id, type };

    document.querySelector('#fragment-type').value = type;
    document.querySelector('#fragment-content').value = content;

    document.querySelector('#submit-fragment').textContent = 'Update Fragment';

    result.textContent = `Editing fragment: ${id}`;
  } catch (err) {
    result.textContent = `Error loading fragment: ${err.message}`;
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