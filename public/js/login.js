/*eslint-disable*/
const login = (email, password) => {
  alert(email, password);
};

document.querySelector('.form').addEventListener('submit', (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
