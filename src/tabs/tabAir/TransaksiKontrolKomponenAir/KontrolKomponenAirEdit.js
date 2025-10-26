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
import { useRoute } from "@react-navigation/native";

const KontrolKomponenAirEdit = ({}) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [komponenBocorOptions, setKomponenBocorOptions] = useState([]);
  const [selectedKomponen, setSelectedKomponen] = useState("");
  const [pic, setPic] = useState("");
  const [tanggalText, setTanggalText] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [judul, setJudul] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [deskripsi, setDeskripsi] = useState("");

  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDisableTanggal, setIsDisableTanggal] = useState(true);
  const [isPerbaikanAktif, setIsPerbaikanAktif] = useState(false);

  const formDataRef = useRef({
    komponen: "",
    tglpengecekan: "",
    pic: "",
    user: "",
    judul: "",
    tanggalmulai: "",
    tanggalselesai: "",
    deskripsi: "",
  });

  // VALIDATION SCHEMA
  const userSchema = yup.object().shape({
    komponen: yup.string().required("Komponen harus dipilih"),
    pic: yup.string().required("Harus diisi"),
    tglpengecekan: yup.string().required("Tanggal harus diisi"),
    user: yup.string().required("User belum tersedia"),
    judul: yup.string().required("Judul harus diisi"),
    tanggalmulai: yup.string().required("Tanggal mulai harus diisi"),
    tanggalselesai: yup.string().required("Tanggal mulai harus diisi"),
    deskripsi: yup.string().required("Deskripsi harus diisi"),
  });

  const route = useRoute();
  const { id, status } = route.params || {};
  console.log("edit id :" + id + "status :" + status);

  useEffect(() => {
    const fetchDataById = async () => {
      try {
        const data = await postUserArray(
          "TransaksiKontrolKomponenAir/GetDataTrsKontrolKomponenAirById",
          { id: id }
        );

        if (data && Array.isArray(data) && data.length > 0) {
          const dt = data[0];

          const formattedPengecekan = dt["Tanggal Pengecekan"]
            ? dt["Tanggal Pengecekan"].split("T")[0]
            : "";

          setJudul(dt["Judul"] || "");
          setPic(dt["PIC"] || "");
          setTanggalText(formattedPengecekan);
          setTanggalMulai(dt["Tanggal Rencana Mulai"]?.split("T")[0] || "");
          setTanggalSelesai(dt["Tanggal Rencana Selesai"]?.split("T")[0] || "");
          setDeskripsi(dt["Deskripsi Kerusakan"] || "");
          setSelectedKomponen(dt["Key kpn"]?.toString() || "");

          formDataRef.current = {
            ...formDataRef.current,
            judul: dt["Judul"] || "",
            pic: dt["PIC"] || "",
            tglpengecekan: formattedPengecekan,
            tanggalmulai: dt["Tanggal Rencana Mulai"]?.split("T")[0] || "",
            tanggalselesai: dt["Tanggal Rencana Selesai"]?.split("T")[0] || "",
            deskripsi: dt["Deskripsi Kerusakan"] || "",
            komponen: dt["Key kpn"]?.toString() || "",
          };
        }
      } catch (error) {
        console.error("Gagal ambil data by ID:", error);
        Alert.alert("Gagal", "Tidak dapat mengambil data");
      }
    };

    fetchDataById();
  }, [id]);

  const [isButtonDisabled, setIsButtonDisabled] = useState(true); // buat state untuk button
  const [komponenStatus, setKomponenStatus] = useState(null); // simpan status dari SP

  useEffect(() => {
    const fetchKomponenStatus = async () => {
      if (!formDataRef.current.komponen) return;

      try {
        setIsPageLoading(true);
        const response = await postUserArray(
          "TransaksiKontrolKomponenAir/GetStatusKomponenAir",
          { selectedKomponenId: formDataRef.current.komponen }
        );

        if (Array.isArray(response) && response.length > 0) {
          const status = response[0].Status || response[0].Kondisi || "";
          const statusLower = status.toLowerCase();

          setKomponenStatus(statusLower); // ⬅️ INI WAJIB ADA

          setIsButtonDisabled(statusLower !== "normal");
        } else {
          setKomponenStatus(null); // clear jika tidak ada
          setIsButtonDisabled(true);
        }
      } catch (error) {
        Alert.alert("Gagal memuat data komponen bocor");
        setKomponenStatus(null);
        setIsButtonDisabled(true);
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchKomponenStatus();
  }, [formDataRef.current.komponen]);

  // FETCH KOMBO KOMPONEN BOCOR
  useEffect(() => {
    const fetchKomponenBocor = async () => {
      if (!formDataRef.current.komponen) return;
      try {
        setIsPageLoading(true);
        const filter = {
          page: "1",
          lokasi: "",
          sortBy: "[Nomor Komponen]",
          selectedKomponenId: formDataRef.current.komponen,
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
        setIsPageLoading(false); // ⬅️ selesai loading awal
      }
    };

    fetchKomponenBocor();
  }, [formDataRef.current.komponen]);

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
      } catch (error) {
        console.error("Gagal membaca session:", error);
      }
    };

    getSessionData();
  }, []);

  const handleUpdatePerbaikan = async () => {
    if (!formDataRef.current.user) {
      Alert.alert("Gagal", "Data user belum tersedia.");
      return;
    }

    formDataRef.current.tanggalmulai = tanggalMulai;
    formDataRef.current.tanggalselesai = tanggalSelesai;
    formDataRef.current.deskripsi = deskripsi;

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    console.log("📋 validationErrors:", validationErrors);

    // Jika validasi gagal, tidak lanjut ke alert
    if (!Object.values(validationErrors).every((err) => !err)) {
      return;
    }

    // ⬇️ Alert ditampilkan SEBELUM try-catch
    Alert.alert(
      "Konfirmasi Perbaikan",
      `Apakah yakin dengan tanggal yg di tentukan?\n\nTanggal Mulai: ${
        tanggalMulai || "-"
      }\nTanggal Selesai: ${tanggalSelesai || "-"}`,
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            setIsSubmitting(true);
            try {
              const perbaikanPayload = {
                id: id,
                deskripsi: deskripsi,
                tglmulai: tanggalMulai,
                tglselesai: tanggalSelesai,
                user: formDataRef.current.user,
              };

              console.log("🚀 Data yang dikirim:", perbaikanPayload);

              const data = await postUserArray(
                "TransaksiKontrolKomponenAir/UpdateTrsKontrolKomponenAir",
                perbaikanPayload
              );

              if (data === "ERROR") {
                throw new Error("Gagal menyimpan data target.");
              }

              await postUserArray(
                "TransaksiKontrolKomponenAir/UpdateStatusTrsKontrolKomponenAir",
                {}
              );

              Alert.alert("Sukses", "Ajukan Perbaikan disimpan", [
                { text: "OK", onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              setIsError({ error: true, message: error.message });
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const selesaiSchema = yup.object().shape({
    user: yup.string().required("User belum tersedia"),
    deskripsi: yup.string().required("Deskripsi harus diisi"),
  });

  const dataToValidate = {
    deskripsi: formDataRef.current.deskripsi,
    user: formDataRef.current.user,
  };

  const handleSelesai = async () => {
    if (!formDataRef.current.user) {
      Alert.alert("Gagal", "Data user belum tersedia.");
      return;
    }

    const selesaiPayload = {
      id: id,
      deskripsi: deskripsi,
      user: formDataRef.current.user,
    };

    const err = await validateInput("deskripsi", deskripsi, selesaiSchema);
    setErrors((prev) => ({ ...prev, deskripsi: err.error }));

    if (!err.error) {
      setIsSubmitting(true);
      try {
        console.log("🚀 Payload yang dikirim:", selesaiPayload);

        const data = await postUserArray(
          "TransaksiKontrolKomponenAir/UpdateStatusSelesaiDeskripsiKontrolKomponenAir",
          selesaiPayload
        );

        if (data === "ERROR") {
          throw new Error("Gagal menyimpan data.");
        } else {
          await postUserArray(
            "TransaksiKontrolKomponenAir/UpdateStatusTrsKontrolKomponenAir",
            {}
          );

          Alert.alert("Sukses", "Ajukan Penyelesaian Disimpan", [
            { text: "OK", onPress: () => navigation.goBack() },
          ]);
        }
      } catch (error) {
        console.error("❌ Error saat simpan selesai:", error);
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
      enableScroll={true}
    >
      <ScrollView contentContainerStyle={stylesB.trformContainer}>
        <Text style={stylesB.title}>{t("component_planning")}</Text>

        <DropDownForm
          label={t("component_preventive_maintenance")}
          arrData={komponenBocorOptions}
          selectedValue={selectedKomponen}
          onValueChange={async (value) => {
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
          isDisabled={true}
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
          isDisabled={true}
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
          isDisabled={true}
        />

        <DateInputPicker
          label={t("check_date")}
          value={tanggalText}
          onChangeDate={async (formatted) => {
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
          isDisable={true}
        />

        <Input
          label={t("component_description")}
          value={deskripsi}
          onChangeText={async (text) => {
            setDeskripsi(text);
            formDataRef.current.deskripsi = text;
            const validationError = await validateInput(
              "deskripsi",
              text,
              userSchema
            );
            setErrors((prev) => ({
              ...prev,
              deskripsi: validationError.error,
            }));
          }}
          errorMessage={errors.deskripsi}
          multiline={true}
          numberOfLines={4}
          isDisabled={status === "Selesai"}
        />

        <DateInputPicker
          label={t("planning_start_date")}
          value={tanggalMulai}
          onChangeDate={async (formatted) => {
            const mulaiDate = new Date(formatted);
            const pengecekanDate = new Date(tanggalText);

            // Cek jika tanggal mulai < tanggal pengecekan
            if (tanggalText && mulaiDate < pengecekanDate) {
              setErrors((prev) => ({
                ...prev,
                tanggalmulai:
                  "Tanggal mulai tidak boleh lebih awal dari tanggal pengecekan",
              }));
              return;
            }

            setTanggalMulai(formatted);
            formDataRef.current.tanggalmulai = formatted;

            const validationError = await validateInput(
              "tanggalmulai",
              formatted,
              userSchema
            );
            setErrors((prev) => ({
              ...prev,
              tanggalmulai: validationError.error,
            }));
          }}
          errorMessage={errors.tanggalmulai}
          isDisable={isDisableTanggal}
        />

        <DateInputPicker
          label={t("planning_end_date")}
          value={tanggalSelesai}
          onChangeDate={async (formatted) => {
            const selesaiDate = new Date(formatted);
            const mulaiDate = new Date(tanggalMulai);
            const pengecekanDate = new Date(tanggalText); // ambil dari tanggal pengecekan

            // Validasi: Tanggal selesai tidak boleh lebih awal dari tanggal mulai
            if (tanggalMulai && selesaiDate < mulaiDate) {
              setErrors((prev) => ({
                ...prev,
                tanggalselesai:
                  "Tanggal selesai tidak boleh lebih awal dari tanggal mulai",
              }));
              return;
            }

            // Validasi: Tanggal selesai tidak boleh lebih awal dari tanggal pengecekan
            if (tanggalText && selesaiDate < pengecekanDate) {
              setErrors((prev) => ({
                ...prev,
                tanggalselesai:
                  "Tanggal selesai tidak boleh lebih awal dari tanggal pengecekan",
              }));
              return;
            }

            // Jika lolos validasi
            setTanggalSelesai(formatted);
            formDataRef.current.tanggalselesai = formatted;

            const validationError = await validateInput(
              "tanggalselesai",
              formatted,
              userSchema
            );
            setErrors((prev) => ({
              ...prev,
              tanggalselesai: validationError.error,
            }));
          }}
          errorMessage={errors.tanggalselesai}
          isDisable={isDisableTanggal}
        />

        <View style={stylesB.trButtonGroup}>
          {status !== "Pengecekan" && (
            <Button
              label={t("back")}
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
          )}
          {status === "Pengecekan" && (
            <>
              {/* TAHAP 1 */}
              <Button
                label={t("done")}
                onPress={() => {
                  Alert.alert(
                    "Konfirmasi Kerusakan",
                    "Jika kamu menekan OK, maka komponen tidak ada kerusakan.",
                    [
                      { text: "Batal", style: "cancel" },
                      {
                        text: "OK",
                        onPress: () => {
                          handleSelesai(); // Jalankan fungsi hanya jika OK
                        },
                      },
                    ]
                  );
                }}
                disabled={isPerbaikanAktif}
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
                textStyle={{
                  color: "#0973FF",
                  fontWeight: "bold",
                  fontSize: 13,
                }}
              />
              {!isPerbaikanAktif ? (
                //TAHAP 1
                <Button
                  label={isSubmitting ? t("save...") : t("repair")}
                  disabled={isSubmitting}
                  onPress={() => {
                    Alert.alert(
                      "Konfirmasi Kerusakan",
                      "Jika kamu menekan OK, maka komponen dianggap terjadi kerusakan.",
                      [
                        { text: "Batal", style: "cancel" },
                        {
                          text: "OK",
                          onPress: () => {
                            setIsDisableTanggal(false); // Aktifkan input tanggal
                            setIsPerbaikanAktif(true); // Tampilkan tombol Set Perbaikan
                          },
                        },
                      ]
                    );
                  }}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 20,
                    flex: 1,
                    marginHorizontal: 4,
                    backgroundColor: "#0973FF",
                    opacity: isSubmitting ? 0.6 : 1,
                  }}
                  textStyle={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 13,
                  }}
                />
              ) : (
                //TAHAP 2
                <Button
                  label={isSubmitting ? t("save...") : t("set_repair")}
                  disabled={isSubmitting}
                  onPress={handleUpdatePerbaikan} // <- Pastikan handleSave sudah ada
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 20,
                    flex: 1,
                    marginHorizontal: 4,
                    backgroundColor: "#0973FF",
                    opacity: isSubmitting ? 0.6 : 1,
                  }}
                  textStyle={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 13,
                  }}
                />
              )}
            </>
          )}

          {status !== "Selesai" && status !== "Pengecekan" && (
            //TAHAP 3
            <Button
              label={isSubmitting ? t("done") : t("set_done")}
              disabled={isSubmitting || komponenStatus !== "normal"}
              onPress={handleSelesai}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 20,
                flex: 1,
                marginHorizontal: 4,
                backgroundColor: "#0973FF",
                opacity: komponenStatus === "normal" && !isSubmitting ? 1 : 0.6, // ✅ opacity saja
              }}
              textStyle={{ color: "#fff", fontWeight: "bold" }}
            />
          )}
        </View>
        {status === "Pengecekan" && (
          <View style={stylesB.trButtonGroup}>
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
                top: -30,
              }}
              textStyle={{
                color: "#0973FF",
                fontWeight: "bold",
                fontSize: 13,
              }}
            />
          </View>
        )}
      </ScrollView>
    </FormLayout>
  );
};

export default KontrolKomponenAirEdit;
