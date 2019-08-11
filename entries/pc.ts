import './pc.html';
import React from 'react';
import { render } from 'react-dom';
import PC from '../src/nyoro/PC';

const APP = document.createElement('div');
document.body.appendChild(APP);

render(React.createElement(PC, {}), APP);
