import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import AddUser from './components/AddUser';
import AddCourt from './components/AddCourt';
import ListUsers from './components/ListUsers';
import ListCourts from './components/ListCourts';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="/users" element={<PrivateRoute />}>
          <Route path="/users" element={<ListUsers />} />
        </Route>
        <Route path="/courts" element={<PrivateRoute />}>
          <Route path="/courts" element={<ListCourts />} />
        </Route>
        <Route path="/add-user" element={<PrivateRoute />}>
          <Route path="/add-user" element={<AddUser />} />
        </Route>
        <Route path="/add-court" element={<PrivateRoute />}>
          <Route path="/add-court" element={<AddCourt />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
