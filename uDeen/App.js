import React, { useEffect, useState } from 'react';
import { View, Text, Button, Switch, Alert } from 'react-native';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to request location permission (Android only)
const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'We need access to your location to track coordinates.',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true; // iOS allows location permissions automatically
};

const App = () => {
  const [isSendingData, setIsSendingData] = useState(false);
  const [coordinates, setCoordinates] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [syncIntervalId, setSyncIntervalId] = useState(null);

  // Function to fetch geo-coordinates and store locally
  const fetchCoordinates = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const newCoordinates = { latitude, longitude, timestamp: new Date().toISOString() };
        setCoordinates(prevCoordinates => [...prevCoordinates, newCoordinates]);
      },
      error => {
        Alert.alert('Error', 'Failed to get location: ' + error.message);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  useEffect(() => {
    // Request location permission on mount
    requestLocationPermission();

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => {
      // Cleanup on unmount
      if (intervalId) clearInterval(intervalId);
      if (syncIntervalId) clearInterval(syncIntervalId);
      unsubscribe();
    };
  }, []);

  return (
    <View>
      <Text>React Native App</Text>
      <Button title="Fetch Coordinates" onPress={fetchCoordinates} />
      <Switch
        value={isSendingData}
        onValueChange={setIsSendingData}
      />
    </View>
  );
};

export default App;