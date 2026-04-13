import React, { useState } from 'react';
import { Text, View, StyleSheet, Button, ActivityIndicator, ScrollView } from 'react-native';
import * as Location from 'expo-location';
 
export default function App() {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
 
  //  Função para buscar endereço (Reverse Geocoding)
  const fetchAddress = async (lat, lon) => {
    try {
      let result = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
      if (result.length > 0) {
        const addr = result[0];
        setAddress(`${addr.street}, ${addr.name} - ${addr.district}, ${addr.city}`);
      }
    } catch (e) {
      setAddress("Endereço não disponível");
    }
  };
 
  //  GPS REAL
  const getLocationSmart = async () => {
    setLoading(true);
    setErrorMsg(null);
    setAddress(null);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') throw new Error('Permissão negada');
 
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
 
      setLocation(currentLocation);
      await fetchAddress(currentLocation.coords.latitude, currentLocation.coords.longitude);
    } catch (error) {
      setErrorMsg('Erro ao acessar GPS real.');
    } finally {
      setLoading(false);
    }
  };
 
  //  MOCK FIXO
  const getMockLocation = () => {
    const lat = -23.55052;
    const lon = -46.633308;
    setLocation({ coords: { latitude: lat, longitude: lon } });
    fetchAddress(lat, lon);
  };
 
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}> Localizador de Endereço</Text>
 
      {loading && <ActivityIndicator size="large" color="#2ecc71" />}
      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
 
      {location ? (
        <View style={styles.card}>
          <Text style={styles.label}>Coordenadas:</Text>
          <Text>{location.coords.latitude}, {location.coords.longitude}</Text>
         
          <Text style={styles.label}>Endereço:</Text>
          <Text style={styles.addressText}>{address || 'Buscando...'}</Text>
        </View>
      ) : (
        <Text style={styles.info}>Clique no botão para localizar</Text>
      )}
 
      <View style={styles.buttons}>
        <Button title=" Buscar GPS Real" onPress={getLocationSmart} color="#2ecc71" />
        <Button title=" Testar com Mock" onPress={getMockLocation} color="#34495e" />
      </View>
    </ScrollView>
  );
}
 
const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f6fa' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 5, marginBottom: 20 },
  label: { fontWeight: 'bold', marginTop: 10, color: '#7f8c8d' },
  addressText: { fontSize: 16, color: '#2c3e50', marginTop: 5 },
  info: { textAlign: 'center', marginVertical: 20, color: '#95a5a6' },
  buttons: { gap: 10 },
  error: { color: 'red', textAlign: 'center', marginBottom: 10 }
});