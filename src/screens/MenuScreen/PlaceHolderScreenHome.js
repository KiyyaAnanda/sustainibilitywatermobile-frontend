import { Entypo, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Dimensions, Image, Pressable, StyleSheet, Text, View } from "react-native";
import DropdownAlert from "react-native-dropdownalert";
import FlashMessage, { showMessage } from "react-native-flash-message";
import FotoProfile from "../../assets/picturePng/FotoProfile.png";
import TrioHomeAstraPng from "../../assets/picturePng/TrioAstraHome.png";
import HeaderUser from "../../components/Header";
import { API_URL, postUser } from "../../services/apiService";
import HomeTabAir from "../../tabs/tabHome/HomeAirTab";
import { APPLICATION_ID } from "../../Util/Constants";

const { width, height } = Dimensions.get("window");

const PlaceholderScreenHome = () => {
  const dropDownAlertRef = useRef(null);
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("Air");
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const getSessionData = async () => {
      try {
        const userJson = await AsyncStorage.getItem("activeUser");
        if (userJson !== null) {
          const user = JSON.parse(userJson);
          console.log("User dari session:", user);

          // Optional: kamu bisa simpan di state
          setUser(user);
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
          const data = await postUser("MasterProfile/GetDataProfile", {
            username: user.username,
            role: user.role,
          });
          console.log("Data profile:", data);

          setUserProfile(data[0]);

          const result = await postUser("Utilities/GetDataCountingNotifikasi", {
            app: APPLICATION_ID,
            penerima: data[0].usc_id,
          });

          console.log("Data notifikasi:", result);
          if (result.length > 0 && result[0].counting > 0) {
            showMessage({
              message: `🔔 ${result[0].counting} Notifikasi Baru`,
              description: "Kamu memiliki notifikasi baru. Klik untuk melihat.",
              type: "info",
              duration: 2000,
              onPress: () => navigation.navigate("NotifikasiScreen"),
            });
          }
        } catch (error) {
          console.error("Gagal mengambil data:", error);
        }
      };

      loadUserProfile();
    }, [user])
  );

  const renderContent = () => {
    if (activeTab === "Air") {
      return (
        <HomeTabAir />
        // <Text style={styles.cardText}>Konten Tab 2</Text>
      );
    } else {
      return <Text style={styles.cardText}>Konten Tab 2</Text>;
    }
  };

  if (!userProfile) {
    return (
      <LinearGradient colors={["#054599", "#0973FF"]} style={[styles.container, { justifyContent: "center" }]}>
        <LottieView
          source={require("../../assets/lottieAnimation/CuteBoyRunning_Loading.json")}
          autoPlay
          loop
          style={{ width: 150, height: 150 }}
        />
        <Text style={{ color: "#fff", marginTop: 16, fontSize: 16 }}>{t("loading")}</Text>
      </LinearGradient>
    );
  } else {
    return (
      <>
        <View style={{ flex: 1 }}>
          <FlashMessage position="top" />
          <LinearGradient colors={["#0973FF", "#054599"]} style={styles.container} locations={[0, 0.5]}>
            {/* <HeaderUser
          photoSource={
            user?.foto
              ? { uri: `${API_URL}/UploadProfile/${user.foto}` }
              : require("../../assets/picturePng/AstraLogo.png")
          }
          name={user?.nama || "Guest"}
          role={user?.peran || "No Role"}
          onLogout={() => {
            console.log("Logout ditekan");
          }}
        /> */}
            <HeaderUser
              photoSource={{
                uri:
                  userProfile.usc_foto !== null
                    ? //user?.foto
                      `${API_URL}Uploads/${userProfile.usc_foto}`
                    : `${API_URL}Uploads/fotonotfound.jpg`,
              }}
              name={user?.nama || "Guest"}
              role={user?.role || "No Role"}
              onLogout={async () => {
                try {
                  await AsyncStorage.removeItem("activeUser");
                  navigation.navigate("LoginScreen");
                } catch (error) {
                  console.error("Gagal logout:", error);
                }
              }}
            />
            {/* IMAGE SVG TRIO HOME ASTRA */}
            <View style={{ width: "100%", alignItems: "center" }}>
              <Image
                source={TrioHomeAstraPng}
                style={{
                  width: 220,
                  height: 100,
                  marginBottom: -5,
                  marginTop: 0,
                }}
              />
            </View>
            {/* KOTAK PUTIH DI TENGAH */}
            <View style={styles.cardBlue}>
              <View style={styles.circleRow}>
                <View style={styles.circleTopRight} />
                <View style={styles.circleTopLeft} />
              </View>
              <View style={styles.buttonRow}>
                <Pressable
                  style={[styles.toggleButtonAir, activeTab === "Air" ? styles.activeButton : styles.inactiveButton]}
                  onPress={() => setActiveTab("Air")}>
                  <Entypo name="water" size={24} color={activeTab === "Air" ? "#0973FF" : "white"} />
                </Pressable>

                <Pressable
                  style={[
                    styles.toggleButtonListrik,
                    activeTab === "Listrik" ? styles.activeButton : styles.inactiveButton,
                  ]}
                  onPress={() => setActiveTab("Listrik")}>
                  <MaterialIcons name="electric-bolt" size={24} color={activeTab === "Listrik" ? "#0973FF" : "white"} />
                </Pressable>
              </View>

              <View style={styles.cardWhite}>{renderContent()}</View>
            </View>
          </LinearGradient>
        </View>
      </>
    );
  }
};

const stylesAvatar = StyleSheet.create({
  header: {
    width: "90%",
    marginBottom: 20,
    flexDirection: "row", // horizontal layout
    justifyContent: "space-between",
    alignItems: "center", // vertical center
  },

  avatarContainer: {
    flexDirection: "row",
    alignItems: "top",
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ccc",
    marginRight: 10,
  },

  username: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  position: {
    color: "white",
    fontSize: 12, // lebih kecil dari username
    marginTop: 2,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: height * 0.05,
    alignItems: "center",
  },
  header: {
    width: "90%",
    marginBottom: 20,
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
  circleRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    top: 0,
    paddingTop: 15,
    zIndex: 1,
  },
  circleTopRight: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "white",
  },
  circleTopLeft: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "white",
  },
  cardBlue: {
    width: "100%",
    height: height * 0.7,
    backgroundColor: "#0973FF",
    borderRadius: 25,
    alignItems: "center",
    // paddingLeft: 15,
    // paddingRight: 15,
    paddingTop: 15,
    paddingBottom: 30,
    paddingHorizontal: width * 0.04,
    // paddingVertical: height * 0.03,
    marginTop: 0,
  },
  cardWhite: {
    width: "100%",
    flex: 1,
    backgroundColor: "white",
    borderRadius: 30,
    padding: 20,
    marginTop: -2,
  },
  cardText: {
    fontSize: 16,
    color: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  toggleButtonAir: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 2,
    marginRight: 1, // jarak kecil ke kanan
  },
  toggleButtonListrik: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    borderWidth: 2,
    marginLeft: 1, // jarak kecil ke kiri
  },
  activeButton: {
    backgroundColor: "white",
    borderColor: "#0973FF",
  },
  inactiveButton: {
    backgroundColor: "#0973FF",
    borderColor: "white",
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  activeText: {
    color: "#0973FF",
  },
  inactiveText: {
    color: "white",
  },
});

export default PlaceholderScreenHome;
