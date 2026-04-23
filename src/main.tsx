import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DevTweak } from 'dev-tweak-tool';
import 'tdesign-mobile-react/es/style/index.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    <App />
    {import.meta.env.DEV && <DevTweak />}
  </>
);
