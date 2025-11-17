import React, { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import FormLayoutHistory from "../../../components/FormLayoutHistory";
import { stylesB, stylesDetail } from "../../../styles/globalStyles";
import { postUser, postUserArray } from "../../../services/apiService";
import TextView from "../../../components/TextView";
import DetailHistoryCard from "../../../components/DetailHistoryCard";

const PenggunaanAirDetail = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const route = useRoute();
  const { id, idcom } = route.params || {};
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [detailPenggunaanAirHarianData, setDetailPenggunaanAirHarianData] =
    useState([]);
  const [
    detailPenggunaanAirHarianDataHistory,
    setDetailPenggunaanAirHarianDataHistory,
  ] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setIsError({ error: false, message: "" });
        try {
          const data = await postUserArray(
            "TransaksiPenggunaanAir/DetailPenggunaanAirHarianMobile",
            { id, idcom }
          );
          if (!data || data === "ERROR" || data.length === 0) {
            throw new Error("Gagal mengambil data target.");
          }
          setDetailPenggunaanAirHarianData(data[0] || {});
        } catch (error) {
          setIsError({ error: true, message: error.message });
        } finally {
          setIsLoading(false);
        }
      };

      const fetchDataHistory = async () => {
        setIsError({ error: false, message: "" });
        try {
          const data = await postUserArray(
            "TransaksiPenggunaanAir/DetailPenggunaanAirHarianHistoryMobile",
            { id }
          );
          if (!data || data === "ERROR" || data.length === 0) {
            throw new Error("Gagal mengambil data target.");
          }
          setDetailPenggunaanAirHarianDataHistory(data || []);
        } catch (error) {
          setIsError({ error: true, message: error.message });
        } finally {
          setIsLoading(false);
        }
      };

      if (id) {
        fetchData();
        fetchDataHistory();
      } else {
        setIsError({
          error: true,
          message: "ID tidak ditemukan di route params.",
        });
        setIsLoading(false);
      }
    }, [])
  );

  if (isLoading) return <Text>Loading...</Text>;
  if (isError.error) return <Text>Error: {isError.message}</Text>;

  return (
    <FormLayoutHistory
      source={require("../../../assets/picturePng/KomponenAir.png")}
      upperLabel={t("water_usage_details")}
      lowerLabel={t("water_usage_introduction")}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={80}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              paddingBottom: 0,
              paddingHorizontal: 0,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={stylesAir.formContainer}>
              <Text style={stylesAir.sectionTitle}>
                {"📘 " + t("general_information")}
              </Text>

              <View style={stylesAir.cardBeautiful}>
                <View style={stylesAir.infoRow}>
                  <Text style={stylesAir.label}>
                    {"📍 " + t("location_water_usage")}
                  </Text>
                  <Text style={stylesAir.value}>
                    {detailPenggunaanAirHarianData.lokasi || "-"}
                  </Text>
                </View>

                <View style={stylesAir.divider} />

                <View style={stylesAir.infoRow}>
                  <Text style={stylesAir.label}>
                    {"💧 " + t("total_water_volume")}
                  </Text>
                  <Text style={stylesAir.value}>
                    {detailPenggunaanAirHarianData.jumlahVolumeAir || "-"}
                  </Text>
                </View>

                <View style={stylesAir.divider} />

                <View style={stylesAir.infoRow}>
                  <Text style={stylesAir.label}>
                    {"🔧 " + t("number_of_components_water_usage")}
                  </Text>
                  <Text style={stylesAir.value}>
                    {detailPenggunaanAirHarianData.jumlahKomponen + " Sensor" ||
                      "-"}
                  </Text>
                </View>
              </View>

              <View style={{ marginTop: 32 }}>
                <Text style={stylesAir.sectionTitle}>
                  {"🧩 " + t("components_water_usage")}
                </Text>

                {detailPenggunaanAirHarianDataHistory.map((item, idx) => (
                  <DetailHistoryCard
                    key={idx}
                    icon="💧"
                    name={item.kpn_no_komponen}
                    volume={item.total_volume}
                    duration={item.total_durasi}
                    time={item.last_entry}
                    status={item.last_status}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </FormLayoutHistory>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 32,
    padding: 24,
    marginTop: 280,
    minHeight: 500,
  },
  imageWrapper: {
    position: "absolute",
    top: 97,
    left: 87,
    pointerEvents: "none", // ⬅️ penting agar tidak blokir scroll
  },
  overlayImage: {
    height: 335,
    width: 240,
    resizeMode: "contain",
  },
});

export const stylesAir = StyleSheet.create({
  formContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    marginTop: 300,
    height: 700,
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

export default PenggunaanAirDetail;
