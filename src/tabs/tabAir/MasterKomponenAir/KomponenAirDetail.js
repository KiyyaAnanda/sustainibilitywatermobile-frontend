import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  ActivityIndicator,
} from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import DropDown from "../../../components/DropDown";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import DropDownForm from "../../../components/DropDownForm";
import FormLayoutHistory from "../../../components/FormLayoutHistory";
import { stylesB, stylesDetail } from "../../../styles/globalStyles";
import { postUser, postUserArray } from "../../../services/apiService";
import TextView from "../../../components/TextView";
import SensorList from "../../../components/SensorList"; // PASTIKAN ini diimpor
import Paging from "../../../components/Paging";
import * as Location from "expo-location";
import { Linking, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";

const KomponenAirDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id, idcom } = route.params || {};
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState([]); // ✅ Tambahkan state ini
  const { t } = useTranslation();

  const [locations, setLocations] = useState(null);
  const formDataRef = useRef({
    komponen: "",
    kondisi: "",
    posisi: "",
    lokasi: "",
    latitude: "",
    longitude: "",
  });

  //usefocuseffect Digunakan untuk menjalankan kode setiap kali layar difokuskan
  //termasuk saat dibuka pertama kali dan saat balik lagi ke layar ini dari layar lain.

  //usecallback hook untuk membungkus fungsi agar tidak berubah saat render ulang
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setIsError({ error: false, message: "" });
        try {
          const data = await postUserArray("MasterKomponenAir/DetailKomponenAir", {
            id,
          });
          if (data === "ERROR" || !data || data.length === 0) {
            throw new Error("Gagal mengambil data target.");
          }

          formDataRef.current = { ...formDataRef.current, ...data[0] };
        } catch (error) {
          setIsError({ error: true, message: error.message });
        } finally {
          setIsLoading(false);
        }
      };

      if (id) {
        fetchData();
      } else {
        setIsError({
          error: true,
          message: "ID tidak ditemukan di route params.",
        });
        setIsLoading(false);
      }
    }, [id])
  );

  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        try {
          const data = await postUserArray(
            "MasterKomponenAir/DetailLogKomponenAir",
            { id }
          );
          setUserData(data);
        } catch (error) {
          console.error("Gagal mengambil data:", error);
        }
      };

      if (id) {
        loadUser();
      }
    }, [id])
  );

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Izin lokasi ditolak");
      return;
    }

    const currentLocation = await Location.getCurrentPositionAsync({});
    setLocations(currentLocation.coords);
  };

  const openGoogleMaps = () => {
    const { latitude, longitude } = formDataRef.current;

    if (!latitude || !longitude) {
      Alert.alert("Data lokasi tidak tersedia");
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url).catch(() => Alert.alert("Gagal membuka Google Maps"));
  };

  if (isLoading) return <Text>Loading...</Text>;
  if (isError.error) return <Text>Error: {isError.message}</Text>;

  return (
    <FormLayoutHistory
      source={require("../../../assets/picturePng/KomponenAir.png")}
      image={{ height: 400, position: "absolute", top: 0, left: 0, zIndex: 0 }}
      upperLabel={t("sensor_water_details")}
      lowerLabel={t("sensor_water_introduction")}
      scrollable={true}
      children2={
        <View style={styles.cardContainer}>
          <Text style={styles.historyTitle}>History</Text>
          {isLoading ? (
            <View style={{ marginTop: 30, alignItems: "center" }}>
              <ActivityIndicator size="large" color="#0973FF" />
              <Text style={{ marginTop: 10 }}>Memuat data...</Text>
            </View>
          ) : (
            <SensorList
              data={
                userData
                  ? userData.map((item, index) => ({
                      icon: "💧",
                      name: item["Lokasi"] || `Target ${index + 1}`,
                      value: item["Tanggal Penggunaan Air"] || "Tidak ada",
                      onPress: () =>
                        navigation.navigate("KomponenAirDetailHistory", {
                          id: item["ID Log"],
                          idcom: idcom,
                          name: item["Lokasi"],
                          value: item["Tanggal Penggunaan Air"],
                          value2: item["Tanggal Perpindahan Sensor"],
                        }),
                    }))
                  : []
              }
            />
          )}
        </View>
      }
    >
      <View style={styles.formContainer}>
        <Text style={stylesB.title}>Detail Sensor Air</Text>

        <View style={stylesDetail.rectangle}>
          <Button
            iconName="edit"
            style={{
              backgroundColor: "#fff",
              bottom: 179,
              left: 141,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 20,
              borderBottomLeftRadius: 15,
              borderBottomRightRadius: 0,
              justifyContent: "center",
              alignItems: "center",
              width: 60,
              height: 40,
              borderWidth: 2,
              borderColor: "#0971FB",
            }}
            iconColor={{ color: "#0971FB", fontWeight: "bold" }}
            onPress={() => navigation.navigate("KomponenAirEdit", { id })}
          />

          <View style={stylesDetail.containerValue}>
            <TextView title={t("name_sensor_water")} data={idcom} />
            <TextView
              title={t("location_sensor_water")}
              data={formDataRef.current.lokasi}
            />
            <TextView
              title={t("position_sensor_water")}
              data={formDataRef.current.posisi}
            />
            <TextView
              title={t("condition_sensor_water")}
              data={formDataRef.current.kondisi}
            />

            <Image
              source={require("../../../assets/picturePng/Town.png")}
              style={{
                position: "absolute",
                top: 107,
                left: 87,
                left: 87,
                zIndex: 0,
                height: 335,
                width: 240,
                height: 335,
                width: 220,
                resizeMode: "contain",
              }}
              pointerEvents="none" // 👈 penting agar tidak "menangkap" sentuhan
            />
          </View>
        </View>
      </View>

      <View style={styles.MapformContainer}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: "#0D47A1",
            marginBottom: 8,
            marginTop: 10,
            textAlign: "center",
          }}
        >
          {t("location_sensor_water_maps")}
        </Text>

        {formDataRef.current.latitude && formDataRef.current.longitude ? (
          <MapView
            style={{
              width: "100%",
              height: 200,
              marginTop: 8,
              borderRadius: 12,
            }}
            initialRegion={{
              latitude: parseFloat(formDataRef.current.latitude),
              longitude: parseFloat(formDataRef.current.longitude),
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: parseFloat(formDataRef.current.latitude),
                longitude: parseFloat(formDataRef.current.longitude),
              }}
              title={t("location_maps")}
            />
          </MapView>
        ) : (
          <Text
            style={{
              marginTop: 16,
              fontStyle: "italic",
              color: "gray",
              textAlign: "center",
            }}
          >
            {t("map_not_available")}
          </Text>
        )}

        <ScrollView>
          <View style={{ marginTop: 0, padding: 20 }}>
            <View style={{ marginTop: 0 }}>
              <Button
                label={t("open_goggle_maps")}
                onPress={openGoogleMaps}
                style={{
                  backgroundColor: "#0973FF", // warna latar belakang biru
                  borderRadius: 20,
                  paddingVertical: 12,
                }}
                textStyle={{
                  color: "#FFFFFF", // teks warna putih
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </FormLayoutHistory>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    padding: 24,
    marginTop: 280,
    height: 500,
    zIndex: 10,
  },
  MapformContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    padding: 24,
    marginTop: 10,
    zIndex: 10,
  },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32, // ⤶ curve
    padding: 16, // ⤶ ruang dalam
    marginHorizontal: 0, // ⤶ jarak dari sisi kiri/kanan layar
    marginTop: 10, // ⤶ jarak dari atas
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4, // ⤶ shadow untuk Android
  },

  historyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#0D47A1", // optional, bisa disesuaikan
  },
});

export default KomponenAirDetail;
