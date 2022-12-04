/* eslint-disable */

import '@babel/polyfill';

import { login } from './login';

function submitForm(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
}

//DOM ELEMENTS
const loginForm = document.querySelector('.form');

if (loginForm) {
  loginForm.addEventListener('submit', submitForm);
}
