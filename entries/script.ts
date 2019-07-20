import './index.html';
import React from 'react';
import { render } from 'react-dom';
// import Nyoro from '../packages/nyoro/components/Nyoro';
import Byon from '../src/nyoro/components/Byon';

render(React.createElement(Byon, {}), document.getElementById('App'));
