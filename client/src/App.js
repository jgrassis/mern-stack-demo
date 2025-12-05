import React, { Fragment } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import PageSection from './components/layout/PageSection';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import './App.css';

const App = () => (
  <Router>
    <Fragment>
      <NavBar />
      <Routes>
        <Route exact path='/' element={<Landing />} />
        <Route element={<PageSection />}>
          <Route exact path='/register' element={<Register />} />
          <Route exact path='/login' element={<Login />} />
        </Route>
      </Routes>
    </Fragment>
  </Router>
);

export default App;
