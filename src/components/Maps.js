import React from "react";
import { Modal, View, Text, TouchableOpacity, Platform } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

const MapPickerModal = ({ visible, onClose, onSelect, initialLocation }) => {
  const fallbackLocation = {
    latitude: -6.3485,
    longitude: 107.1484,
  };

  const [selectedLocation, setSelectedLocation] = React.useState(null);
  const [deviceLocation, setDeviceLocation] = React.useState(null);

  const getDeviceLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Izin lokasi ditolak");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setDeviceLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (error) {
      console.error("Gagal mendapatkan lokasi device:", error);
    }
  };

  React.useEffect(() => {
    if (visible) {
      getDeviceLocation();
    }

    if (initialLocation) {
      setSelectedLocation(initialLocation);
    } else {
      setSelectedLocation(null);
    }
  }, [initialLocation, visible]);

  const handleSelectLocation = () => {
    if (selectedLocation) {
      onSelect(selectedLocation);
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1 }}>
        <MapView
          style={{ flex: 1 }}
          provider={Platform.OS === "android" ? "google" : null}
          initialRegion={{
            latitude: initialLocation?.latitude ?? deviceLocation?.latitude ?? fallbackLocation.latitude,
            longitude: initialLocation?.longitude ?? deviceLocation?.longitude ?? fallbackLocation.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          onPress={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
        >
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              title="Titik Terpilih"
              pinColor="blue"
            />
          )}
          {deviceLocation && (
            <Marker
              coordinate={deviceLocation}
              title="Lokasi Anda"
              pinColor="green"
            />
          )}
        </MapView>

        <View
          style={{
            padding: 16,
            flexDirection: "row",
            justifyContent: "space-around",
            backgroundColor: "#fff",
          }}
        >
          <TouchableOpacity
            onPress={onClose}
            style={{
              padding: 12,
              borderRadius: 10,
              backgroundColor: "#ccc",
              flex: 1,
              marginRight: 8,
            }}
          >
            <Text style={{ textAlign: "center" }}>Batal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSelectLocation}
            disabled={!selectedLocation}
            style={{
              padding: 12,
              borderRadius: 10,
              backgroundColor: selectedLocation ? "#0973FF" : "#bbb",
              flex: 1,
              marginLeft: 8,
            }}
          >
            <Text
              style={{
                color: "#fff",
                textAlign: "center",
                opacity: selectedLocation ? 1 : 0.6,
              }}
            >
              Pilih Lokasi Ini
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default MapPickerModal;
