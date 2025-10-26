// components/tabs/LokasiSensorTab.js
import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import ButtonAdd from "../../../components/ButtonAdd";
import styles from "../../../styles/globalStyles"; // atau sesuaikan
import PenggunaanAirPng from "../../../assets/picturePng/PenggunaanAir.png";
import SensorList from "../../../components/SensorList";
import InfoCard from "../../../components/InfoCard";
import { postUser, postUserArray } from "../../../services/apiService";
import Paging from "../../../components/Paging";
import { formatDateOnly } from "../../../Util/Formatting";

const PenggunaanAirTab = ({ searchQuery }) => {
  const PAGE_SIZE = 10;
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [dataPenggunaanAir, setDataPenggunaanAir] = useState([]);

  useEffect(() => {
    console.log("KomponenAirTab sensor " + searchQuery.query);
    console.log("KomponenAirTab sensor " + searchQuery.sort);
  }, [searchQuery]);

  const [searchParams, setSearchParams] = useState({
    page: 1,
    query: searchQuery.query,
    sort: searchQuery.sort,
  });

  useEffect(() => {
    setSearchParams((prev) => ({
      ...prev,
      page: 1,
      query: searchQuery.query,
      sort: searchQuery.sort,
    }));
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      const loadPenggunaanAir = async () => {
        try {
          console.log(
            "Memuat data penggunaan air dengan parameter:",
            searchParams
          );
          const data = await postUserArray(
            "TransaksiPenggunaanAir/GetDataPenggunaanAir",
            {
              page: searchParams.page,
              query: searchParams.query,
              sort: searchParams.sort,
            }
          ); // kirim body kosong
          setDataPenggunaanAir(data);
        } catch (error) {
          console.error("Gagal mengambil data:", error);
        }
      };
      loadPenggunaanAir();
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

  console.log("PenggunaanAirTab sensor " + searchQuery.query);
  console.log("PenggunaanAirTab sensor " + searchQuery.sort);
  return (
    <>
      <InfoCard
        subtitle="Transaksi"
        title={t("water_usage")}
        showButton={false}
        labelButton={t("consumption")}
        imageSource={PenggunaanAirPng}
        imageStyle={{ width: 150, height: 150 }}
      />

      <Text style={styles.sectionTitle}>{t("water_consumption_data")}</Text>
      <SensorList
        data={
          dataPenggunaanAir && dataPenggunaanAir.length > 0
            ? dataPenggunaanAir.map((item, index) => ({
                icon: "💧",
                name: item["Lokasi"] || `Target ${index + 1}`,
                value: formatDateOnly(item["Tanggal"]) || "xx-xx-xxxx",
                onPress: () =>
                  navigation.navigate("PenggunaanAirDetail", {
                    id: item["Key"],
                  }),
              }))
            : []
        }
      />
      <Paging
        pageSize={PAGE_SIZE}
        pageCurrent={searchParams.page}
        totalData={
          dataPenggunaanAir &&
          dataPenggunaanAir[0] &&
          dataPenggunaanAir[0]["Count"]
            ? dataPenggunaanAir[0]["Count"]
            : 0
        }
        navigation={handleSetCurrentPage}
      />
    </>
  );
};

export default PenggunaanAirTab;
