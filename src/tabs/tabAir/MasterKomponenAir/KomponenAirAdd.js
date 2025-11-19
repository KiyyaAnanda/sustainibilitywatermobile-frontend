import React, { useEffect, useState } from "react";
import { View, Text, Alert, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import * as yup from "yup";
import FormLayout from "../../../components/FormLayout";
import Input from "../../../components/Input";
import DropDownForm from "../../../components/DropDownForm";
import Button from "../../../components/Button";
import { stylesB } from "../../../styles/globalStyles";
import { postUser, postUserArray } from "../../../services/apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView, { Marker } from "react-native-maps";
import MapPickerModal from "../../../components/Maps";
import { validateInput, validateAllInputs } from "../../../Util/ValdiationForm";
import LottieView from "lottie-react-native";

//buat konstanta
const KomponenAirAdd = () => {
  //menyimpan dan mengelola data (inisialisasi awal)
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [location, setLocation] = useState("");
  const [position] = useState("Hilir");
  const [kondisiKeterangan, setKondisiKeterangan] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [LocationList, setListLokasi] = useState([]);
  const [User, setUser] = useState("");

  const [locations, setLocations] = useState(null);
  const [showMap, setShowMap] = useState(false); // ⬅️ untuk tampilkan modal

  //function wajib nya
  const schema = yup.object().shape({
    lokasi: yup.string().required("Lokasi wajib dipilih"),
    posisi: yup.string().required("Posisi wajib diisi"),
    kondisiKeterangan: yup.string().required("Kondisi wajib diisi"),
  });

  useEffect(() => {
    const getSessionData = async () => {
      try {
        const userJson = await AsyncStorage.getItem("activeUser");
        if (userJson !== null) {
          const user = JSON.parse(userJson);
          setUser(user.username);
        }
      } catch (error) {
        console.error("Gagal membaca session:", error);
      }
    };
    getSessionData();
  }, []);

  //manggil data API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await postUserArray("MasterLokasi/GetListLokasi", {});
        if (!Array.isArray(result))
          throw new Error("Format data lokasi tidak sesuai");
        const list = result.map((item) => ({
          label: item.Text || "Tidak ada label",
          value: item.Value || "Tidak ada value",
        }));
        setListLokasi(list);
      } catch (err) {
        console.error("Fetch lokasi gagal:", err.message);
        setListLokasi([]);
      }
    };
    fetchData();
  }, []);

  //
  const handleKondisiChange = async (value) => {
    setKondisiKeterangan(value);

    const result = await validateInput("kondisiKeterangan", value, schema);
    setErrors((prev) => ({
      ...prev,
      [result.name]: result.error || undefined,
    }));
  };
  //
  const handleLocationChange = async (value) => {
    setLocation(value);

    const result = await validateInput("lokasi", value, schema);
    setErrors((prev) => ({
      ...prev,
      [result.name]: result.error || undefined,
    }));
  };

  //function simpan
  const handleSave = async () => {
    const formValues = {
      lokasi: location,
      posisi: position,
      kondisiKeterangan,
    };

    if (!User) {
      Alert.alert("Error", "User belum terdeteksi. Silakan login ulang.");
      return;
    }

    const formErrors = await validateAllInputs(formValues, schema, setErrors);

    if (Object.keys(formErrors).length > 0) {
      return; // stop proses kalau masih ada error
    }

    try {
      await schema.validate(formValues, { abortEarly: false });
      setErrors({});

      if (!locations) {
        Alert.alert(
          "Error",
          "Lokasi belum tersedia. Silakan pilih lokasi terlebih dahulu."
        );
        return;
      }

      const { latitude, longitude } = locations;

      //p50
      const dataToSend = {
        p1: location,
        p2: kondisiKeterangan,
        p3: position,
        p4: latitude.toString(),
        p5: longitude.toString(),
        p6: User,
        ...Object.fromEntries([...Array(44)].map((_, i) => [`p${i + 7}`, ""])),
      };

      setIsLoading(true);
      const res = await postUserArray(
        "MasterKomponenAir/CreateKomponenAirMobile",
        dataToSend
      );

      if (res === "ERROR") throw new Error("Gagal menyimpan data target.");

      Alert.alert("Sukses", "Data Sensor berhasil disimpan", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      if (err.name === "ValidationError") {
        const newErrors = {};
        err.inner.forEach((e) => {
          newErrors[e.path] = e.message;
        });
        setErrors(newErrors);
      } else {
        Alert.alert("Error", err.message);
      }
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

  //form
  return (
    <FormLayout
      source={require("../../../assets/picturePng/KomponenAir.png")}
      enableScroll={true}
    >
      <ScrollView contentContainerStyle={stylesB.trformContainer}>
        <Text style={stylesB.title}>{t("sensor_water")}</Text>

        <DropDownForm
          label={t("location_sensor_water")}
          arrData={LocationList}
          selectedValue={location}
          onValueChange={handleLocationChange}
          isRequired
          type="pilih lokasi"
          errorMessage={errors.lokasi}
        />
        <Input
          label={t("position_sensor_water")}
          value={position}
          onChangeText={() => {}}
          editable={false}
          errorMessage={errors.posisi}
        />

        <Input
          label={t("condition_sensor_water")}
          value={kondisiKeterangan}
          onChangeText={handleKondisiChange}
          multiline
          numberOfLines={4}
          errorMessage={errors.kondisiKeterangan}
        />

        {locations ? (
          <MapView
            style={{ height: 200, marginTop: 16, borderRadius: 10 }}
            initialRegion={{
              latitude: locations.latitude || -6.3485,
              longitude: locations.longitude || 107.1484,
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
            <Text style={{ color: "#888" }}>{t("map_not_available")}</Text>
          </View>
        )}

        <Button
          label={t("choose_location_maps")}
          onPress={() => setShowMap(true)} // ⬅️ ganti dengan buka modal
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
      </ScrollView>

      <View style={stylesB.buttonGroup}>
        <Button
          label={t("cancel")}
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
          label={t("save")}
          onPress={handleSave}
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

      {/* Modal MapPicker */}
      <MapPickerModal
        visible={showMap}
        onClose={() => setShowMap(false)}
        onSelect={(lokasi) => {
          setLocations(lokasi); // set latlong
          setShowMap(false);
        }}
      />
    </FormLayout>
  );
};

export default KomponenAirAdd;
