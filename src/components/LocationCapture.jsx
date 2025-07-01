import React, { useEffect, useState } from 'react';

const LocationCapture = () => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          };
          setLocation(coords);
          localStorage.setItem('user_location', JSON.stringify(coords));

          // Fetch readable address using reverse geocoding (OpenStreetMap)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
          );
          const data = await response.json();
          setAddress(data.display_name || 'Address not found');
        },
        (error) => {
          if (error.code === 1) {
            setErrorMsg('Location access denied.');
          } else if (error.code === 2) {
            setErrorMsg('Location unavailable.');
          } else {
            setErrorMsg('Failed to fetch location.');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setErrorMsg('Geolocation is not supported by your browser.');
    }
  }, []);

  const reload = () => window.location.reload();

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h2>📍 Live Location</h2>

      {location ? (
        <div>
          <p><strong>Latitude:</strong> {location.latitude}</p>
          <p><strong>Longitude:</strong> {location.longitude}</p>

          <p style={{ color: 'green' }}>
            <strong>📌 Address:</strong><br />
            {address}
          </p>

          <a
            href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 12px',
              display: 'inline-block',
              backgroundColor: '#007bff',
              color: '#fff',
              borderRadius: '5px',
              textDecoration: 'none',
              marginTop: 10,
            }}
          >
            View in Google Maps
          </a>

          <div style={{ marginTop: 20 }}>
            <iframe
              width="100%"
              height="300"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://maps.google.com/maps?q=${location.latitude},${location.longitude}&z=15&output=embed`}
              allowFullScreen
              title="Google Map"
            ></iframe>
          </div>
        </div>
      ) : errorMsg ? (
        <div>
          <p style={{ color: 'red' }}>{errorMsg}</p>
          <button onClick={reload}>Try Again</button>
        </div>
      ) : (
        <p>📡 Getting your live location...</p>
      )}
    </div>
  );
};

export default LocationCapture;
