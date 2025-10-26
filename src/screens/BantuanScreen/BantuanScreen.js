import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const Bantuan = ({ navigation }) => {
  const { t } = useTranslation();
  return (
    <LinearGradient colors={["#0973FF", "#054599"]} style={styles.container}>
      {/* Tombol Kembali */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="#fff" />
        <Text style={styles.backText}>{t("back")}</Text>
      </TouchableOpacity>

      {/* Scrollable area: Card utama dengan semua bantuan */}
      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollView}>
        <View style={styles.mainCard}>
          <Text style={styles.title}>{t("help_center")}</Text>

          <View style={styles.card}>
            <Text style={styles.question}>📊 {t("q_monitor_usage")}</Text>
            <Text style={styles.answer}>{t("a_monitor_usage")}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.question}>🎯 {t("q_sustainability_target")}</Text>
            <Text style={styles.answer}>{t("a_sustainability_target")}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.question}>📌 {t("q_cannot_access_sensor")}</Text>
            <Text style={styles.answer}>{t("a_cannot_access_sensor")}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.question}>🔒 {t("q_data_security")}</Text>
            <Text style={styles.answer}>{t("a_data_security")}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.question}>⚙️ {t("q_manage_notifications")}</Text>
            <Text style={styles.answer}>{t("a_manage_notifications")}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bagian tetap di bawah layar */}
      <View style={styles.contactCard}>
        <Text style={styles.contactTitle}>{t("contact_us")}</Text>
        <Text style={styles.contactText}>📧 {t("contact_email")}</Text>
        <Text style={styles.contactText}>📱 {t("contact_whatsapp")}</Text>
      </View>
    </LinearGradient>
  );
};

export default Bantuan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 50,
    marginLeft: 20,
    marginBottom: 10,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    marginBottom: Platform.OS === "android" ? 100 : 100, // Add space for contact card
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  mainCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: 16,
    marginTop: 5, // Reduce top margin
  },
  title: {
    fontSize: 24,
    color: "#054599",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#e6f0ff",
    borderRadius: 12,
    padding: 10, // Slightly reduce padding
    marginBottom: 12, // Reduce space between cards
  },
  question: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#054599",
    marginBottom: 6,
  },
  answer: {
    fontSize: 14,
    color: "#333",
  },
  contactCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10, // Kurangi elevation agar tidak terlalu melayang
    paddingBottom: Platform.OS === "android" ? 40 : 20,
    position: "absolute", // Memastikan card menempel di bawah
    bottom: 0, // Menempel di bawah
    left: 0,
    right: 0,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#054599",
    marginBottom: 10,
    textAlign: "center",
  },
  contactText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
});
