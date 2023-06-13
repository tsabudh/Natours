/*eslint-disable*/

import axios from "axios";
import { showAlert } from "./alerts";

import { netlifyAPIRoute } from "./index";
//---------------

export const login = async (email, password) => {
  try {
    const response = await axios({
      method: "POST",
      url: `${netlifyAPIRoute}/api/v1/users/login`,
      data: {
        email,
        password,
      },
    });

    if (response.data.status === "success") {
      showAlert("success", "Logged in successfully!");
      window.setTimeout(() => location.assign(netlifyAPIRoute), 1500);
    }
  } catch (err) {
    console.log("axios error login function");
    console.log(err);

    showAlert("error", err.response.data.message);
  }
};

// console.log(document.querySelector('.form'));

export const logout = async () => {
  console.log("logout is invoked!");
  try {
    const response = await axios({
      method: "GET",
      url: `${netlifyAPIRoute}/api/v1/users/logout`,
    });
    console.log("try block of logout function");

    if (response.data.status == "success") {
      // console.log(location);
      location.assign(location.origin);
    }
  } catch (err) {
    console.log("catch block of logout function");
    showAlert("error", "Error logging out! Try again");
  }
};
