import React, { useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, Alert, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as yup from "yup";
import FormLayout from "../../../components/FormLayout";
import DropDownForm from "../../../components/DropDownForm";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import { stylesB } from "../../../styles/globalStyles";
import { postUser, postUserArray } from "../../../services/apiService";
import MapView, { Marker } from "react-native-maps";
import MapPickerModal from "../../../components/Maps"; // pastikan sudah dibuat
import { validateInput, validateAllInputs } from "../../../Util/ValdiationForm";
import LottieView from "lottie-react-native";
import { useTranslation } from "react-i18next";

const KomponenAirEdit = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params || {};
  const { t } = useTranslation();

  const [LocationList, setListLokasi] = useState([]);
  const [location, setLocation] = useState("");
  const [position, setPosition] = useState("Hilir");
  const [kondisiKeterangan, setKondisiKeterangan] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [noKomp, setNoKomp] = useState("");
  const [User, setUser] = useState("");
  const [UserLoading, setUserLoading] = useState(true);
  const [locations, setLocations] = useState(null); // untuk lat dan long
  const [showMap, setShowMap] = useState(false); // modal peta

  const schema = yup.object().shape({
    kondisiKeterangan: yup.string().required("Kondisi wajib diisi"),
    posisi: yup.string().required("Posisi wajib dipilih"),
    lokasi: yup.string().required("Lokasi wajib dipilih"),
  });

  useEffect(() => {
    const getSessionData = async () => {
      try {
        const userJson = await AsyncStorage.getItem("activeUser");
        if (userJson !== null) {
          const user = JSON.parse(userJson);
          if (user?.username) setUser(user.username);
        }
      } catch (error) {
        console.error("Gagal membaca session:", error);
      } finally {
        setTimeout(() => setUserLoading(false), 200);
      }
    };

    getSessionData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lokasiResult = await postUserArray("MasterLokasi/GetListLokasi", {});
        if (!Array.isArray(lokasiResult))
          throw new Error("Format data lokasi tidak sesuai");

        const transformed = lokasiResult.map((item) => ({
          label: item.Text,
          value: (item.Value ?? item.value ?? "").toString().trim(),
        }));
        setListLokasi(transformed);

        const data = await postUserArray(
          "MasterKomponenAir/GetDataKomponenAirById",
          {
            p1: id,
          }
        );

        if (data === "ERROR" || !data || data.length === 0)
          throw new Error("Gagal mengambil data sensor air.");

        const komponen = data[0];
        setLocation(komponen.lantai?.toString() || "");
        setPosition(komponen.letak || "");
        setKondisiKeterangan(komponen.kondisi || "");
        setNoKomp(komponen.nomorKomponen || "");

        if (komponen.latitude && komponen.longitude) {
          setLocations({
            latitude: parseFloat(komponen.latitude),
            longitude: parseFloat(komponen.longitude),
          });
        }
      } catch (error) {
        console.error("Error saat fetch data:", error.message);
        Alert.alert("Error", error.message);
      }
    };

    fetchData();
  }, []);

  const handleKondisiChange = async (value) => {
    setKondisiKeterangan(value);

    const result = await validateInput("kondisiKeterangan", value, schema);
    setErrors((prev) => ({
      ...prev,
      [result.name]: result.error || undefined,
    }));
  };

  const handleLocationChange = async (value) => {
    setLocation(value);

    const result = await validateInput("lokasi", value, schema);
    setErrors((prev) => ({
      ...prev,
      [result.name]: result.error || undefined,
    }));
  };

  const handleEdit = async () => {
    const formValues = {
      kondisiKeterangan,
      posisi: position,
      lokasi: location,
    };

    if (UserLoading) {
      Alert.alert("Harap tunggu", "Sedang memuat user...");
      return;
    }

    if (!User) {
      Alert.alert("Error", "User tidak terdeteksi. Silakan login ulang.");
      return;
    }

    // ✅ Validasi input form (field)
    const formErrors = await validateAllInputs(formValues, schema, setErrors);

    if (Object.keys(formErrors).length > 0) {
      return; // Stop jika ada error dari yup
    }

    // ✅ Validasi lokasi koordinat (manual)
    if (!locations) {
      Alert.alert("Error", "Lokasi belum dipilih di peta.");
      return;
    }

    try {
      const { latitude, longitude } = locations;

      const dataToSend = {
        p1: id.toString(),
        p2: noKomp,
        p3: kondisiKeterangan,
        p4: location,
        p5: position,
        p6: User,
        p7: latitude.toString(),
        p8: longitude.toString(),
        ...Object.fromEntries([...Array(42)].map((_, i) => [`p${i + 9}`, ""])),
      };

      setIsLoading(true);

      const data = await postUserArray(
        "MasterKomponenAir/EditKomponenAirMobile",
        dataToSend
      );

      if (data === "ERROR") throw new Error("Gagal mengubah data.");

      Alert.alert("Sukses", "Data berhasil diubah", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={[{ flex: 1, justifyContent: "center", alignItems: "center" }]}
      >
        <LottieView
          source={require("../../../assets/lottieAnimation/CuteBoyRunning_Loading.json")}
          autoPlay
          loop
          style={{ width: 150, height: 150 }}
        />
        <Text style={{ color: "#fff", marginTop: 16, fontSize: 16 }}>
          {t("loading")}
        </Text>
      </View>
    );
  }

  return (
    <FormLayout
      source={require("../../../assets/picturePng/KomponenAir.png")}
      enableScroll={true}
    >
      <ScrollView contentContainerStyle={stylesB.trformContainer}>
        <Text style={stylesB.title}>Edit Sensor Air</Text>

        <DropDownForm
          label="Lokasi"
          arrData={LocationList}
          selectedValue={location}
          onValueChange={handleLocationChange} // ✅ gunakan handler validasi
          isRequired={true}
          type="pilih lokasi"
          errorMessage={errors.lokasi}
        />
        <Input
          label="Posisi"
          keyboardType="default"
          value={position}
          onChangeText={() => {}}
          editable={false}
          errorMessage={errors.posisi}
        />
        <Input
          label="Kondisi dan Keterangan"
          keyboardType="default"
          value={kondisiKeterangan}
          onChangeText={handleKondisiChange} // ✅ gunakan handler validasi
          multiline={true}
          numberOfLines={4}
          errorMessage={errors.kondisiKeterangan}
        />

        {locations ? (
          <MapView
            style={{ height: 200, marginTop: 16, borderRadius: 10 }}
            region={{
              latitude: locations.latitude,
              longitude: locations.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker coordinate={locations} title="Lokasi Terpilih" />
          </MapView>
        ) : (
          <View
            style={{
              height: 200,
              borderRadius: 10,
              backgroundColor: "#f0f0f0",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 16,
            }}
          >
            <Text style={{ color: "#888" }}>Map tidak tersedia</Text>
          </View>
        )}

        <Button
          label="Pilih Lokasi di Peta"
          onPress={() => setShowMap(true)}
          style={{
            backgroundColor: "#0973FF",
            borderRadius: 20,
            paddingVertical: 12,
            marginTop: 16,
          }}
          textStyle={{
            color: "#FFFFFF",
            fontWeight: "bold",
            textAlign: "center",
          }}
        />

        <MapPickerModal
          visible={showMap}
          onClose={() => setShowMap(false)}
          onSelect={(lokasi) => {
            setLocations(lokasi);
            setShowMap(false);
          }}
          initialLocation={locations}
        />
      </ScrollView>

      <View style={stylesB.buttonGroup}>
        <Button
          label="Cancel"
          onPress={() => navigation.goBack()}
          classType="success"
          style={{
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#0973FF",
            borderRadius: 20,
            flex: 1,
            marginHorizontal: 4,
            paddingVertical: 12,
          }}
          textStyle={{ color: "#0973FF", fontWeight: "bold" }}
        />
        <Button
          label="Edit"
          onPress={handleEdit}
          classType="success"
          isLoading={isLoading}
          style={{
            backgroundColor: "#0973FF",
            borderRadius: 20,
            flex: 1,
            marginHorizontal: 4,
            paddingVertical: 12,
          }}
          textStyle={{ color: "#fff", fontWeight: "bold" }}
        />
      </View>
    </FormLayout>
  );
};

export default KomponenAirEdit;
