/*eslint-disable*/

function submitForm(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
}

//---------------
const login = async (email, password) => {
  try {
    const response = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    
    if (response.data.status === 'success') {
      alert('Logged in successfully');
      window.setTimeout(() => location.assign('/'), 1500);
    }
  } catch (err) {
    alert(err);
  }
};

document.querySelector('.form').addEventListener('submit', submitForm);

// console.log(document.querySelector('.form'));
