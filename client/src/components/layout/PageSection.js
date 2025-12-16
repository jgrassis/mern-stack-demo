import React from 'react';
import { Outlet } from 'react-router-dom';
import Alert from '../layout/Alert';

const PageSection = () => {
  return (
    <section className='container'>
      <Alert />
      <Outlet />
    </section>
  );
};

export default PageSection;
