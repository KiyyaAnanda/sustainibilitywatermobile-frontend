import React, { useState, useRef, useEffect } from "react";
import LottieView from "lottie-react-native";
import { useTranslation } from "react-i18next";
import { Alert, View, Text } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import FormLayout from "../../../components/FormLayout";
import { stylesB } from "../../../styles/globalStyles";
import * as yup from "yup";
import { validateAllInputs, validateInput } from "../../../Util/ValdiationForm";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { postUser, postUserArray } from "../../../services/apiService";

const LokasiSensorEdit = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { id } = route.params || {};

  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  const formDataRef = useRef({
    namaGedung: "",
    lantai: "",
    jumlahHilir: "",
  });

  const [formData, setFormData] = useState({
    lks_id: "",
    namaGedung: "",
    lantai: "",
    jumlahHulu: "0", // tetap disimpan dan dikirim
    jumlahHilir: "", // hanya ini yang bisa diubah user
    createBy: "", // bisa diisi otomatis atau manual
  });

  const userSchema = yup.object({
    lks_id: yup.string(),
    namaGedung: yup
      .string()
      .trim()
      .required("Harus diisi")
      .max(100, "Maksimal 100 karakter")
      .matches(/^[A-Za-z\s]+$/, "Hanya boleh huruf dan spasi"),
    lantai: yup.string().trim().required("Harus diisi"),
    jumlahHilir: yup.string(),
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await postUserArray("MasterLokasi/GetDataLokasiById", {
          lks_idSensor: id,
        });

        if (data === "ERROR" || !Array.isArray(data) || data.length === 0) {
          throw new Error("Terjadi kesalahan saat mengambil data lokasi.");
        }

        if (isMounted) {
          const fetched = data[0];
          formDataRef.current = { ...formDataRef.current, ...fetched };

          setFormData({
            lks_id: id,
            namaGedung: fetched.namaGedung || "",
            lantai: fetched.lantai || "",
            jumlahHilir: fetched.jumlahHilir || "",
          });
        }
      } catch (error) {
        console.error("❌ Error ambil data:", error);
        setIsError({ error: true, message: error.message });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleInputChange = async (name, value) => {
    const trimmedValue = value?.trim() || "";
    setFormData((prev) => ({ ...prev, [name]: trimmedValue }));

    const validationError = await validateInput(name, trimmedValue, userSchema);
    setErrors((prev) => ({
      ...prev,
      [name]: validationError.error,
    }));
  };

  const handleEdit = async () => {
    if (!id) {
      Alert.alert("Error", "ID lokasi tidak ditemukan.");
      return;
    }

    const validationErrors = await validateAllInputs(
      formData,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsError({ error: false, message: "" });
      setErrors({});
      const userJson = await AsyncStorage.getItem("activeUser");
      const user = userJson ? JSON.parse(userJson) : null;

      console.log("✅ Data valid, siap kirim:", formData);
      try {
        const payload = {
          lks_idSensor: id,
          namaGedung: formData.namaGedung,
          lantai: formData.lantai,
          jumlahHulu: "0", // selalu statis
          jumlahHilir: formData.jumlahHilir,
          createBy: user ? user.usc_nama : "unknown",
        };

        const response = await postUserArray("MasterLokasi/EditLokasi", payload);
        if (response === "ERROR") {
          throw new Error("Gagal menyimpan perubahan lokasi.");
        }

        Alert.alert("Sukses", "Data lokasi berhasil diperbarui.", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } catch (error) {
        console.error("❌ Gagal update:", error);
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
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
    <FormLayout source={require("../../../assets/picturePng/LokasiSensor.png")}>
      <View style={stylesB.formContainer}>
        <Text style={stylesB.title}>{t("location_edit_sensor")}</Text>

        <Input
          label={t("location_building_name")}
          value={String(formData.namaGedung)}
          onChangeText={(text) => handleInputChange("namaGedung", text)}
          errorMessage={errors.namaGedung}
        />

        <Input
          label={t("location_floor")}
          value={String(formData.lantai)}
          onChangeText={(text) => handleInputChange("lantai", text)}
          errorMessage={errors.lantai}
        />
      </View>

      <View style={stylesB.buttonGroup}>
        <Button
          label={t("cancel")}
          onPress={() => navigation.goBack()}
          classType="success"
          style={{
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 20,
            alignItems: "center",
            flex: 1,
            marginHorizontal: 4,
            borderWidth: 1,
            borderColor: "#0973FF",
            backgroundColor: "#fff",
          }}
          textStyle={{ color: "#0973FF", fontWeight: "bold" }}
        />

        <Button
          label={t("save")}
          onPress={handleEdit}
          classType="success"
          style={{
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 20,
            alignItems: "center",
            flex: 1,
            marginHorizontal: 4,
            backgroundColor: "#0973FF",
          }}
          textStyle={{ color: "#fff", fontWeight: "bold" }}
        />
      </View>
    </FormLayout>
  );
};

export default LokasiSensorEdit;
