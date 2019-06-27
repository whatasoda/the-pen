import './index.html';
import React from 'react';
import { render } from 'react-dom';
import Nyoro from '../packages/nyoro/components/Nyoro';

render(React.createElement(Nyoro, {}), document.getElementById('App'));
