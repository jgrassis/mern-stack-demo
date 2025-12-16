// Framework Imports
import React, { Fragment } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

// State Imports
import store from './store';

// Component Imports
import NavBar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import PageSection from './components/layout/PageSection';
import Register from './components/auth/Register';
import Login from './components/auth/Login';

// Other
import './App.css';

const App = () => (
  <Provider store={store}>
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
  </Provider>
);

export default App;
