import React from 'react';
import ReactDOM from 'react-dom';

const Root = () => (
  <div>hello</div>
);

document.addEventListener('DOMContentLoaded', () => {
  if (window.currentUser.id) {
    const preloadedState = {
      session: { currentUser: window.currentUser },
    };
    delete window.currentUser;
  } else {
  }

  const root = document.getElementById('root');
  ReactDOM.render(<Root />, root);
});