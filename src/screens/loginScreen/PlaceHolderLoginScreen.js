import { useRef, useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  FlatList,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import mVR1 from "../../assets/picturePng/mVR1.png";
import { Ionicons as Icon } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { postUser, postUserArray } from "../../services/apiService";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("window");

const PlaceHolderLoginScreen = () => {
  const navigation = useNavigation();
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const slideCurvedRectangle = useRef(new Animated.Value(height)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [showPassword, setShowPassword] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [listRole, setListRole] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  const [fontsLoaded] = useFonts({
    "Poppins-Bold": require("../../../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Regular": require("../../../assets/fonts/Poppins-Regular.ttf"),
  });

  // const handleAddLogin = async () => {
  //   if (!username || !password) {
  //     alert("Please fill all fields.");
  //     return;
  //   }

  //   try {
  //     const data = await postUser("Utilities/Login", {
  //       //const data = await postUser("Utilities/LoginHP", {
  //       usr: username,
  //       pw: password,
  //     });

  //     console.log("Login response:", data.Status);
  //     console.log("Login response:", data);

  //     // Jika login berhasil
  //     if (data === "ERROR") {
  //       throw new Error(data);
  //     } else if (data.Status && data.Status === "LOGIN FAILED") {
  //       alert("Nama akun atau kata sandi salah.");
  //     } else {
  //       setListRole(data);
  //       setModalVisible(true);
  //     }
  //   } catch (error) {
  //     setIsError({ error: true, message: error.message });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const { t } = useTranslation();
  const handleAddLogin = async () => {
    const loadUserProfile = async () => {
      try {
        const data = await postUserArray("Utilities/LoginHP", {
          username: username,
          password: password,
        });

        if (data === "ERROR") {
          alert("Terjadi kesalahan saat login.");
          console.log("" , username, password)
          return null;
        }

        // gagal
        if (
          Array.isArray(data) &&
          data.length > 0 &&
          data[0].Status === "LOGIN FAILED"
        ) {
          alert("Nama akun atau kata sandi salah.");
          return null; 
        }

        return data[0]; // ok
      } catch (error) {
        console.error("Gagal mengambil data:", error);
        alert("Terjadi kesalahan saat login.");
        return null;
      }
    };

    const profile = await loadUserProfile(); // tunggu hasil load profile
    if (profile) {
      setUserProfile(profile);
    }
    console.log("Data profile:", profile);

    try {
      await postUser(
        "TransaksiKontrolKomponenAir/UpdateStatusTrsKontrolKomponenAir",
        {}
      );
    } catch (error) {
      console.error("Gagal menjalankan update status:", error);
    }

    const userInfo = {
      username: profile.username,
      role: profile.role,
      nama: profile.nama,
      foto: profile.foto || "", 
    };

    const userJson = JSON.stringify(userInfo);
    await AsyncStorage.setItem("activeUser", userJson);

    navigation.navigate("MainMenu");
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        delay: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fontsLoaded]);

  useEffect(() => {
    Animated.timing(slideCurvedRectangle, {
      toValue: 0,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const prepare = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // delay kecil
      setIsAppReady(true);
    };
    prepare();
  }, []);

  if (!fontsLoaded) {
    // While fonts are loading, you can display a loading indicator or a splash screen
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading fonts...</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0973FF", "#054599"]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={{ transform: [{ translateY: slideAnim }], opacity: opacityAnim }}
      >
        <Image source={mVR1} style={styles.image} resizeMode="contain" />
      </Animated.View>

      <Animated.View
        style={{ transform: [{ translateY: slideAnim }], opacity: opacityAnim }}
      >
        <Text style={styles.welcomeText}>{t("welcome")}</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.curvedRectangle,
          { transform: [{ translateY: slideCurvedRectangle }] },
        ]}
      >
        <View style={styles.form}>
          <Text style={styles.label}>{t("username_or_email")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("username_or_email")}
            placeholderTextColor="#aaa"
            value={username}
            onChangeText={setUsername}
          />

          <Text style={styles.label}>{t("password")}</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.inputPass, { flex: 1 }]}
              placeholder="********"
              secureTextEntry={!showPassword}
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#555"
              />
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 80 }}>
            <TouchableOpacity
              onPress={handleAddLogin}
              disabled={!isAppReady}
              style={{ borderRadius: 8, overflow: "hidden" }}
            >
              <LinearGradient
                colors={["#0973FF", "#054599"]}
                style={styles.loginButton}
              >
                <Text style={styles.loginText}>{t("login_button")}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => navigation.navigate("SigninScreen")}
            >
              <Text style={styles.signInText}>{t("signin_another")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  signInButton: {
    marginTop: 15,
    backgroundColor: "#fff",
    borderColor: "#407BFF",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  signInText: {
    color: "#407BFF",
    fontWeight: "600",
  },
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  curvedRectangle: {
    width: width,
    height: Platform.select({
      ios: height * 0.72,
      android: height * 0.75, // Sedikit lebih tinggi untuk Android
    }),
    backgroundColor: "#fff",
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    justifyContent: "flex-end",
    // paddingBottom: 340,
  },
  image: {
    width: 500,
    height: 500,
    right: 105,
    top: 300,
  },
  title: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
  },
  form: {
    flex: 1,
    marginTop: Platform.select({
      ios: 60,
      android: 40, // Kurangi margin top di Android
    }),
    backgroundColor: "#fff",
    borderTopLeftRadius: 55,
    borderTopRightRadius: 55,
    padding: 25,
    justifyContent: "space-between",
    paddingBottom: Platform.OS === "android" ? 50 : 40,
  },
  label: {
    fontFamily: "Poppins-Bold", // <-- pakai Poppins reguler
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
    marginTop: 10,
    left: 15,
  },
  inputPass: {
    fontFamily: "Poppins-Regular",
    backgroundColor: "#EEF2FF",
    borderRadius: 60,
    paddingHorizontal: 5,
    paddingVertical: 12,
    paddingTop: 13,
    fontSize: 14,
    marginBottom: -2,
    textAlignVertical: "center",
  },
  input: {
    fontFamily: "Poppins-Regular",
    backgroundColor: "#EEF2FF",
    borderRadius: 60,
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingTop: 12,
    marginBottom: 5,
    fontSize: 14,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    borderRadius: 60,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  // loginButton: {
  //   backgroundColor: "#4C00FF",
  //   paddingVertical: 10,
  //   width: 170,
  //   borderRadius: 12,
  //   marginTop: 20,
  //   alignItems: "center",
  //   shadowColor: "#000",
  //   shadowOpacity: 0.15,
  //   shadowOffset: { width: 0, height: 4 },
  //   shadowRadius: 6,
  //   elevation: 5,
  //   borderRadius: 60,
  //   left: 85,
  // },
  // loginText: {
  //   fontFamily: "Poppins-Bold",
  //   color: "#fff",
  //   fontSize: 16,
  // },
  loginButton: {
    backgroundColor: "#0973FF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    borderRadius: 8,
  },
  loginText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  forgotText: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 13,
    color: "#444",
  },
  fingerprintText: {
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    marginTop: 10,
    fontSize: 13,
    color: "#444",
  },
  orText: {
    textAlign: "center",
    marginVertical: 15,
    color: "#888",
    fontSize: 13,
  },
  socialIcons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginHorizontal: 50,
  },
  welcomeText: {
    fontFamily: "Poppins-Bold",
    fontSize: 26,
    color: "#fff",
    marginTop: 60,
    alignSelf: "center",
    bottom: 120,
    left: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    marginBottom: 10,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingHorizontal: 10,
  },
  modalText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#333",
  },
});

export default PlaceHolderLoginScreen;
