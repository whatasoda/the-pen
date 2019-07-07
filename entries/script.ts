import './index.html';
import React from 'react';
import { render } from 'react-dom';
// import Nyoro from '../packages/nyoro/components/Nyoro';
import Byon from '../packages/nyoro/components/Byon';

render(React.createElement(Byon, {}), document.getElementById('App'));
