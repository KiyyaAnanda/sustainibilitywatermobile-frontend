import React, { useEffect, useState, useCallback } from "react";
import LottieView from "lottie-react-native";
import { useTranslation } from "react-i18next";
import { View, Text, Alert, SectionList, StyleSheet } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import InfoCard from "../../../components/InfoCard";
import SensorList from "../../../components/SensorList";
import LokasiSensorPng from "../../../assets/picturePng/LokasiSensor.png";
import styles from "../../../styles/globalStyles";
import { postUser, postUserArray } from "../../../services/apiService";
import Paging from "../../../components/Paging";
import SensorListItem from "../../../components/SensorListItem";

const LokasiSensorTab = ({ searchQuery }) => {
  const navigation = useNavigation();
  const [dataLokasi, setDataLokasi] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    console.log("KomponenAirTab sensor " + searchQuery.query);
    console.log("KomponenAirTab sensor " + searchQuery.sort);
    console.log("KomponenAirTab sensor " + searchQuery.status);
  }, [searchQuery]);

  const PAGE_SIZE = 10;

  const [searchParams, setSearchParams] = useState({
    page: 1,
    query: searchQuery.query,
    sort: searchQuery.sort,
    status: searchQuery.status,
  });

  const [userData, setUserData] = useState([]);

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
          const data = await postUserArray("MasterLokasi/GetDataLokasi", {
            page: searchParams.page,
            query: searchParams.query,
            sort: searchParams.sort,
            status: searchParams.status,
          }); // kirim body kosong
          setDataLokasi(Array.isArray(data) ? data : []); // fallback to [] kalau bukan array
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
      <View
        style={[{ flex: 1, justifyContent: "center", alignItems: "center" }]}
      >
        <LottieView
          source={require("../../../assets/lottieAnimation/CuteBoyRunning_Loading.json")}
          autoPlay
          loop
          style={{ width: 150, height: 150 }}
        />
        <Text style={{ color: "#fff", marginTop: 16, fontSize: 16 }}>
          {t("loading")}
        </Text>
      </View>
    );
  }

  const groupedData = dataLokasi.reduce((acc, item) => {
    const gedung = item["Nama Gedung"] || "Gedung Tidak Diketahui";
    if (!acc[gedung]) {
      acc[gedung] = [];
    }
    acc[gedung].push({
      icon: "💧",
      name: item["Nama Gedung"],
      value: `${item["Lantai"]} (${item["Status"]})`,
      onPress: () =>
        navigation.navigate("LokasiSensorDetail", {
          id: item["Key"],
          status: item["Status"],
        }),
    });
    return acc;
  }, {});

  const sectionData = Object.keys(groupedData).map((gedung) => ({
    title: gedung,
    data: groupedData[gedung],
  }));

  return (
    <>
      <InfoCard
        subtitle="Master"
        title={t("location_sensor")}
        showButton={true}
        labelButton={t("button_add_location")}
        onAddPress={() => navigation.navigate("LokasiSensorAdd")} // Navigasi ke LokasiSensorAdd
        imageSource={LokasiSensorPng}
        imageStyle={{ width: 150, height: 150 }}
      />

      <Text style={styles.sectionTitle}>{t("sensor_location_data")}</Text>
      {sectionData.length === 0 ? (
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <Text style={{ color: "#888", fontSize: 16 }}>
            {t("no_location_data") || "Data lokasi belum tersedia"}
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sectionData}
          scrollEnabled={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <SensorListItem
              icon={item.icon}
              name={item.name}
              value={item.value}
              onPress={item.onPress}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={localStyles.sectionHeader}>{title}</Text>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          SectionSeparatorComponent={() => <View style={{ height: 12 }} />}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      )}

      <Paging
        pageSize={PAGE_SIZE}
        pageCurrent={searchParams.page}
        totalData={
          dataLokasi && dataLokasi[0] && dataLokasi[0]["Count"]
            ? dataLokasi[0]["Count"]
            : 0
        }
        navigation={handleSetCurrentPage}
      />
    </>
  );
};

const localStyles = StyleSheet.create({
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0973FF",
    marginVertical: 8,
    marginLeft: 8,
  },
});
export default LokasiSensorTab;
