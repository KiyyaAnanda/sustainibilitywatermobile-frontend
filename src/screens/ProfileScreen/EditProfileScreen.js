import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import { API_URL, postUser, postUserArray } from "../../services/apiService"; // Pastikan path ini sesuai dengan struktur project kamu
import { formatTanggalLahir } from "../../Util/Formatting"; // Pastikan path ini sesuai dengan struktur project kamu

const EditProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [emailError, setEmailError] = useState("");
  const { t } = useTranslation();

  const [userData, setUserData] = useState({
    name: "Achmad Naufal Nazheef",
    email: "naufal@example.com",
    birthdate: "2002-07-21",
    position: "Mahasiswa",
    profilePic: "https://i.pravatar.cc/150?img=3",
  });

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  useEffect(() => {
    const getSessionData = async () => {
      try {
        const userJson = await AsyncStorage.getItem("activeUser");
        if (userJson !== null) {
          const parsedUser = JSON.parse(userJson);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Gagal membaca session:", error);
      }
    };

    getSessionData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user === null) {
        console.log("User belum tersedia, menunggu session...");
        return;
      }

      const loadUserProfile = async () => {
        try {
          console.log("Username dan role:  " + user.username + " - " + user.role);
          const data = await postUserArray("MasterProfile/GetDataProfile", {
            username: user.username,
            role: user.role,
          });

          setUserProfile(data[0]);
        } catch (error) {
          console.error("Gagal mengambil data:", error);
        }
      };

      loadUserProfile();
    }, [user]) // efek hanya dijalankan ulang saat `user` berubah
  );

  const handleChange = (key, value) => {
    setUserProfile({ ...userProfile, [key]: value });
  };

  const handleSave = async () => {
    if (!validateEmail(userProfile.usc_email)) {
      Alert.alert("Format Email Salah", "Silakan masukkan email yang valid.");
      return;
    }
    try {
      const tanggalLahir = userProfile.usc_tanggallahir.toISOString
        ? userProfile.usc_tanggallahir.toISOString().split("T")[0] // Date object
        : userProfile.usc_tanggallahir.split("T")[0]; // string ISO

      const payload = {
        usc_id: userProfile.usc_id,
        usc_nama: userProfile.usc_nama,
        usc_foto: userProfile.usc_foto,
        usc_tanggallahir: tanggalLahir,
        usc_email: userProfile.usc_email,
        usc_modif_by: user.username,
      };

      console.log("🔍 Payload yang dikirim ke API:", payload);

      const result = await postUser("MasterProfile/UpdateDataProfile", payload);

      if (!result) {
        Alert.alert("Error", "Tidak ada data dari server.");
        return;
      }

      let parsed;
      try {
        parsed = typeof result === "string" ? JSON.parse(result) : result;
      } catch (err) {
        console.error("Gagal parse JSON:", err);
        Alert.alert("Error", "Format data dari server tidak valid.");
        return;
      }

      if (parsed[0]?.Status === "SUCCESS") {
        Alert.alert("Sukses", "Data Profil berhasil diubah", [{ text: "OK", onPress: () => navigation.goBack() }]);
      } else {
        Alert.alert("Gagal", parsed[0]?.Status || "Gagal mengupdate data");
      }
    } catch (error) {
      console.error("❌ Gagal mengambil data:", error);
      Alert.alert("Error", "Gagal menyimpan perubahan.");
    }
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirmDate = (date) => {
    const formatted = date.toISOString().split("T")[0]; // YYYY-MM-DD
    handleChange("usc_tanggallahir", formatted);
    hideDatePicker();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted" || cameraStatus.status !== "granted") {
      Alert.alert("Izin ditolak", "Akses ke kamera dan galeri dibutuhkan.");
      return;
    }

    Alert.alert("Ubah Foto", "Pilih sumber foto:", [
      {
        text: "Kamera",
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
          });
          await handlePickedImage(result);
        },
      },
      {
        text: "Galeri",
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
          });
          await handlePickedImage(result);
        },
      },
      { text: "Batal", style: "cancel" },
    ]);
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handlePickedImage = async (result) => {
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const fileName = uri.split("/").pop();

      const uploadedPath = await uploadFotoKeServer(uri, fileName);
      if (uploadedPath) {
        handleChange("usc_foto", uploadedPath); // Simpan path hasil upload ke userProfile
      }
    }
  };

  const uploadFotoKeServer = async (uri, fileName) => {
    const formData = new FormData();
    formData.append("file", {
      uri: Platform.OS === "ios" ? uri.replace("file://", "") : uri,
      name: fileName,
      type: "image/jpeg",
    });

    try {
      console.log("Mengunggah foto ke server: " + fileName);
      console.log("API_URL:", API_URL);

      const response = await fetch(`${API_URL}api/Upload/UploadFile`, {
        method: "POST",
        body: formData, // jangan pakai headers manual
      });

      const status = response.status;
      const text = await response.text();
      console.log("Status:", status);
      console.log("Response Text:", text);

      if (!response.ok) throw new Error("Upload gagal");

      const result = JSON.parse(text);
      return result.Hasil;
    } catch (error) {
      console.error("Gagal upload:", error);
      Alert.alert("Upload Gagal", "Gagal mengunggah foto.");
      return null;
    }
  };

  if (!userProfile) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "#fff", marginTop: 100, textAlign: "center" }}>Memuat profil...</Text>
      </View>
    );
  } else {
    return (
      <LinearGradient colors={["#0973FF", "#054599"]} style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
          <Text style={styles.backText}>{t("back")}</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{t("edit_profile")}</Text>

          <TouchableOpacity onPress={pickImage}>
            <Image
              source={{
                uri:
                  userProfile.usc_foto !== null
                    ? `${API_URL}Uploads/${userProfile.usc_foto}`
                    : `${API_URL}Uploads/fotonotfound.jpg`,
              }}
              style={styles.avatar}
            />
            <Text style={styles.changePhotoText}>{t("change_photo")}</Text>
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("username_profil")}</Text>
            <Text style={styles.positionText}>{userProfile.usc_id}</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("name_profile")}</Text>
            <TextInput
              style={styles.input}
              value={userProfile.usc_nama}
              onChangeText={(text) => handleChange("usc_nama", text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("email_profile")}</Text>
            <TextInput
              style={styles.input}
              value={userProfile.usc_email}
              onChangeText={(text) => {
                handleChange("usc_email", text);
                if (!validateEmail(text)) {
                  setEmailError("Format email tidak valid");
                } else {
                  setEmailError("");
                }
              }}
              //onChangeText={(text) => handleChange("usc_email", text)}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("birth_date_profile")}</Text>
            <TouchableOpacity onPress={showDatePicker} style={styles.input}>
              <Text style={{ color: "#000" }}>{formatTanggalLahir(userProfile.usc_tanggallahir)}</Text>
            </TouchableOpacity>

            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              date={new Date(userProfile.usc_tanggallahir)}
              onConfirm={handleConfirmDate}
              onCancel={hideDatePicker}
              themeVariant="light"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("positon_profile")}</Text>
            <Text style={styles.positionText}>{userProfile.usc_departemen}</Text>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{t("save_profile")}</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  changePhotoText: {
    color: "#eee",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 30,
    textDecorationLine: "underline",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: "#fff",
    marginBottom: 6,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  positionText: {
    fontSize: 16,
    color: "#eee",
    paddingVertical: 10,
  },
  saveButton: {
    backgroundColor: "#054599",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
