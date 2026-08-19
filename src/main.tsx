import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import { registerServiceWorker } from './utils/pwa';

registerServiceWorker();

const root = document.getElementById('root');
if (!root) throw new Error('ChronoAge root element was not found.');
createRoot(root).render(<StrictMode><App /></StrictMode>);
