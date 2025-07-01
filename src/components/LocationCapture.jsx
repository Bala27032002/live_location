import React, { useEffect, useState } from 'react';

const LocationCapture = () => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);

  const fetchLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          };
          setLocation(coords);
          localStorage.setItem('user_location', JSON.stringify(coords));

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
            );
            const data = await response.json();
            const fullAddress = data.display_name || 'Address not found';
            setAddress(fullAddress);
            localStorage.setItem('user_address', fullAddress);

            // ✅ SEND TO BACKEND
            await fetch('http://localhost:5000/save-location', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                latitude: coords.latitude,
                longitude: coords.longitude,
                address: fullAddress,
                mobile: '9876543210',
              }),
            });
          } catch (err) {
            console.error('Error sending location:', err);
          }
        },
        (error) => {
          if (error.code === 1) {
            setErrorMsg('❌ Location access denied. Please allow permission.');
            setPermissionDenied(true);
          } else {
            setErrorMsg('❌ Location unavailable or failed.');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setErrorMsg('❌ Geolocation is not supported by your browser.');
    }
  };

  useEffect(() => {
    const storedLocation = localStorage.getItem('user_location');
    const storedAddress = localStorage.getItem('user_address');

    if (storedLocation && storedAddress) {
      setLocation(JSON.parse(storedLocation));
      setAddress(storedAddress);
    } else {
      fetchLocation();
    }
  }, []);

  const clearStorage = () => {
    localStorage.removeItem('user_location');
    localStorage.removeItem('user_address');
    window.location.reload();
  };

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
          <button
            onClick={clearStorage}
            style={{
              marginTop: 20,
              backgroundColor: '#dc3545',
              color: '#fff',
              padding: '8px 12px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Clear Location & Refresh
          </button>
        </div>
      ) : errorMsg ? (
        <div>
          <p style={{ color: 'red' }}>{errorMsg}</p>
          {permissionDenied && (
            <button
              onClick={fetchLocation}
              style={{
                padding: '8px 12px',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              🔓 Allow Location
            </button>
          )}
        </div>
      ) : (
        <p>📡 Getting your live location...</p>
      )}
    </div>
  );
};

export default LocationCapture;
