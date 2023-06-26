/* eslint-disable */

import '@babel/polyfill';

import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { handleNavigation } from './handleNavigation';

// export const netlifyAPIRoute = 'http://127.0.0.1:8888'; //! NETLIFY API ROUTE FOR DEV
export const netlifyAPIRoute = "/.netlify/functions/api"; //! NETLIFY API ROUTE FOR DEPLOY

function submitForm(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
}

//DOM ELEMENTS
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav_el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const sideNav = document.querySelector('.side-nav');
let tabs;
if (sideNav) {
  tabs = sideNav.querySelectorAll('.tab');
  console.log('sidenav ok');
}
if (loginForm) {
  loginForm.addEventListener('submit', submitForm);
}

if (logOutBtn) {
  // console.log('logout button before click event');
  logOutBtn.addEventListener('click', logout);
  // console.log('logout button after click event');
}

if (userDataForm) {
  userDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = new FormData();

    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    // updateData(name, email);
    await updateSettings(form, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    userPasswordForm.querySelector('.btn-save-password').textContent =
      'Updating..';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );
    userPasswordForm.querySelector('.btn-save-password').textContent =
      'Save Password';

    // password = passwordConfirm = passwordCurrent = ''; why this is causing the following code to not execute??

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    bookBtn.innerText = 'processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}

if (tabs) {
  console.log('added evenetlinstankan');
  tabs.forEach((tab) => {
    console.log(tab);
    tab.addEventListener('click', handleNavigation);
  });
}
