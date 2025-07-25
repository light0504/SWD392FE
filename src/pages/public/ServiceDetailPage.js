import DetailPage from '../../components/ServiceDetailPage/DetailPage';
import { Helmet } from 'react-helmet-async';

const ServiceDetailPage = () => {
  return(
    <div style={{ paddingTop: '4rem' }}>
<Helmet>
                <title>Chi tiết dịch vụ</title>
            </Helmet> 
        <DetailPage />
    </div>
    
  ) 
}

export default ServiceDetailPage;