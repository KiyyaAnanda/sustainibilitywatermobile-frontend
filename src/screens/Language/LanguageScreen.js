import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import i18n from "../../i18n"; // pastikan path ini benar sesuai project kamu

const { height, width } = Dimensions.get("window");

const LanguageScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const languages = [
    {
      code: "id",
      name: "Bahasa Indonesia",
      flag: require("../../assets/picturePng/Indonesian.png"),
      gradient: ["#FFFFFF", "#F0F0F0"],
    },
    {
      code: "en",
      name: "English (UK)",
      flag: require("../../assets/picturePng/English.png"),
      gradient: ["#FFFFFF", "#F0F0F0"],
    },
  ];

  const handleLanguageChange = (code) => {
    setSelectedLanguage(code);
    i18n.changeLanguage(code);
  };

  return (
    <LinearGradient colors={["#0973FF", "#054599"]} style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Back button */}
      {/* <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Text style={styles.backButtonText}>{t("back")}</Text>
      </TouchableOpacity>*/}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color="#FFFFFF" />
        <Text style={styles.backText}>{t("back")}</Text>
      </TouchableOpacity>

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.title}>{t("select_language")}</Text>
        <Text style={styles.subtitle}>{t("choose_preferred_language")}</Text>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.languageList, { opacity: fadeAnim }]}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.cardContainer,
                selectedLanguage === lang.code && styles.activeCard,
              ]}
              activeOpacity={0.9}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <LinearGradient
                colors={lang.gradient}
                style={styles.cardBackground}
              >
                <View style={styles.cardContent}>
                  <Image source={lang.flag} style={styles.flag} />
                  <Text style={styles.languageText}>{lang.name}</Text>
                  {selectedLanguage === lang.code && (
                    <View style={styles.checkMark}>
                      <Text style={styles.checkText}>✓</Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </ScrollView>

      {/* Current Language Info */}
      <View style={styles.languageIndicator}>
        <Text style={styles.languageIndicatorText}>
          {t("current_language")}:{" "}
          {languages.find((l) => l.code === selectedLanguage)?.name}
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: height * 0.06,
    paddingHorizontal: 20,
  },
  // backButton: {
  //   alignSelf: "flex-start",
  //   paddingHorizontal: 16,
  //   paddingVertical: 8,
  //   backgroundColor: "rgba(255,255,255,0.2)",
  //   borderRadius: 20,
  //   marginBottom: 15,
  // },
  // backButtonText: {
  //   color: "#fff",
  //   fontSize: 14,
  //   fontWeight: "500",
  // },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    // marginBottom: 20,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20.
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  languageList: {
    flexGrow: 1,
  },
  cardContainer: {
    borderRadius: 15,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 5,
  },
  activeCard: {
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  cardBackground: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  flag: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  languageText: {
    flex: 1,
    fontSize: 18,
    color: "#1E293B",
    fontWeight: "600",
    marginLeft: 15,
  },
  checkMark: {
    backgroundColor: "#4CAF50",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  checkText: {
    color: "#fff",
    fontWeight: "bold",
  },
  languageIndicator: {
    alignItems: "center",
    marginTop: 10,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 15,
    marginBottom: height * 0.05,
  },
  languageIndicatorText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default LanguageScreen;
