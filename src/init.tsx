import React from 'react';
import { render } from 'react-dom';
import App from './App';

const init = () => {
  render(<App />, document.getElementById('App'));
};

export default init;
