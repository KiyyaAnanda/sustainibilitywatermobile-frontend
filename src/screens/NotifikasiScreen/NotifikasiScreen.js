import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { postUser, postUserArray } from "../../services/apiService";
import { APPLICATION_ID } from "../../Util/Constants";

const NotifikasiScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const itemsPerPage = 4;
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("unread");
  const [unreadPage, setUnreadPage] = useState(1);
  const [readPage, setReadPage] = useState(1);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [currentFilter, setCurrentFilter] = useState(null);

  const getSessionData = async () => {
    try {
      const userJson = await AsyncStorage.getItem("activeUser");
      if (userJson !== null) {
        const parsedUser = JSON.parse(userJson);
        console.log("User dari session:", parsedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Gagal membaca session:", error);
    }
  };

  useEffect(() => {
    getSessionData();
  }, []);

  useEffect(() => {
    if (!user) return;

    const newFilter = {
      page: activeTab === "unread" ? unreadPage : readPage,
      query: "",
      sort: "[Waktu] desc",
      status: activeTab === "unread" ? "Belum Dibaca" : "Sudah Dibaca",
      app: APPLICATION_ID,
      penerima: user.username,
    };

    console.log("Filter notifikasi:", newFilter);
    setCurrentFilter(newFilter);
  }, [user, activeTab, unreadPage, readPage]);

  const loadNotifikasiMobile = async () => {
    if (!currentFilter) return;

    try {
      setLoading(true);
      const data = await postUserArray(
        "Utilities/GetDataNotifikasiMobile",
        currentFilter
      );
      console.log("Data notifikasi:", data);

      // APPEND jika halaman > 1, REPLACE jika halaman 1
      if (
        (activeTab === "unread" && unreadPage > 1) ||
        (activeTab === "read" && readPage > 1)
      ) {
        setNotifications((prev) => [...prev, ...data]);
      } else {
        setNotifications(data);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotifikasiMobile();
    }, [currentFilter])
  );

  const markAsRead = async (Key) => {
    try {
      console.log("Menandai notifikasi sebagai dibaca:", Key);
      await postUser("Utilities/SetReadNotifikasiMobile", {
        Key: Key,
        username: user.username,
      });
      await loadNotifikasiMobile();
    } catch (error) {
      console.error("Gagal menandai notifikasi sebagai dibaca:", error);
    }
  };
  const unreadNotifications = activeTab === "unread" ? notifications : [];
  const readNotifications = activeTab === "read" ? notifications : [];

  const displayedNotifications =
    activeTab === "unread"
      ? unreadNotifications.slice(0, unreadPage * itemsPerPage)
      : readNotifications.slice(0, readPage * itemsPerPage);

  return (
    <LinearGradient colors={["#0973FF", "#054599"]} style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color="#fff" />
        <Text style={styles.backText}>{t("back")}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{t("notification_title")}</Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "unread" && styles.activeTab]}
          onPress={() => setActiveTab("unread")}
        >
          <Text
            style={[styles.tabText, activeTab === "unread" && styles.activeTabText]}
          >
          🔵 {t("unread")}
        </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "read" && styles.activeTab]}
          onPress={() => setActiveTab("read")}
        >
          <Text
            style={[styles.tabText, activeTab === "read" && styles.activeTabText]}
          >
            {t("read")}
        </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {loading ? (
          <Text style={styles.emptyText}>{t("loading_notifications")}</Text>
        ) : displayedNotifications.length === 0 ? (
          <Text style={styles.emptyText}>{t("no_notifications")}</Text>
        ) : (
          displayedNotifications.map((notif) => (
            <View key={notif.Key} style={styles.card}>
              <Text style={styles.cardTitle}>{notif.Subjek}</Text>
              <Text style={styles.cardMessage}>{notif.Pesan}</Text>
              <View style={styles.timeContainer}>
                <View style={styles.timeItem}>
                  <Icon
                    name="calendar-today"
                    size={14}
                    color="#888"
                    style={styles.timeIcon}
                  />
                  <Text style={styles.timeText}>
                    {notif.Waktu.split(" ")[0]}
                  </Text>
                </View>
                <View style={styles.timeItem}>
                  <Icon
                    name="access-time"
                    size={14}
                    color="#888"
                    style={styles.timeIcon}
                  />
                  <Text style={styles.timeText}>
                    {notif.Waktu.split(" ")[1]}
                  </Text>
                </View>
              </View>

              {activeTab === "unread" ? (
                <TouchableOpacity
                  style={styles.readButton}
                  onPress={() => markAsRead(notif.Key)}
                >
                  <Text style={styles.readButtonText}>{t("set_as_read")}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.readStatus}>✔ {t("status_read")}</Text>
              )}
            </View>
          ))
        )}

        {(activeTab === "unread"
          ? unreadNotifications.length > unreadPage * itemsPerPage
          : readNotifications.length > readPage * itemsPerPage) && (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={() =>
              activeTab === "unread"
                ? setUnreadPage(unreadPage + 1)
                : setReadPage(readPage + 1)
            }
          >
            <Text style={styles.loadMoreText}>{t("load_more")}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

export default NotifikasiScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 20,
    marginBottom: 10,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#fff",
  },
  tabText: {
    color: "#eee",
    fontWeight: "600",
    fontSize: 14,
  },
  activeTabText: {
    color: "#054599",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#054599",
    marginBottom: 4,
  },
  cardMessage: {
    fontSize: 14,
    color: "#444",
    marginBottom: 8,
  },
  cardTime: {
    fontSize: 12,
    color: "#888",
    marginBottom: 10,
  },
  readButton: {
    alignSelf: "flex-start",
    backgroundColor: "#054599",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  readButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  readStatus: {
    fontSize: 12,
    color: "#0a8430",
    fontWeight: "600",
    backgroundColor: "#d4f4dc",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  emptyText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 14,
    marginTop: 40,
    fontStyle: "italic",
  },
  loadMoreButton: {
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 30,
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  loadMoreText: {
    color: "#054599",
    fontWeight: "600",
  },
  timeContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  timeItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeIcon: {
    marginRight: 4,
  },
  timeText: {
    fontSize: 12,
    color: "#888",
  },
});
