import { useParams } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import { getServiceById } from "../../api/serviceapi";

const DetailPage = () => {
  const { serviceId } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        const data = await getServiceById(serviceId);
        setService(data.data);
      } catch (err) {
        setError(err.message || "Failed to fetch service details");
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [serviceId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{service.name}</h1>
      <p>{service.description}</p>
      <p>Price: ${service.price}</p>
        <p>Duration: {service.duration} minutes</p>
    </div>
  );
}

export default DetailPage;