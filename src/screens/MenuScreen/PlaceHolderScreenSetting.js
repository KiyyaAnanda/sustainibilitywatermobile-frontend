import React, { useState, useEffect, useCallback } from "react";
import LottieView from "lottie-react-native";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
const { height } = Dimensions.get("window");
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import MIpng from "../../assets/picturePng/Manajemen-informatika.png";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { postUser } from "../../services/apiService";
import { APPLICATION_ID } from "../../Util/Constants";

// Sudah menggunakan key untuk mendukung multi-language
const settingsOptions = [
  { titleKey: "profile", icon: "person", route: "ProfileScreen" },
  {
    titleKey: "notifications",
    icon: "notifications",
    route: "NotifikasiScreen",
  },
  {
    titleKey: "change_password",
    icon: "lock",
    route: "EditReplacePasswordScreen",
  },
  { titleKey: "help", icon: "help-outline", route: "BantuanScreen" },
  { titleKey: "language", icon: "language", route: "LanguageScreen" },
  { titleKey: "about_app", icon: "info", route: "TentangAplikasi" },
  { titleKey: "logout", icon: "exit-to-app", route: "LoginScreen" },
];

const SettingScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countNotifications, setCountNotifications] = useState(0);

  const getSessionData = async () => {
    try {
      const userJson = await AsyncStorage.getItem("activeUser");
      if (userJson !== null) {
        const parsedUser = JSON.parse(userJson);
        console.log("User dari session:", parsedUser);
        setUser(parsedUser);
        loadCountNotifikasiMobile(parsedUser);
      }
    } catch (error) {
      console.error("Gagal membaca session:", error);
    }
  };

  const loadCountNotifikasiMobile = async (parsedUser) => {
    try {
      setLoading(true);
      const data = await postUser("Utilities/GetDataCountingNotifikasi", {
        app: APPLICATION_ID,
        penerima: parsedUser.username,
      });
      console.log("Data notifikasi:", data);
      if (data.length === 0) {
        setCountNotifications(0);
        return;
      }
      setCountNotifications(data[0].counting);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getSessionData();
    }, [])
  );

  if (!user || loading) {
    return (
      <LinearGradient
        colors={["#0973FF", "#054599"]}
        style={[stylesLoading.container, { justifyContent: "center" }]}
      >
        <LottieView
          source={require("../../assets/lottieAnimation/CuteBoyRunning_Loading.json")}
          autoPlay
          loop
          style={{ width: 150, height: 150 }}
        />
        <Text style={{ color: "#fff", marginTop: 16, fontSize: 16 }}>
          {t("loading")}
        </Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0973FF", "#054599"]} style={styles.gradientContainer}>
      <Text style={styles.header}>{t("settings_title")}</Text>

      <View style={{ width: "100%", alignItems: "center" }}>
        <Image source={MIpng} style={{ width: 220, height: 220, marginRight: 150, marginTop: 0 }} />
      </View>

      <View style={styles.container}>
        <View style={styles.scrollWrapper}>
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {settingsOptions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.option}
                activeOpacity={0.8}
                onPress={async () => {
                  if (item.titleKey === "logout") {
                    try {
                      await AsyncStorage.removeItem("activeUser"); // atau AsyncStorage.clear();
                      navigation.reset({
                        index: 0,
                        routes: [{ name: "LoginScreen" }],
                      });
                    } catch (error) {
                      console.error("Gagal logout:", error);
                    }
                  } else if (item.route) {
                    navigation.navigate(item.route);
                  }
                }}>
                <View style={styles.leftContent}>
                  <View style={styles.iconWrapper}>
                    <Icon name={item.icon} size={20} color="#054599" />
                    {item.icon === "notifications" && countNotifications > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{countNotifications}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.optionText}>{t(item.titleKey)}</Text>
                </View>
                {item.route && <Icon name="chevron-right" size={24} color="#aaa" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </LinearGradient>
  );
};

export default SettingScreen;

const stylesLoading = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: "center",
  },
});
const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 0,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    paddingBottom: 20,
    textAlign: "center",
    color: "#fff",
  },
  list: {
    paddingBottom: 20,
    paddingHorizontal: 5,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    backgroundColor: "#D6E9FF",
    padding: 10,
    borderRadius: 30,
    marginRight: 16,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "red",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  container: {
    position: "absolute",
    borderTopRightRadius: 50,
    borderTopLeftRadius: 50,
    bottom: 20,
    height: height * 0.5, // 60% dari tinggi layar
    width: "100%",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 20,
  },
  scrollWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    marginTop: -40,
    padding: 10,
    height: height * 0.7 * 0.7, // 70% dari container
  },
});
