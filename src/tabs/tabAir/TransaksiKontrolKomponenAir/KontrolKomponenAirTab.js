// components/tabs/LokasiSensorTab.js
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { use, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, Text, TouchableOpacity, View } from "react-native";
import EvaluasiTargetPng from "../../../assets/picturePng/EvaluasiTarget.png";
import ButtonAdd from "../../../components/ButtonAdd";
import InfoCard from "../../../components/InfoCard";
import Paging from "../../../components/Paging";
import SensorListStatus from "../../../components/SensorListStatus";
import { postUser, postUserArray } from "../../../services/apiService";
import styles from "../../../styles/globalStyles"; // atau sesuaikan

const KontrolKomponenAirTab = ({ searchQuery }) => {
  const PAGE_SIZE = 10;
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    page: 1,
    query: searchQuery.query,
    sort: searchQuery.sort,
    status: searchQuery.status,
  });

  const [userData, setUserData] = useState([]);
  useEffect(() => {
    // panggil fungsi fetch / reload data berdasarkan searchQuery
    console.log("EvaluasiTargetTab sensor " + searchParams.query);
    console.log("EvaluasiTargetTab sensor " + searchParams.sort);
    console.log("EvaluasiTargetTab sensor " + searchParams.status);
  }, [searchQuery]);

  useEffect(() => {
    setSearchParams((prev) => ({
      ...prev,
      page: 1,
      query: searchQuery.query,
      sort: searchQuery.sort,
      status: searchQuery.status,
    }));
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        try {
          setLoading(true);
          const data = await postUserArray("TransaksiKontrolKomponenAir/GetDataTrsKontrolKomponenAir", {
            page: searchParams.page,
            query: searchParams.query,
            sort: searchParams.sort,
            status: searchParams.status,
          }); // kirim body kosong
          setUserData(data);
          try {
            await postUser("TransaksiKontrolKomponenAir/UpdateStatusTrsKontrolKomponenAir", {});
          } catch (error) {
            console.error("Gagal menjalankan update status:", error);
          }
        } catch (error) {
          console.error("Gagal mengambil data:", error);
        } finally {
          setLoading(false);
        }
      };

      loadUser();
    }, [searchParams])
  );

  function handleSetCurrentPage(newCurrentPage) {
    setSearchParams((prevFilter) => {
      return {
        ...prevFilter,
        page: newCurrentPage,
      };
    });
  }
  if (loading) {
    return (
      <View style={[{ flex: 1, justifyContent: "center", alignItems: "center" }]}>
        <LottieView
          source={require("../../../assets/lottieAnimation/CuteBoyRunning_Loading.json")}
          autoPlay
          loop
          style={{ width: 150, height: 150 }}
        />
        <Text style={{ color: "#000", marginTop: 16, fontSize: 16 }}>{t("loading")}</Text>
      </View>
    );
  }
  return (
    <>
      <InfoCard
        subtitle=" Transaksi"
        title={t("preventive_maintenance")}
        showButton={true}
        labelButton={t("add")}
        onAddPress={() => navigation.navigate("KontrolKomponenAirAdd")}
        imageSource={EvaluasiTargetPng}
        imageStyle={{ width: 150, height: 150 }}
      />
      {/* Komponen Paging */}

      <Text style={styles.sectionTitle}>{t("preventive_maintenance_data")}</Text>
      <SensorListStatus
        data={
          userData
            ? userData.map((item, index) => ({
                icon: "⚙️",
                name:
                  //item["Nomor Transaksi"] + " - " + item["Nomor Komponen"] ||
                  // `Target ${index + 1}`,
                  item["Judul"] + " - " + item["Nomor Komponen"] || `Target ${index + 1}`,
                value: item["Lokasi"] || "0",
                status: item["Status Perbaikan"],
                statusColor:
                  item["Status Perbaikan"] === "Pengecekan"
                    ? "#2196F3"
                    : item["Status Perbaikan"] === "Rencana Perbaikan"
                    ? "#FFC107"
                    : item["Status Perbaikan"] === "Dalam Perbaikan"
                    ? "#FF9800"
                    : item["Status Perbaikan"] === "Terlambat"
                    ? "#D32F2F"
                    : item["Status Perbaikan"] === "Selesai"
                    ? "#4CAF50"
                    : "#9E9E9E",
                onPress: () =>
                  navigation.navigate("KontrolKomponenAirEdit", {
                    id: item["Key"],
                    status: item["Status Perbaikan"],
                  }),
              }))
            : []
        }
      />
      <Paging
        pageSize={PAGE_SIZE}
        pageCurrent={searchParams.page}
        totalData={userData && userData[0] && userData[0]["Count"] ? userData[0]["Count"] : 0}
        navigation={handleSetCurrentPage}
      />
    </>
  );
};

export default KontrolKomponenAirTab;
