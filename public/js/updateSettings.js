/*eslint-disable*/

import axios from 'axios';
import { showAlert } from './alerts';
import { netlifyAPIRoute } from './index';

//type is either 'data' or 'password'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? `${netlifyAPIRoute}/api/v1/users/updateMyPassword`
        : `${netlifyAPIRoute}/api/v1/users/updateMe`;

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status) {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const updateData = async (name, email) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `${netlifyAPIRoute}/api/v1/users/updateMe`,
      data: {
        name,
        email,
      },
    });

    if (res.data.status) {
      showAlert('success', `Data updated successfully!`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
// User validation failed: passwordConfirm: Passwords are not the same!
// UNHANDLED REJECTION!💥💥 Shutting down...! 