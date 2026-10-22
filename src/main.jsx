import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';
import { CatalogProvider } from './context/CatalogContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <CatalogProvider>
          <WishlistProvider>
            <App />
          </WishlistProvider>
        </CatalogProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>
);
