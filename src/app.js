import { signIn, signOut, getUser } from './auth.js';

function init() {
  const loginBtn = document.querySelector('#login');
  const userSection = document.querySelector('#user');

  loginBtn.onclick = () => signIn();

  const user = getUser();
  if (user) {
    userSection.hidden = false;
    userSection.querySelector('.username').innerText = 'Logged in!'; // simple placeholder
    loginBtn.disabled = true;
  }

  document.querySelector('#logout')?.addEventListener('click', () => signOut());
}

document.addEventListener('DOMContentLoaded', init);
