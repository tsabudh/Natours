/*eslint-disable*/

import { netlifyAPIRoute } from './index';

export const handleNavigation = (e) => {
  console.log('navigation invoked');
  let renderedHTMLResponse;
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      renderedHTMLResponse = this.responseText;
      document.getElementsByClassName('user-view_content')[0].innerHTML =
        renderedHTMLResponse;
    }
  };
  // e.target.dataset.to
  xhttp.open('GET', `${netlifyAPIRoute}/me/${e.target.dataset.to}`);
  xhttp.send();
};
