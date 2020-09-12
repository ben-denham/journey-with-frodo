import React from 'react';
import ReactDOM from 'react-dom';

import {QueryParamsProvider} from './services/queryparams';
import App from './components/App';
import './index.css';

ReactDOM.render(
  (
    <QueryParamsProvider>
      <App />
    </QueryParamsProvider>
  ),
  document.getElementById('root')
);
