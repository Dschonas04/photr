import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateScrapbook from './pages/CreateScrapbook';
import ViewScrapbook from './pages/ViewScrapbook';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/scrapbooks/new"
          element={
            <PrivateRoute>
              <CreateScrapbook />
            </PrivateRoute>
          }
        />
        <Route
          path="/scrapbooks/:id"
          element={
            <PrivateRoute>
              <ViewScrapbook />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
