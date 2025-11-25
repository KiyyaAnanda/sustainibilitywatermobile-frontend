import React, { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image, Alert } from "react-native";
import LottieView from "lottie-react-native";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";

// Components
import DropDown from "../../../components/DropDown";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import DropDownForm from "../../../components/DropDownForm";
import FormLayout from "../../../components/FormLayout";
import TextView from "../../../components/TextView";
import DetailHistoryCard from "../../../components/DetailHistoryCard";
import FormLayoutHistory from "../../../components/FormLayoutHistory";

// Styles and API
import { stylesB, stylesDetail } from "../../../styles/globalStyles";
import { postUser, postUserArray, postUserArray } from "../../../services/apiService";
import { formatDateOnly } from "../../../Util/Formatting";

const LokasiSensorDetail = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const route = useRoute();
  const [isActive, setIsActive] = useState(false);
  const { id, status } = route.params || {};

  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [localStatus, setLocalStatus] = useState(status);
  const [detailKompoenLokasi, setDetailKompoenLokasi] = useState([]);

  const formDataRef = useRef({
    namaGedung: "",
    lantai: "",
    jumlahHulu: "",
    jumlahHilir: "",
    status: "",
  });

  useEffect(() => {
    if (localStatus) {
      setIsActive(localStatus.toLowerCase() === "aktif");
    }
  }, [localStatus]);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setIsError({ error: false, message: "" });
        try {
          const data = await postUserArray("MasterLokasi/DetailLokasi", { id });

          if (!data || data === "ERROR" || data.length === 0) {
            throw new Error("Gagal mengambil data target.");
          }

          formDataRef.current = { ...formDataRef.current, ...data[0] };
        } catch (error) {
          setIsError({ error: true, message: error.message });
        } finally {
          setIsLoading(false);
        }
      };

      const fetchDataKomponenByLokasi = async () => {
        setIsError({ error: false, message: "" });
        try {
          const data = await postUserArray("MasterLokasi/GetDataKomponenByLokasi", {
            id,
          });
          console.log("Data Komponen Lokasi:", data);
          if (!data || data === "ERROR") {
            throw new Error("Gagal mengambil data target.");
          }
          setDetailKompoenLokasi(data || []);
        } catch (error) {
          setIsError({ error: true, message: error.message });
        } finally {
          setIsLoading(false);
        }
      };

      if (id) {
        fetchData();
        fetchDataKomponenByLokasi();
      }
    }, [id, status])
  );

  function handleSetStatus(id) {
    Alert.alert(
      "Konfirmasi",
      `Apakah kamu yakin ingin mengubah status lokasi ini?`,
      [
        {
          text: "Tidak",
          style: "cancel",
        },
        {
          text: "Ya",
          onPress: () => {
            postUserArray("MasterLokasi/SetStatusLokasi", { id }).then((data) => {
              if (data === "ERROR" || data.length === 0) {
                Alert.alert("Gagal", "Data gagal mengubah status.", [
                  { text: "OK", onPress: () => navigation.goBack() },
                ]);
              } else {
                const updatedStatus = isActive ? "Tidak Aktif" : "Aktif";
                setLocalStatus(updatedStatus);
                Alert.alert("Sukses", "Status berhasil diperbarui.");
              }
            });
          },
        },
      ]
    );
  }

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

  if (isError.error) {
    return <Text>Error: {isError.message}</Text>;
  }

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: 0,
        paddingHorizontal: 0,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <FormLayout
        source={require("../../../assets/picturePng/mVR1.png")}
        image={{
          width: 600,
          height: 450,
          position: "absolute",
          top: 50,
          left: -100,
          zIndex: 0,
          alignItems: "center"
        }}
        upperLabel={
          <Text
            style={{
              position: "absolute",
              top: 63,
              bottom: 90,
              width: 100,
              alignSelf: "center",
              fontSize: 24,
              fontWeight: "bold",
              color: "#FFF",
            }}
          >
            {t("location_details")}
          </Text>
        }
        lowerLabel={<Text
        style={{
          alignSelf: "center",
          width: "85%", 
          color: "#FFF",
          margin: 25, 
          fontSize: 14,
        }}
    >
      {t("location_introduction")}
    </Text>}
        enableScroll={true}
      >
        <View style={stylesDetail.formContainer}>
          <Text style={stylesB.title}>{t("location_details")}</Text>

          <View style={stylesDetail.rectangle}>
            <Button
              iconColor={isActive ? "#4682B4" : "gray"}
              iconName={isActive ? "toggle-on" : "toggle-off"}
              style={{
                backgroundColor: "#fff",
                bottom: 159,
                left: 141.5,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 20,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                justifyContent: "center",
                alignItems: "center",
                width: 60,
                height: 40,
                borderWidth: 2,
                borderColor: "#0971FB",
              }}
              iconSize={23}
              onPress={() => handleSetStatus(id)}
            />

            <Button
              iconName="edit"
              style={{
                backgroundColor: "#fff",
                bottom: 199,
                left: 83,
                bottom: 199,
                left: 83,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                borderTopRightRadius: 0,
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
              onPress={() => navigation.navigate("LokasiSensorEdit", { id })}
            />

            <View style={stylesDetail.containerValue}>
              <TextView
                title={t("location_building_name")}
                data={formDataRef.current.namaGedung}
              />
              <TextView
                title={t("location_floor")}
                data={formDataRef.current.lantai}
              />
              <TextView
                title={t("location_number_of_sensors")}
                data={formDataRef.current.jumlahHilir}
              />
              <TextView title="Status" data={localStatus} />
            </View>

            <Image
              source={require("../../../assets/picturePng/Town.png")}
              style={{
                position: "absolute",
                top: 155,
                left: 95,
                zIndex: 0,
                height: 300,
                width: 250,
                resizeMode: "contain",
              }}
            />
          </View>

          <View style={{ marginTop: 32, marginLeft: 2 }}>
            <Text style={stylesAir.sectionTitle}>
              {"🧩 " + t("location_sensor_details")}
            </Text>
            {Array.isArray(detailKompoenLokasi) &&
            detailKompoenLokasi.length > 0 ? (
              detailKompoenLokasi.map((item, idx) => (
                <DetailHistoryCard
                  key={idx}
                  icon="💧"
                  name={item.kpn_no_komponen}
                  status={item.kpn_status}
                />
              ))
            ) : (
              <Text
                style={{ fontStyle: "italic", color: "gray", marginTop: 10 }}
              >
                Tidak ada data komponen tersedia.
              </Text>
            )}
          </View>
        </View>
      </FormLayout>
    </ScrollView>
  );
};

export const stylesAir = StyleSheet.create({
  formContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    marginTop: 300,
    minHeight: 700,
    zIndex: 1,
  },
  rectangle: {
    width: 345,
    height: 230,
    backgroundColor: "#0971FB",
    borderRadius: 20, // radius lengkungan sudut
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  containerValue: {
    position: "absolute",
    top: 0,
    left: 0,
    marginLeft: 28, // sesuaikan jarak ke kiri
    marginTop: 35, // sesuaikan jarak ke atas
  },
  card: {
    backgroundColor: "#0971FB", // ⬅️ latar biru terang
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0D47A1",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff", // ⬅️ teks putih
    marginBottom: 16,
  },
  cardBeautiful: {
    backgroundColor: "#0971FB",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    opacity: 0.3,
    marginVertical: 12,
  },
  infoRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E3F2FD",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0D47A1",
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deviceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#9A88FF",
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  deviceLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  deviceIcon: {
    fontSize: 32,
    marginRight: 12,
    color: "#fff",
  },
  deviceLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  deviceTimeLabel: {
    fontSize: 12,
    color: "#e0e0e0",
  },
  deviceRight: {
    alignItems: "flex-end",
  },
  deviceTime: {
    fontSize: 12,
    color: "#fff",
    marginTop: 6,
  },
  toggle: {
    width: 50,
    height: 26,
    borderRadius: 15,
    backgroundColor: "#fff",
    justifyContent: "center",
    padding: 3,
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#9A88FF",
    alignSelf: "flex-end",
  },
});

export default LokasiSensorDetail;
