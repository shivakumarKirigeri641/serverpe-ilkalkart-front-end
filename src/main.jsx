import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
      <CartProvider>
        <App />
        <Toaster position="top-center" toastOptions={{
          style: { background: '#7B1E3A', color: '#FFF8F0', borderRadius: '999px', fontFamily: 'Poppins' }
        }} />
      </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
