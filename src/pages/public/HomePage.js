import React from 'react';
import Hero from '../../sections/Hero/Hero';
import Services from '../../sections/Services/Services';

const HomePage = () => {
  return (
    <>
      <Hero />
      <Services isFeatured={true} /> 
    </>
  );
};

export default HomePage;