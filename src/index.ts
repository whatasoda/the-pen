import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { AudioPrivider } from './core/useAudio';
import { PermissionRequestProvider } from './utils/permission';
import providerWrapper from './utils/providerWrapper';

const Provider = providerWrapper([AudioPrivider, PermissionRequestProvider]);

const render = () => {
  ReactDOM.render(React.createElement(Provider, {}, React.createElement(App)), document.getElementById('App'));
};

render();
