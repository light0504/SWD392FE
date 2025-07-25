import React from 'react';
import Services from '../../sections/Services/Services';
import { Helmet } from 'react-helmet-async';

const ServicesPage = () => {
  return (
    // Component Services đã được thiết kế để có thể tái sử dụng ở bất kỳ đâu
    <div style={{ paddingTop: '2rem' }}>
      <Helmet>
                <title>Dịch vụ</title>
            </Helmet>
        <Services />
    </div>
  );
};

export default ServicesPage;