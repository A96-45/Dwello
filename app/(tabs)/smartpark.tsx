import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function SmartParkTab() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main SmartPark screen
    router.replace('/smartpark');
  }, []);

  return null;
}

