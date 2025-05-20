import React, { useState, useEffect } from 'react';
import { View, Text, Image, Alert, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const Agrico = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const API_URL = "https://ricemodelbackend-production.up.railway.app/predict";

  useEffect(() => {
    const requestPermissions = async () => {
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (mediaStatus === 'granted' && cameraStatus === 'granted') {
        setHasPermission(true);
      } else {
        setHasPermission(false);
        Alert.alert('Permissions Required', 'Please grant camera and photo library permissions.');
      }
    };
    requestPermissions();
  }, []);

  if (hasPermission === null) return <Text>Requesting permissions...</Text>;
  if (hasPermission === false) return <Text>No access to camera or gallery.</Text>;

  const pickImage = async () => {
    setError(null);
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
      if (!result.canceled) setImage(result.assets[0].uri);
    } catch {
      setError('Error picking image.');
    }
  };

  const takePhoto = async () => {
    setError(null);
    try {
      let result = await ImagePicker.launchCameraAsync({ quality: 1 });
      if (!result.canceled) setImage(result.assets[0].uri);
    } catch {
      setError('Error taking photo.');
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      setError('Please select or capture an image.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', { uri: image, type: 'image/jpeg', name: 'image.jpg' });

    try {
      const response = await fetch(API_URL, { method: 'POST', body: formData, headers: { 'Content-Type': 'multipart/form-data' } });
      const data = await response.json();
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to detect disease.');
      }
    } catch {
      setError('Network error. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ flex: 1, padding: 20, alignItems: 'center' }}>
        
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 20 }}>🌾 Rice Disease Detector</Text>

         {/* Fixed container for image or placeholder */}
      <View
        style={{
          width: 300,
          height: 300,
          borderRadius: 10,
          marginVertical: 20,
          backgroundColor: '#e0e0e0',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {image ? (
          <Image
            source={{ uri: image }}
            style={{ width: '100%', height: '100%', borderRadius: 10 }}
          />
        ) : (
          <Text style={{ color: '#777', fontSize: 16, textAlign: 'center', paddingHorizontal: 16 }}>
            Please upload an image to detect disease.
          </Text>
        )}
      </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 }}>
          <TouchableOpacity style={{ flex: 1, marginRight: 10, backgroundColor: '#007bff', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} onPress={pickImage}>
            <MaterialIcons name="photo-library" size={24} color="white" />
            <Text style={{ color: 'white', fontSize: 16, marginLeft: 10 }}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ flex: 1, backgroundColor: '#28a745', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} onPress={takePhoto}>
            <FontAwesome5 name="camera" size={20} color="white" />
            <Text style={{ color: 'white', fontSize: 16, marginLeft: 10 }}>Camera</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={{ backgroundColor: '#dc3545', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }} onPress={handleSubmit} disabled={loading}>
          <FontAwesome5 name="search" size={20} color="white" />
          <Text style={{ color: 'white', fontSize: 16, marginLeft: 10 }}>{loading ? 'Detecting...' : 'Detect Disease'}</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="blue" style={{ marginTop: 10 }} />}

        {error && <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text>}

        {result && (
          <View style={{ marginTop: 20, padding: 15, backgroundColor: 'white', borderRadius: 10, width: '100%', elevation: 3 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Disease Detected:</Text>
            <Text style={{ fontSize: 16, color: '#007bff' }}>Disease: {result.class}</Text>
            <Text style={{ fontSize: 16 }}>Confidence: {(result.confidence * 100).toFixed(2)}%</Text>
            <Text style={{ fontSize: 16, color: '#dc3545' }}>Symptoms: {result.symptoms}</Text>
            <Text style={{ fontSize: 16, color: '#28a745' }}>Treatment: {result.treatment}</Text>
          </View>
        )}

        <TouchableOpacity style={{ marginTop: 20, backgroundColor: '#6c757d', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }} onPress={handleRefresh}>
          <Text style={{ color: 'white', fontSize: 16 }}>Refresh</Text>
        </TouchableOpacity>
        <Image source={require('../assets/logo.png')} style={{ width: 100, height: 100, marginBottom: 10 }} />
      </View>
    </ScrollView>
  );
};

export default Agrico;
