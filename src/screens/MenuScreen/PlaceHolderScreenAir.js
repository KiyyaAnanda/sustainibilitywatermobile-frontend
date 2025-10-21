import { Entypo, FontAwesome, FontAwesome6, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FotoProfile from "../../assets/picturePng/FotoProfile.png";
import ButtonAdd from "../../components/ButtonAdd";
import DropDown from "../../components/DropDown";
import Filter from "../../components/Filter";
import HeaderUser from "../../components/Header";
import { API_URL, postUser } from "../../services/apiService"; // Pastikan path ini sesuai dengan struktur project kamu
import EvaluasiTargetTab from "../../tabs/tabAir/MasterEvaluasiTarget/EvaluasiTargetTab";
import KomponenAirTab from "../../tabs/tabAir/MasterKomponenAir/KomponenAirTab";
import LokasiSensorTab from "../../tabs/tabAir/MasterLokasiSensor/LokasiSensorTab";
import KontrolKomponenAirTab from "../../tabs/tabAir/TransaksiKontrolKomponenAir/KontrolKomponenAirTab";
import PenggunaanAirTab from "../../tabs/tabAir/TransaksiPenggunaanAir/PenggunaanAirTab";

const { width, height } = Dimensions.get("window");

const PlaceHolderScreenAir = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchFilterSort, setSearchFilterSort] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [user, setUser] = useState(null);
  const { t } = useTranslation();

  const [searchParams, setSearchParams] = useState({
    page: 1,
    query: "",
    sort: searchFilterSort || "",
    status: selectedStatus || "",
  });

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
        } catch (error) {
          console.error("Gagal mengambil data:", error);
        }
      };

      loadUserProfile();
    }, [user])
  );

  const tabs = [
    {
      name: t("master_sensor_location"),
      icon: (isActive) => <FontAwesome6 name="map-location-dot" size={24} color={isActive ? "#0455cc" : "white"} />,
    },
    {
      name: t("sensor_water"),
      icon: (isActive) => <Ionicons name="water" size={24} color={isActive ? "#0455cc" : "white"} />,
    },
    {
      name: t("target_evaluation"),
      icon: (isActive) => <FontAwesome name="fire" size={24} color={isActive ? "#0455cc" : "white"} />,
    },
    {
      name: t("water_usage"),
      icon: (isActive) => <FontAwesome name="bar-chart" size={24} color={isActive ? "#0455cc" : "white"} />,
    },
    {
      name: t("preventive_maintenance"),
      icon: (isActive) => <FontAwesome name="wrench" size={24} color={isActive ? "#0455cc" : "white"} />,
    },
  ];

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 0:
        return <LokasiSensorTab searchQuery={searchParams} />;
      case 1:
        return <KomponenAirTab searchQuery={searchParams} />;
      case 2:
        return <EvaluasiTargetTab searchQuery={searchParams} />;
      case 3:
        return <PenggunaanAirTab searchQuery={searchParams} />;
      case 4:
        return <KontrolKomponenAirTab searchQuery={searchParams} />;
      default:
        return null;
    }
  };

  const getFilterSortData = () => {
    switch (activeTab) {
      case 0:
        return dataLokasiFilterSort;
      case 1:
        return dataKomponenAirFilterSort;
      case 2:
        return dataEvaluasiTargetFilterSort;
      case 3:
        return dataTRpenggunaanFilter; // Atau buat data khusus PenggunaanAir jika perlu
      case 4:
        return dataTRKontrolKomponenAirFilter;
      default:
        return [];
    }
  };

  const defaultFilters = [
    {
      // Lokasi Sensor
      page: 1,
      query: "",
      sort: "[Nama Gedung] asc",
      status: "Aktif",
    },
    {
      // Komponen Air
      page: 1,
      query: "",
      sort: "[Nomor Komponen] asc",
    },
    {
      // Evaluasi Target
      page: 1,
      query: "",
      sort: "[Target Bulanan Individu] asc",
    },
    {
      // Penggunaan Air (misalnya kosong/default juga)
      page: 1,
      query: "",
      sort: "[Lokasi] asc",
    },
    {
      // Penggunaan Air (misalnya kosong/default juga)
      page: 1,
      query: "",
      sort: "[Nomor Transaksi] asc",
      status: "ALL",
    },
  ];

  React.useEffect(() => {
    const defaultParam = defaultFilters[activeTab];
    setSearchParams(defaultParam);
    setSearchFilterSort(defaultParam.sort || "");
    setSelectedStatus(defaultParam.status || "");
  }, [activeTab]);

  const dataEvaluasiTargetFilterSort = [
    { Value: "[Jumlah Individu] asc", Text: "Jumlah Individu [↑]" },
    { Value: "[Jumlah Individu] desc", Text: "Jumlah Individu [↓]" },
    {
      Value: "[Persentase Target Penghematan] asc",
      Text: "Persentase Target Penghematan [↑]",
    },
    {
      Value: "[Persentase Target Penghematan] desc",
      Text: "Persentase Target Penghematan [↓]",
    },
  ];

  const dataKomponenAirFilterSort = [
    { Value: "[Nomor Komponen] asc", Text: "Nomor Sensor [↑]" },
    { Value: "[Nomor Komponen] desc", Text: "Nomor Sensor [↓]" },
  ];

  const dataLokasiFilterSort = [
    { Value: "[Nama Gedung] asc", Text: "Nama Gedung [↑]" },
    { Value: "[Nama Gedung] desc", Text: "Nama Gedung [↓]" },
  ];

  const dataLokasiFilterStatus = [
    { Value: "Aktif", Text: "Aktif" },
    { Value: "Tidak Aktif", Text: "Tidak Aktif" },
  ];

  const dataTRpenggunaanFilter = [
    { Value: "[Lokasi] asc", Text: "Lokasi [↑]" },
    { Value: "[Lokasi] desc", Text: "Lokasi [↓]" },
  ];

  const dataTRKontrolKomponenAirFilter = [
    { Value: "[Nomor Transaksi] asc", Text: "Nomor Transaksi [↑]" },
    { Value: "[Nomor Transaksi] desc", Text: "Nomor Transaksi [↓]" },
    { Value: "[Nomor Komponen] asc", Text: "Nomor Komponen [↑]" },
    { Value: "[Nomor Komponen] desc", Text: "Nomor Komponen [↓]" },
    { Value: "[Tanggal Pengecekan] asc", Text: "Tanggal Pengecekan [↑]" },
    { Value: "[Tanggal Pengecekan] desc", Text: "Tanggal Pengecekan [↓]" },
    { Value: "[Tanggal Rencana Mulai] asc", Text: "Tanggal Rencana Mulai [↑]" },
    {
      Value: "[Tanggal Rencana Mulai] desc",
      Text: "Tanggal Rencana Mulai [↓]",
    },
    {
      Value: "[Tanggal Rencana Selesai] asc",
      Text: "Tanggal Rencana Selesai [↑]",
    },
    {
      Value: "[Tanggal Rencana Selesai] desc",
      Text: "Tanggal Rencana Selesai [↓]",
    },
    {
      Value: "[Tanggal Aktual Selesai] asc",
      Text: "Tanggal Aktual Selesai [↑]",
    },
    {
      Value: "[Tanggal Aktual Selesai] desc",
      Text: "Tanggal Aktual Selesai [↓]",
    },
  ];

  const dataTRKontrolKomponenAirStatus = [
    { Value: "ALL", Text: "Semua" },
    { Value: "Pengecekan", Text: "Pengecekan" },
    { Value: "Rencana Perbaikan", Text: "Rencana Perbaikan" },
    { Value: "Dalam Perbaikan", Text: "Dalam Perbaikan" },
    { Value: "Terlambat", Text: "Terlambat" },
    { Value: "Selesai", Text: "Selesai" },
  ];

  if (!userProfile) {
    return (
      <LinearGradient colors={["#0973FF", "#054599"]} style={[stylesLoading.container, { justifyContent: "center" }]}>
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
      <LinearGradient colors={["#0973FF", "#054599"]} style={styles.gradient}>
        <View style={styles.container}>
          {/* Header Section */}
          <LinearGradient colors={["#0973FF", "#054599"]} style={styles.header}>
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
              customStyles={{
                header: stylesAvatar.header,
                username: stylesAvatar.username,
                position: stylesAvatar.position,
                avatar: stylesAvatar.avatar,
                logoutIconColor: "white", // ini bukan style object
              }}
            />

            {/* Search Bar */}
            {/* <TextInput
            style={styles.searchBar}
            placeholder="Cari layanan atau informasi..."
            placeholderTextColor="#999"
            /> */}
            <View style={styles.searchBarWrapper}>
              <TextInput
                style={styles.searchBarInput}
                placeholder="Cari layanan atau informasi..."
                placeholderTextColor="#999"
                value={searchParams.query}
                onChangeText={(text) => setSearchParams((prev) => ({ ...prev, query: text, page: 1 }))}
              />
              <View style={styles.filterWrapper}>
                <Filter>
                  {/* dropdown seperti sebelumnya */}
                  <DropDown
                    label="Pilih Filter"
                    // type="pilih"
                    arrData={getFilterSortData()}
                    selectedValue={searchFilterSort}
                    onValueChange={(val) => {
                      setSearchFilterSort(val);
                      setSearchParams((prev) => ({
                        ...prev,
                        page: 1,
                        sort: val,
                      }));
                    }}
                    pickerWrapper={{
                      borderWidth: 0,
                      borderColor: "#ccc",
                      borderRadius: 10,
                      overflow: "hidden",
                      height: 80, // atur tinggi dropdown
                      width: "100%", // bisa diganti ke ukuran tetap, contoh: 200
                      justifyContent: "center",
                    }}
                  />
                  {activeTab === 0 && (
                    <DropDown
                      label="Status"
                      type="pilih"
                      arrData={dataLokasiFilterStatus}
                      selectedValue={searchParams.status}
                      onValueChange={(val) => {
                        setSearchParams((prev) => ({
                          ...prev,
                          page: 1,
                          status: val,
                        }));
                      }}
                      pickerWrapper={{
                        borderWidth: 0,
                        borderColor: "#ccc",
                        borderRadius: 4,
                        overflow: "hidden",
                        height: 80, // atur tinggi dropdown
                        width: "100%", // bisa diganti ke ukuran tetap, contoh: 200
                        justifyContent: "center",
                      }}
                    />
                  )}
                  {activeTab === 4 && (
                    <DropDown
                      label="Status"
                      type="pilih"
                      arrData={dataTRKontrolKomponenAirStatus}
                      selectedValue={searchParams.status}
                      onValueChange={(val) => {
                        setSearchParams((prev) => ({
                          ...prev,
                          page: 1,
                          status: val,
                        }));
                      }}
                      pickerWrapper={{
                        borderWidth: 0,
                        borderColor: "#ccc",
                        borderRadius: 4,
                        overflow: "hidden",
                        height: 80, // atur tinggi dropdown
                        width: "100%", // bisa diganti ke ukuran tetap, contoh: 200
                        justifyContent: "center",
                      }}
                    />
                  )}
                </Filter>
              </View>
            </View>

            {/* Feature Cards */}
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} pagingEnabled={true}>
              <View style={styles.featureCards}>
                {tabs.map((tab, index) => {
                  const isActive = activeTab === index;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.featureCard, isActive && styles.featureCardActive]}
                      onPress={() => setActiveTab(index)}>
                      {tab.icon(isActive)}
                      <Text style={[styles.featureText, isActive && styles.featureTextActive]}>{tab.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </LinearGradient>

          {/* Main Content */}
          <ScrollView
            style={styles.mainContent}
            contentContainerStyle={{ paddingBottom: 25 }}
            showsVerticalScrollIndicator={false}>
            {renderActiveTabContent()}
          </ScrollView>

          {/* Bottom Navigation */}
        </View>
      </LinearGradient>
    );
  }
};

const stylesAvatar = StyleSheet.create({
  container: { paddingTop: 13, alignItems: "center" },
  header: {
    paddingTop: 3,
    marginBottom: 20,
    flexDirection: "row", // horizontal layout
    justifyContent: "space-between",
    alignItems: "center", // vertical center
    width: "100%",
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

  logoutButton: {
    marginLeft: 10,
  },
});
const stylesLoading = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: "center",
  },
});

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff", // putih penuh
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20, // curve
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 10,
  },
  searchBarInput: {
    flex: 1,
  },
  filterWrapper: {
    width: 50, // atau sesuaikan
  },
  header: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoIcon: {
    width: 32,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  logoNumber: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  logoText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationText: {
    fontSize: 16,
  },
  searchBar: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 12,
    marginBottom: 20,
    width: 310,
  },
  featureCards: {
    flexDirection: "row",
    gap: 10,
  },
  featureCard: {
    flexShrink: 0,
    width: 85,
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    gap: 8,
  },
  featureCardActive: {
    backgroundColor: "white",
  },

  featureTextActive: {
    color: "#0455cc",
  },

  featureText: {
    color: "white",
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
  },
  mainContent: {
    flex: 1,
    marginBottom: 20,
    padding: 20,
    backgroundColor: "#F5F5F5", // warna abu-abu muda
  },

  infoCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  infoCardContent: {
    position: "relative",
  },
  infoTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  infoSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginBottom: 5,
  },
  deviceInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 20,
  },
  buttonAdd: {
    alignSelf: "flex-start", // menjaga posisi kiri bawah
  },
  deviceImagePlaceholder: {
    width: 100,
    height: 80,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    marginTop: "-10%",
  },
  deviceImageText: {
    fontSize: 40,
  },
  monitorText: {
    color: "white",
    fontSize: 14,
    marginTop: 10,
    fontWeight: "500",
  },
  infoStats: {
    flexDirection: "row",
    gap: 20,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statIcon: {
    fontSize: 16,
  },
  statText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  sensorList: {
    gap: 10,
  },
  sensorItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sensorIcon: {
    width: 50,
    height: 50,
    backgroundColor: "#E3F2FD",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  sensorIconText: {
    fontSize: 20,
  },
  sensorInfo: {
    flex: 1,
  },
  sensorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  sensorStatus: {
    fontSize: 12,
    color: "#666",
  },
  sensorArrow: {
    fontSize: 20,
    color: "#999",
    marginLeft: "auto",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  navItemActive: {
    backgroundColor: "#0973FF",
    borderRadius: 20,
  },
  navIcon: {
    fontSize: 20,
  },
});

export default PlaceHolderScreenAir;
