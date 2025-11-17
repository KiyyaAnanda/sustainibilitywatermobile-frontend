import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { postUser, API_URL, postUserArray } from "../../services/apiService";
import { formatTanggalLahir } from "../../Util/Formatting";

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { t } = useTranslation();

  const userData = {
    name: "Achmad Naufal Nazheef",
    email: "naufal@example.com",
    tanggalLahir: "Tanggal Lahir: 21 Juli 2002",
    profilePic: `${API_URL}/UploadProfile/fotonotfound.jpg`,
  };

  useEffect(() => {
    const getSessionData = async () => {
      try {
        const userJson = await AsyncStorage.getItem("activeUser");
        if (userJson !== null) {
          const parsedUser = JSON.parse(userJson);
          console.log("User dari session:", parsedUser);
          setUser(parsedUser); // simpan ke state
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
          const data = await postUserArray("MasterProfile/GetDataProfile", {
            username: user.username,
            role: user.role,
          });
          console.log("datatype profile:", typeof data);
          console.log("Data profile:", data);
          console.log("Data 0 : ", data[0]);

          setUserProfile(data[0]);
        } catch (error) {
          console.error("Gagal mengambil data:", error);
        }
      };

      loadUserProfile();
    }, [user]),
  );

  if (!userProfile) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "#000000", marginTop: 100, textAlign: "center" }}>
          Memuat profil...
        </Text>
      </View>
    );
  } else {
    return (
      <LinearGradient colors={["#0973FF", "#054599"]} style={styles.container}>
        {/* Tombol Kembali */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
          <Text style={styles.backText}>{t("back")}</Text>
        </TouchableOpacity>

        {/* Konten Utama */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Foto dan Nama */}
          <View style={styles.profileContainer}>
            <Image
              source={{
                uri:
                  userProfile.usc_foto !== null
                    ? `${API_URL}/Uploads/${userProfile.usc_foto}`
                    : `${API_URL}/Uploads/fotonotfound.jpg`,
              }}
              style={styles.profileImage}
            />
            <Text style={styles.name}>{userProfile.usc_nama}</Text>
            <Text style={styles.email}>{userProfile.email}</Text>
          </View>

          {/* Info dan Tombol Edit */}
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Icon
                name="email"
                size={20}
                color="#054599"
                style={styles.icon}
              />
              <Text style={styles.infoText}>{userProfile.usc_email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon
                name="calendar-today"
                size={20}
                color="#054599"
                style={styles.icon}
              />
              <Text style={styles.infoText}>
                {formatTanggalLahir(userProfile.usc_tanggallahir)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Icon
                name="apartment"
                size={20}
                color="#054599"
                style={styles.icon}
              />
              <Text style={styles.infoText}>{userProfile.usc_departemen}</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate("EditProfileScreen")}
            >
              <Icon
                name="edit"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.editButtonText}>{t("edit_profile")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 30,
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
  profileContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#fff",
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  email: {
    fontSize: 14,
    color: "#eee",
  },
  infoContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  infoText: {
    fontSize: 16,
    color: "#333",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#054599",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
