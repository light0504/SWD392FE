import React from 'react';
import Hero from '../../sections/Hero/Hero';
import Services from '../../sections/Services/Services';
import { Helmet } from 'react-helmet-async';

const HomePage = () => {
  return (
    <>
      <Helmet>
                <title>Pet Paradise</title>
            </Helmet>
      <Hero />
      <Services isFeatured={true} /> 
    </>
  );
};

export default HomePage;