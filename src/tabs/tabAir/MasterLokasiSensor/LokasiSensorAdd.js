import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Dimensions, Text, View } from "react-native";
import * as yup from "yup";
import Button from "../../../components/Button";
import FormContainerWithBlur from "../../../components/FormContainerWithBlur";
import FormLayout from "../../../components/FormLayout";
import Input from "../../../components/Input";
import { postUser, postUserArray } from "../../../services/apiService";
// Gaya global
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { stylesB } from "../../../styles/globalStyles";
import { validateAllInputs } from "../../../Util/ValdiationForm";

const { height } = Dimensions.get("window");

// Skema validasi Yup (tidak validasi jumlahHulu karena tidak diinput)

const LokasiSensorAdd = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [formData, setFormData] = useState({
    namaGedung: "",
    lantai: "",
    jumlahHulu: 0,
    jumlahHilir: 0,
    createBy: "",
  });

  const userSchema = yup.object({
    namaGedung: yup
      .string()
      .trim()
      .required("Harus diisi")
      .max(100, "Maksimal 100 karakter")
      .matches(/^[A-Za-z\s]+$/, "Hanya boleh huruf dan spasi"),
    lantai: yup.string().trim().required("Harus diisi"),
    jumlahHilir: yup.string(),
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = async (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));

    try {
      await yup.reach(userSchema, fieldName).validate(value);
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [fieldName]: err.message }));
    }
  };

  const handleSave = async () => {
    const dataToValidate = {
      namaGedung: formData.namaGedung,
      lantai: formData.lantai,
      jumlahHilir: formData.jumlahHilir,
    };
    const validationErrors = await validateAllInputs(dataToValidate, userSchema, setErrors);

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsError({ error: false, message: "" });
      setErrors({});
      setIsLoading(true);

      const userJson = await AsyncStorage.getItem("activeUser");
      const user = userJson ? JSON.parse(userJson) : null;
      console.log("User dari session:", user);
      try {
        // Cek apakah lokasi (gedung + lantai) sudah ada
        const checkResult = await postUserArray("MasterLokasi/CheckLokasi", {
          namaGedung: formData.namaGedung,
          lantai: formData.lantai,
        });

        const hasil = checkResult?.[0]?.hasil;

        if (hasil === "EXACT_MATCH") {
          Alert.alert("Peringatan", "Nama gedung tidak boleh sama!");
          return;
        } else if (hasil === "PARTIAL_MATCH") {
          Alert.alert("Peringatan", "Nama gedung sudah ada!");
          return;
        }

        // Validasi data sebelum kirim
        await userSchema.validate(formData, { abortEarly: false });
        console.log("VALIDASI BERHASIL");

        const dataToSend = {
          ...formData,
          createBy: user.usc_nama,
        };
        // Kirim data ke API
        const result = await postUserArray("MasterLokasi/CreateLokasi", dataToSend);
        console.log("Result API:", result);

        if (Array.isArray(result) && result[0]?.hasil === "OK") {
          Alert.alert("Sukses", "Data berhasil disimpan", [{ text: "OK", onPress: () => navigation.goBack() }]);
        } else {
          Alert.alert("Gagal", "Gagal menyimpan data.");
        }
      } catch (err) {
        console.error("Error:", err);
        Alert.alert("Error", err.message || "Terjadi kesalahan.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <View style={[{ flex: 1, justifyContent: "center", alignItems: "center" }]}>
        <LottieView
          source={require("../../../assets/lottieAnimation/CuteBoyRunning_Loading.json")}
          autoPlay
          loop
          style={{ width: 150, height: 150 }}
        />
        <Text style={{ color: "#fff", marginTop: 16, fontSize: 16 }}>{t("loading")}</Text>
      </View>
    );
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FormLayout source={require("../../../assets/picturePng/LokasiSensor.png")}>
        <FormContainerWithBlur
          containerStyle={stylesB.formContainer}
          maxHeight={500}
          showTopBlur={false}
          showBottomBlur={true}
          blurHeight={10}>
          <Text style={stylesB.title}>{t("location_sensor")}</Text>

          <Input
            label={t("location_building_name")}
            value={formData.namaGedung}
            onChangeText={(text) => handleInputChange("namaGedung", text)}
            errorMessage={errors.namaGedung}
          />

          <Input
            label={t("location_floor")}
            value={formData.lantai}
            onChangeText={(text) => handleInputChange("lantai", text)}
            errorMessage={errors.lantai}
          />

          {/* Jumlah Hulu tidak ditampilkan karena disembunyikan dari tampilan */}
        </FormContainerWithBlur>
      </FormLayout>

      <View style={styles.buttonGroup}>
        <Button
          label={t("cancel")}
          onPress={() => navigation.goBack()}
          classType="success"
          style={{
            paddingVertical: 12,
            paddingHorizontal: 24,
            alignItems: "center",
            flex: 1,
            marginHorizontal: 4,
            backgroundColor: "#fff",
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "#0973FF",
          }}
          textStyle={{ color: "#0973FF", fontWeight: "bold" }}
        />

        <Button
          label={t("save")}
          onPress={handleSave}
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
    </GestureHandlerRootView>
  );
};

const styles = {
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: height * 0.05,
  },
};

export default LokasiSensorAdd;
