import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { UserAuthProvider } from './context/UserAuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import App from './App';
import ErrorBoundary from './components/common/ErrorBoundary';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <UserAuthProvider>
          <AdminAuthProvider>
            <App />
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          </AdminAuthProvider>
        </UserAuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
