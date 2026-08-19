import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import './styles.css';
import { installGlobalErrorLogging } from './utils/logger';
import { registerServiceWorker } from './utils/pwa';

installGlobalErrorLogging();
registerServiceWorker();

const root = document.getElementById('root');
if (!root) throw new Error('ChronoAge root element was not found.');
createRoot(root).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);
