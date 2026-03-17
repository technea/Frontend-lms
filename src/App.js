import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { ThemeProvider } from './context/ThemeContext';
// import AIChatbot from './components/AIChatbot';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <AppRoutes />
          <ToastContainer position="top-right" autoClose={3000} />
          {/* <AIChatbot /> */}
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
