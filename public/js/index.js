/* eslint-disable */

import '@babel/polyfill';

import { login, logout } from './login';
import { updateData } from './updateSettings';

function submitForm(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
}

//DOM ELEMENTS *********************************************************************************
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
console.log(logOutBtn);

if (loginForm) {
  loginForm.addEventListener('submit', submitForm);
}

if (logOutBtn) {
  // console.log('logout button before click event');
  logOutBtn.addEventListener('click', logout);
  // console.log('logout button after click event');
}

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    console.log('form user data clicked');
    e.preventDefault();
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    console.log(name, email);
    updateData(name, email);
  });
}
