import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import KomponenAirPng from "../../../assets/picturePng/KomponenAir.png";
import ButtonAdd from "../../../components/ButtonAdd";
import InfoCard from "../../../components/InfoCard";
import Paging from "../../../components/Paging";
import SensorList from "../../../components/SensorList";
import { postUser, postUserArray } from "../../../services/apiService";
import styles from "../../../styles/globalStyles";

const KomponenAirTab = ({ searchQuery }) => {
  const PAGE_SIZE = 10;
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useState({
    page: 1,
    query: searchQuery.query,
    sort: searchQuery.sort,
  });

  const [userData, setUserData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
      const loadUser = async () => {
        setIsLoading(true);
        try {
          const data = await postUserArray("MasterKomponenAir/GetDataKomponenAir", {
            page: searchParams.page,
            query: searchParams.query,
            sort: searchParams.sort,
          });
          setUserData(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Gagal mengambil data:", error);
        } finally {
          setIsLoading(false);
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

  return (
    <>
      <InfoCard
        subtitle="Master"
        title={t("sensor_water")}
        showButton={true}
        labelButton={t("add")}
        onAddPress={() => navigation.navigate("KomponenAirAdd")}
        imageSource={KomponenAirPng}
        imageStyle={{ width: 180, height: 140 }}
      />

      <Text style={styles.sectionTitle}> {t("sensor_water_data")}</Text>

      {isLoading ? (
        <View style={{ marginTop: 30, alignItems: "center" }}>
          <ActivityIndicator size="large" color="#0973FF" />
          <Text style={{ marginTop: 10 }}>Memuat data...</Text>
        </View>
      ) : (
        <>
          <SensorList
            data={
              userData
                ? userData.map((item, index) => ({
                    icon: "💧",
                    name: item["Nomor Komponen"] || `Target ${index + 1}`,
                    value: item["Kondisi"] || "0",
                    onPress: () =>
                      navigation.navigate("KomponenAirDetail", {
                        id: item["Key"],
                        idcom: item["Nomor Komponen"],
                      }),
                  }))
                : []
            }
          />

          <Paging
            pageSize={PAGE_SIZE}
            pageCurrent={searchParams.page}
            totalData={userData && userData[0] && userData[0]["Count"] ? parseInt(userData[0]["Count"]) : 0}
            navigation={handleSetCurrentPage}
          />
        </>
      )}
    </>
  );
};

export default KomponenAirTab;
