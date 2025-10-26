import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import LottieView from "lottie-react-native";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import DropDownForm from "../../../components/DropDownForm";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import FormLayout from "../../../components/FormLayout";
import { stylesB } from "../../../styles/globalStyles";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as yup from "yup";
import { postUser, postUserArray } from "../../../services/apiService";
import { validateAllInputs, validateInput } from "../../../Util/ValdiationForm";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateInputPicker from "../../../components/DateInputPicker";

const KontrolKomponenAirAdd = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  // STATE
  const [komponenBocorOptions, setKomponenBocorOptions] = useState([]);
  const [selectedKomponen, setSelectedKomponen] = useState("");
  const [pic, setPic] = useState("");
  const [tanggalText, setTanggalText] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [judul, setJudul] = useState("");

  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // REF
  const formDataRef = useRef({
    komponen: "",
    tglpengecekan: "",
    pic: "",
    user: "",
    judul: "",
  });

  // VALIDATION SCHEMA
  const userSchema = yup.object().shape({
    komponen: yup.string().required("Komponen harus dipilih"),
    pic: yup.string().required("Harus diisi"),
    tglpengecekan: yup.string().required("Tanggal harus diisi"),
    user: yup.string().required("User belum tersedia"),
    judul: yup.string().required("Judul harus diisi"),
  });

  // FORMAT TANGGAL
  const formatDate = (date) => {
    const d = new Date(date);
    const day = ("0" + d.getDate()).slice(-2);
    const month = ("0" + (d.getMonth() + 1)).slice(-2);
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  // FETCH KOMBO KOMPONEN BOCOR
  useEffect(() => {
    const fetchKomponenBocor = async () => {
      try {
        setIsPageLoading(true);
        const filter = {
          page: "1",
          lokasi: "",
          sortBy: "[Nomor Komponen]",
        };
        const data = await postUserArray(
          "TransaksiKontrolKomponenAir/GetDataKomponenAirByBocor",
          filter
        );

        if (Array.isArray(data)) {
          const options = data.map((item) => ({
            label: `${item["Nomor Komponen"]} (${item["Lokasi"]})`,
            value: item["Key"],
          }));
          setKomponenBocorOptions(options);
        }
      } catch {
        Alert.alert("Gagal memuat data komponen bocor");
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchKomponenBocor();
  }, []);

  useEffect(() => {
    const getSessionData = async () => {
      try {
        const userJson = await AsyncStorage.getItem("activeUser");
        if (userJson !== null) {
          const user = JSON.parse(userJson);
          console.log("User dari session:", user);

          // Optional: kamu bisa simpan di state

          formDataRef.current.user = user.username;
        }
        try {
          await postUserArray(
            "TransaksiKontrolKomponenAir/UpdateStatusTrsKontrolKomponenAir",
            {}
          );
        } catch (error) {
          console.error("Gagal menjalankan update status:", error);
        }
      } catch (error) {
        console.error("Gagal membaca session:", error);
      }
    };

    getSessionData();
  }, []);

  const handleSave = async () => {
    console.log("handle");
    if (!formDataRef.current.user) {
      Alert.alert("Gagal", "Data user belum tersedia.");
      return;
    }

    formDataRef.current.pic = pic;
    formDataRef.current.tglpengecekan = tanggalText;
    formDataRef.current.judul = judul;

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    console.log("📋 validationErrors:", validationErrors); // Tambahkan ini

    if (Object.values(validationErrors).every((err) => !err)) {
      setIsSubmitting(true);
      try {
        console.log("🚀 Data yang dikirim:", formDataRef.current); // Tambahkan log debug

        const data = await postUserArray(
          "TransaksiKontrolKomponenAir/CreateTrsKontrolKomponenAir",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error("Gagal menyimpan data target.");
        } else {
          Alert.alert("Sukses", "Data berhasil disimpan", [
            { text: "OK", onPress: () => navigation.goBack() },
          ]);
        }
      } catch (error) {
        setIsError({ error: true, message: error.message });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // LOADING FULL PAGE
  if (isPageLoading) {
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

  // RENDER FORM
  return (
    <FormLayout
      source={require("../../../assets/picturePng/EvaluasiTarget.png")}
    >
      <ScrollView contentContainerStyle={stylesB.formContainer}>
        <Text style={stylesB.title}> {t("add_coponent_check")}</Text>

        <DropDownForm
          label={t("component_preventive_maintenance")}
          arrData={komponenBocorOptions}
          selectedValue={selectedKomponen}
          onValueChange={async (value) => {
            if (komponenBocorOptions.length === 0) {
              Alert.alert("Informasi", "Tidak ada komponen bocor");
              return;
            }

            setSelectedKomponen(value);
            formDataRef.current.komponen = value;
            const validationError = await validateInput(
              "komponen",
              value,
              userSchema
            );
            setErrors((prev) => ({ ...prev, komponen: validationError.error }));
          }}
          isRequired={true}
          type="pilih"
          errorMessage={errors.komponen}
        />

        <Input
          label={t("title_preventive_maintenance")}
          value={judul}
          onChangeText={async (text) => {
            setJudul(text);
            const validationError = await validateInput(
              "judul",
              text,
              userSchema
            );
            setErrors((prev) => ({ ...prev, judul: validationError.error }));
          }}
          errorMessage={errors.judul}
        />

        <Input
          label={t("pic_preventive_maintenance")}
          value={pic}
          onChangeText={async (text) => {
            setPic(text);
            const validationError = await validateInput(
              "pic",
              text,
              userSchema
            );
            setErrors((prev) => ({ ...prev, pic: validationError.error }));
          }}
          errorMessage={errors.pic}
        />

        <DateInputPicker
          label={t("check_date")}
          value={tanggalText}
          onChangeDate={async (formatted) => {
            const selectedDate = new Date(formatted);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // hilangkan waktu, hanya tanggal

            if (selectedDate < today) {
              setErrors((prev) => ({
                ...prev,
                tglpengecekan: "Tanggal tidak boleh lebih kecil dari hari ini",
              }));
              setTanggalText(""); // reset kalau mau
              formDataRef.current.tglpengecekan = "";
              return;
            }

            // kalau valid:
            setTanggalText(formatted);
            formDataRef.current.tglpengecekan = formatted;

            const validationError = await validateInput(
              "tglpengecekan",
              formatted,
              userSchema
            );
            setErrors((prev) => ({
              ...prev,
              tglpengecekan: validationError.error,
            }));
          }}
          errorMessage={errors.tglpengecekan}
        />
      </ScrollView>

      <View style={stylesB.buttonGroup}>
        <Button
          label={t("cancel")}
          onPress={() => navigation.goBack()}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 20,
            flex: 1,
            marginHorizontal: 4,
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#0973FF",
          }}
          textStyle={{ color: "#0973FF", fontWeight: "bold" }}
        />

        <Button
          label={isSubmitting ? t("save...") : t("save")}
          disabled={isSubmitting}
          onPress={handleSave}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 20,
            flex: 1,
            marginHorizontal: 4,
            backgroundColor: "#0973FF",
            opacity: isSubmitting ? 0.6 : 1,
          }}
          textStyle={{ color: "#fff", fontWeight: "bold" }}
        />
      </View>
    </FormLayout>
  );
};

export default KontrolKomponenAirAdd;
