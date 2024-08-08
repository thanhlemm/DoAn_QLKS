import React, { useEffect } from 'react';

const loadGoogleScript = (callback) => {
  const existingScript = document.getElementById('googleScript');
  if (!existingScript) {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.id = 'googleScript';
    document.body.appendChild(script);

    script.onload = () => {
      if (callback) callback();
    };
  } else {
    if (callback) callback();
  }
};

export default loadGoogleScript;
