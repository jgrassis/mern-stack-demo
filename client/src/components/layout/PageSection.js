import React from 'react';
import { Outlet } from 'react-router-dom';

const PageSection = () => {
  return (
    <section className='container'>
      <Outlet />
    </section>
  );
};

export default PageSection;
