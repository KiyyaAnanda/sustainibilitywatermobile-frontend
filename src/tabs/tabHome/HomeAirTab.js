import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { postUser, postUserArray } from "../../services/apiService";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];
const SCREEN_WIDTH = Dimensions.get("window").width;
const SIDE_MARGIN = 8;
const CARD_WIDTH = SCREEN_WIDTH * 0.7;
const CARD_MARGIN = 10;
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN * 2;
const TOTAL_DUPLICATE = 10;
const HARGA_PER_M3 = 6500;

const CardPerMonth = ({
  month,
  ytdText,
  waterConsumption,
  konsumsiIndividu,
  targetIndividu,
}) => {
  const { t } = useTranslation();
  return (
    <View style={styles.card}>
      {month !== "YTD" && <Text style={styles.header}>{month}</Text>}
      {ytdText && (
        <Text style={styles.ytdLabel ?? styles.header}>
          {`${month}. ${ytdText} INDICATOR OVER / LOWER`}
        </Text>
      )}
      <View style={styles.row}>
        <Text style={styles.label}>{t("water_consumption")}</Text>
        <Text>{`${waterConsumption} L`}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t("wc_aktual")}</Text>
        <Text>{`${konsumsiIndividu} m³`}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t("wc_target")}</Text>
        <Text>{`${targetIndividu} m³`}</Text>
      </View>
    </View>
  );
};

export default function HomeTabAir() {
  const { t } = useTranslation();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedComparison, setSelectedComparison] = useState(null);

  // detail kalau di hold
  const handleShowDetail = (currMonth, prevMonth, currVal, prevVal, type) => {
    const diff = currVal - prevVal;
    if (!prevMonth) return;

    setSelectedComparison({
      currMonth,
      prevMonth,
      currVal,
      prevVal,
      diff,
      type,
    });
    setModalVisible(true);
  };

  const dataWithYTD = [...months, "YTD"];
  const loopedData = Array(TOTAL_DUPLICATE).fill(dataWithYTD).flat();
  const middleIndex = Math.floor(loopedData.length / 2);

  const flatListRef = useRef(null);
  const timeoutRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(middleIndex);

  const currentYear = new Date().getFullYear();
  const currentMonthIndex = new Date().getMonth();
  const currentMonthName = months[currentMonthIndex];

  const [monthlyConsumptionData, setMonthlyConsumptionData] = useState(
    Array(12).fill(0)
  );
  const [aktualIndividuData, setAktualIndividuData] = useState([]);
  const [targetData, setTargetData] = useState(Array(12).fill(0));
  const [withdrawalReduction, setWithdrawalReduction] = useState([]);
  const [targetReductionValue, setTargetReductionValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  const [aiRecommendation, setAiRecommendation] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchAll = async () => {
        setIsLoading(true);
        setIsError(false);
        try {
          const [a, b, c, d] = await Promise.all([
            postUserArray("Dashboard/GetDataChartMonthly", {
              year: currentYear,
            }),
            postUserArray("Dashboard/GetDataAktualIndividu", {
              year: currentYear,
            }),
            postUserArray("Dashboard/GetDataTargetIndividu", {
              year: currentYear,
            }),
            postUserArray("Dashboard/GetTargetReduction", {}),
          ]);

          if (a !== "ERROR") {
            const arr = Array(12).fill(0);
            const parsedA = typeof a === "string" ? JSON.parse(a) : a;
            parsedA.forEach(
              (item) => (arr[item.Bulan - 1] = item.TotalKonsumsi)
            );
            setMonthlyConsumptionData(arr);
          }

          if (b !== "ERROR") setAktualIndividuData(b);
          if (c !== "ERROR" && c.length > 0) {
            const arr = Array(12).fill(0);
            const parsedC = typeof c === "string" ? JSON.parse(c) : c;
            parsedC.forEach((item) => {
              const bulanIndex = item.bulan - 1;
              arr[bulanIndex] = parseFloat(
                item.trg_target_bulanan_individu || 0
              );
            });
            setTargetData(arr);
          }

          if (d !== "ERROR" && d[0]) {
            setTargetReductionValue(
              parseFloat(d[0].trg_persentase_target_penghematan || 0)
            );
          }

          const reduksi = Array(12)
            .fill(0)
            .map((_, i) => {
              const target = c[i]?.trg_target_bulanan_individu || 0;
              const aktual = b[i]?.TotalKonsumsi || 0;
              if (target === 0 || aktual === 0) return 0;
              return +(((aktual - target) / target) * 100).toFixed(2);
            });
          setWithdrawalReduction(reduksi);
        } catch (err) {
          console.error(err);
          setIsError(true);
        } finally {
          setIsLoading(false);
        }
      };

      fetchAll();
    }, [])
  );

  useEffect(() => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToIndex({
          index: middleIndex,
          animated: false,
        });
        setActiveIndex(middleIndex);
      }, 100);
    }
  }, []);

  const handleScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SNAP_INTERVAL);
    setActiveIndex(index);

    const edgeThreshold = dataWithYTD.length;
    if (index <= edgeThreshold || index >= loopedData.length - edgeThreshold) {
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: middleIndex,
          animated: false,
        });
        setActiveIndex(middleIndex);
      }
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (loopedData[index] !== "YTD") {
      timeoutRef.current = setTimeout(() => {
        const nearestYTD = loopedData.findIndex(
          (item, i) => item === "YTD" && i >= middleIndex
        );
        if (flatListRef.current && nearestYTD >= 0) {
          flatListRef.current.scrollToIndex({
            index: nearestYTD,
            animated: true,
          });
          setActiveIndex(nearestYTD);
        }
      }, 10000);
    }
  };

  const renderItem = ({ item, index }) => {
    const isYTD = item === "YTD";
    const originalIndex = dataWithYTD.indexOf(item);
    const dataIndex = isYTD ? currentMonthIndex : originalIndex;

    const water = isYTD
      ? monthlyConsumptionData
          .slice(0, currentMonthIndex + 1)
          .reduce((a, b) => a + b, 0)
      : monthlyConsumptionData[dataIndex] || 0;

    const aktual = isYTD
      ? aktualIndividuData
          .slice(0, currentMonthIndex + 1)
          .reduce((acc, curr) => acc + (curr.TotalKonsumsi || 0), 0)
      : aktualIndividuData[dataIndex]?.TotalKonsumsi || 0;

    const target = isYTD
      ? targetData.slice(0, currentMonthIndex + 1).reduce((a, b) => a + b, 0)
      : targetData[dataIndex] || 0;

    return (
      <View style={{ width: CARD_WIDTH, marginHorizontal: CARD_MARGIN }}>
        <CardPerMonth
          month={item}
          ytdText={isYTD ? `${currentMonthName} ${currentYear}` : null}
          waterConsumption={parseFloat(water).toFixed(2)}
          konsumsiIndividu={parseFloat(aktual).toFixed(2)}
          targetIndividu={parseFloat(target).toFixed(2)}
        />
      </View>
    );
  };

  const [filterType, setFilterType] = useState("yearly");
  const [chartData, setChartData] = useState(new Array(12).fill(0));
  const [chartLabels, setChartLabels] = useState({
    daily: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    weekly: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
    monthly: months,
    yearly: [],
  });
  const [tooltipPos, setTooltipPos] = useState({
    x: 0,
    y: 0,
    visible: false,
    value: 0,
  });
  const [filterVolume, setFilterVolume] = useState("volume");
  const [topKomponenData, setTopKomponenData] = useState([]);

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    propsForDots: { r: "5", strokeWidth: "2", stroke: "#1E90FF" },
  };

  useFocusEffect(
    useCallback(() => {
      const fetchTopData = async () => {
        setIsLoading(true);
        try {
          let endpoint = "";
          if (filterVolume === "volume") endpoint = "Dashboard/GetTopKomponen";
          else if (filterVolume === "lokasi")
            endpoint = "Dashboard/GetTopLokasi";
          else if (filterVolume === "tanggal")
            endpoint = "Dashboard/GetTopTanggal";

          const response = await postUser(`${endpoint}`, { year: currentYear });
          let data;
          if (response !== "ERROR") {
            data =
              typeof response === "string" ? JSON.parse(response) : response;
            setTopKomponenData(data);
          } else {
            setIsError(true);
          }
        } catch (error) {
          setIsError(true);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTopData();
    }, [filterVolume])
  );

  useFocusEffect(
    useCallback(() => {
      const fetchChartData = async () => {
        setIsLoading(true);
        try {
          let endpoint = "";
          if (filterType === "daily") endpoint = "Dashboard/GetDataChartDaily";
          else if (filterType === "weekly")
            endpoint = "Dashboard/GetDataChartWeekly";
          else if (filterType === "monthly")
            endpoint = "Dashboard/GetDataChartMonthly";
          else if (filterType === "yearly")
            endpoint = "Dashboard/GetDataChartYearly";

          const response = await postUser(endpoint, { year: currentYear });
          let data;
          if (typeof response === "string") {
            try {
              data = JSON.parse(response);
            } catch (e) {
              return;
            }
          } else data = response;

          if (response === "ERROR" || !Array.isArray(data)) {
            setIsError(true);
            return;
          }

          if (filterType === "daily") {
            const dailyData = new Array(24).fill(0);
            data.forEach((item) => {
              const hour = new Date(item.Waktu).getHours();
              dailyData[hour] += item.Volume;
            });
            setChartData(dailyData);
          } else if (filterType === "weekly") {
            const weeklyData = new Array(7).fill(0);
            data.forEach((item) => {
              const idx = [
                "Senin",
                "Selasa",
                "Rabu",
                "Kamis",
                "Jumat",
                "Sabtu",
                "Minggu",
              ].indexOf(item.NamaHari);
              if (idx >= 0) weeklyData[idx] = item.TotalKonsumsi;
            });
            setChartData(weeklyData);
          } else if (filterType === "monthly") {
            const monthlyData = new Array(12).fill(0);
            data.forEach((item) => {
              monthlyData[item.Bulan - 1] = item.TotalKonsumsi;
            });
            setChartData(monthlyData);
          } else if (filterType === "yearly") {
            const yearlyLabels = data.map((item) => item.Tahun.toString());
            const yearlyData = data.map((item) => item.TotalKonsumsi);
            setChartLabels((prev) => ({ ...prev, yearly: yearlyLabels }));
            setChartData(yearlyData);
          }
        } catch (error) {
          setIsError(true);
        } finally {
          setIsLoading(false);
        }
      };
      fetchChartData();
    }, [filterType])
  );

  const getAiRecommendation = useCallback(async () => {
    const hasMonthlyData = monthlyConsumptionData.some((val) => val > 0);
    const hasTopData = topKomponenData.length > 0;

    if (!hasMonthlyData || !hasTopData || isAiLoading) return;

    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const todayDateStr = `${day}-${month}-${year}`;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const STORAGE_KEY_DATE = "ai_last_run_date";
    const STORAGE_KEY_DATA = "ai_cached_data";

    try {
      const cachedData = await AsyncStorage.getItem(STORAGE_KEY_DATA);
      if (cachedData) setAiRecommendation(cachedData);
      const lastRunDate = await AsyncStorage.getItem(STORAGE_KEY_DATE);
      const TARGET_HOUR = 7;
      const TARGET_MINUTE = 30;
      const isTooEarly =
        currentHour < TARGET_HOUR ||
        (currentHour === TARGET_HOUR && currentMinute < TARGET_MINUTE);

      if (isTooEarly) return;
      if (lastRunDate === todayDateStr && cachedData) return;
    } catch (e) {
      console.error(e);
    }

    setIsAiLoading(true);
    setAiRecommendation("");

    const dataLaporanTop = topKomponenData
      .slice(0, 10)
      .map(
        (item, index) =>
          `${index + 1}. Komponen: ${item.NoKomponen}, Lokasi: ${
            item.Lokasi
          }, Total Volume:${item.TotalVolumeAir.toFixed(
            2
          )} m³, Tanggal: ${new Date(item.Tanggal).toLocaleDateString("id-ID")}`
      )
      .join("\n");

    const dataLaporanBulanan = monthlyConsumptionData
      .map((total, index) => {
        if (total === 0) return null;
        const bulanLalu = index > 0 ? monthlyConsumptionData[index - 1] : 0;
        const selisih = total - bulanLalu;
        return `${months[index]}: ${total.toFixed(
          2
        )} m³ (Perubahan: ${selisih.toFixed(2)} m³ dari bulan lalu)`;
      })
      .filter(Boolean)
      .join("\n");

    const prompt = `Anda adalah asisten ahli analisis data konsumsi air.\nData Laporan Konsumsi Bulanan (Total):\n${dataLaporanBulanan}\nData Top 10 Konsumen Teratas (berdasarkan filter: ${filterVolume}):\n${dataLaporanTop}\nTugas:\n1. Berikan analisis singkat dari data di atas.\n2. Fokus pada lonjakan terbesar dan konsumen teratas.\n3. Berikan 3-5 langkah rekomendasi praktis.`;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setAiRecommendation(text);
      await AsyncStorage.setItem(STORAGE_KEY_DATE, todayDateStr);
      await AsyncStorage.setItem(STORAGE_KEY_DATA, text);
    } catch (error) {
      if (!aiRecommendation)
        setAiRecommendation("Gagal mendapatkan rekomendasi.");
    } finally {
      setIsAiLoading(false);
    }
  }, [monthlyConsumptionData, topKomponenData, filterVolume]);

  useEffect(() => {
    getAiRecommendation();
  }, [getAiRecommendation]);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* ringkasan bulanan/card */}
      <View style={styles.container}>
        <Text style={styles.header2}>{t("progress_title")}</Text>
        <FlatList
          ref={flatListRef}
          horizontal
          data={loopedData}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SIDE_MARGIN }}
          getItemLayout={(_, i) => ({
            length: SNAP_INTERVAL,
            offset: SNAP_INTERVAL * i,
            index: i,
          })}
          scrollEventThrottle={16}
          pagingEnabled
          snapToInterval={SNAP_INTERVAL}
          decelerationRate="fast"
          onMomentumScrollEnd={handleScrollEnd}
        />
      </View>

      {/* chart/grafik */}
      <View style={styles.graphSection}>
        <Text style={styles.header2}>{`${t(
          "water_usage_chart"
        )} (${filterType})`}</Text>
        <View style={styles.dropdownContainer}>
          <Text style={styles.label}>Pilih Tampilan Chart:</Text>
          <View style={styles.buttonRow}>
            {["yearly", "monthly", "weekly", "daily"].map((type) => (
              <Text
                key={type}
                style={[
                  styles.filterButton,
                  filterType === type && styles.activeButton,
                ]}
                onPress={() => setFilterType(type)}
              >
                {type}
              </Text>
            ))}
          </View>
        </View>
        <View style={{ flexDirection: "row" }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <LineChart
                data={{
                  labels: chartLabels[filterType],
                  datasets: [{ data: chartData }],
                }}
                width={Dimensions.get("window").width * 2}
                height={300}
                chartConfig={chartConfig}
                bezier
                onDataPointClick={({ value, x, y }) => {
                  setTooltipPos({ x, y, value, visible: true });
                  setTimeout(
                    () =>
                      setTooltipPos((prev) => ({ ...prev, visible: false })),
                    1000
                  );
                }}
                style={styles.chart}
              />
              {tooltipPos.visible && (
                <View
                  style={{
                    position: "absolute",
                    left: tooltipPos.x + 10,
                    top: tooltipPos.y - 10,
                    backgroundColor: "rgba(0,0,0,0.7)",
                    padding: 6,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: "white", fontSize: 12 }}>
                    {tooltipPos.value} m³
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* top sensor */}
      <View style={styles.container}>
        <Text style={styles.header2}>{t("top_Sensor_title")}</Text>
        <Text style={styles.label2}>{t("sort_by")}</Text>
        <View style={styles.segmentedContainer}>
          {["volume", "lokasi", "tanggal"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.segmentedButton,
                filterVolume === item && styles.segmentedButtonActive,
              ]}
              onPress={() => setFilterVolume(item)}
            >
              <Text
                style={[
                  styles.segmentedButtonText,
                  filterVolume === item && styles.segmentedButtonTextActive,
                ]}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* --- tabel top sensor --- */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled={true}>
        <View>
          {/* sama kaya laporan bulanan */}
          <View style={stylesTable.tableRowHeader}>
            <Text style={[stylesTable.cellHeader, { width: 50 }]}>No</Text>
            <Text style={[stylesTable.cellHeader, { width: 120 }]}>No Komponen</Text>
            <Text style={[stylesTable.cellHeader, { width: 150 }]}>Lokasi</Text>
            <Text style={[stylesTable.cellHeader, { width: 160 }]}>Total Volume Air</Text>
            <Text style={[stylesTable.cellHeader, { width: 200 }]}>Tanggal</Text>
            <Text style={[stylesTable.cellHeader, { width: 150 }]}>Perkiraan Biaya</Text>
          </View>

          {/* sama kaya laporan bulanan */}
          <ScrollView style={{ maxHeight: 300 }} nestedScrollEnabled={true}>
            {topKomponenData.map((item, index) => {
              const perkiraanBiaya = parseFloat(item.TotalVolumeAir) * HARGA_PER_M3;
              return (
                <View key={index} style={stylesTable.tableRow}>
                  <Text style={[stylesTable.cell, { width: 50 }]}>{index + 1}</Text>
                  <Text style={[stylesTable.cell, { width: 120 }]} numberOfLines={1}>{item.NoKomponen}</Text>
                  <Text style={[stylesTable.cell, { width: 150 }]} numberOfLines={1}>{item.Lokasi || "-"}</Text>
                  <Text style={[stylesTable.cell, { width: 160 }]}>{parseFloat(item.TotalVolumeAir).toFixed(2)}</Text>
                  <Text style={[stylesTable.cell, { width: 200 }]} numberOfLines={1}>
                    {new Date(item.Tanggal).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </Text>
                  <Text style={[stylesTable.cell, { width: 150 }]}>{`Rp ${perkiraanBiaya.toLocaleString("id-ID")}`}</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>

      {/* --- tabel laporan bulanan --- */}
      <View style={styles.container}>
        <Text style={styles.header2}>{t("Laporan Konsumsi & Biaya Bulanan")}</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled={true}>
          <View>
            {/* header tetap */}
            <View style={stylesTable.tableRowHeader}>
              <Text style={[stylesTable.cellHeader, { width: 100 }]}>Bulan</Text>
              <Text style={[stylesTable.cellHeader, { width: 150 }]}>Total Konsumsi (m³)</Text>
              <Text style={[stylesTable.cellHeader, { width: 170 }]}>Perkiraan Biaya</Text>
              <Text style={[stylesTable.cellHeader, { width: 170 }]}>Perbandingan Volume</Text>
              <Text style={[stylesTable.cellHeader, { width: 170 }]}>Perbandingan Biaya</Text>
            </View>

            {/* body scroll */}
            <ScrollView style={{ maxHeight: 300 }} nestedScrollEnabled={true}>
              {monthlyConsumptionData.map((totalKonsumsi, index) => {
                if (totalKonsumsi === 0 && index > currentMonthIndex) return null;

                const bulanIni = months[index];
                const bulanLaluName = index > 0 ? months[index - 1] : "-";
                const biaya = totalKonsumsi * HARGA_PER_M3;
                const konsumsiBulanLalu = index > 0 ? monthlyConsumptionData[index - 1] : 0;
                const biayaBulanLalu = konsumsiBulanLalu * HARGA_PER_M3;
                const perbandinganVolume = totalKonsumsi - konsumsiBulanLalu;
                const perbandinganBiaya = biaya - biayaBulanLalu;

                const isVolumeNaik = perbandinganVolume > 0;
                const colorVolume = isVolumeNaik ? "#d9534f" : "#28a745";
                const isBiayaNaik = perbandinganBiaya > 0;
                const colorBiaya = isBiayaNaik ? "#d9534f" : "#28a745";

                return (
                  <View key={index} style={stylesTable.tableRow}>
                    <Text style={[stylesTable.cell, { width: 100 }]}>{months[index]}</Text>
                    <Text style={[stylesTable.cell, { width: 150 }]}>{totalKonsumsi.toFixed(2)}</Text>
                    <Text style={[stylesTable.cell, { width: 170 }]}>{`Rp ${biaya.toLocaleString("id-ID")}`}</Text>

                    {/* perbandingan Volume */}
                    <TouchableOpacity
                      style={[stylesTable.cell, { width: 170, justifyContent: "center", alignItems: "center" }]}
                      onLongPress={() => handleShowDetail(bulanIni, bulanLaluName, totalKonsumsi, konsumsiBulanLalu, "Volume")}
                      delayLongPress={500}
                    >
                      {index === 0 ? <Text>-</Text> : perbandinganVolume === 0 ? <Text style={{ color: "gray" }}>-</Text> : (
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <MaterialIcons name={isVolumeNaik ? "arrow-drop-up" : "arrow-drop-down"} size={24} color={colorVolume} />
                          <Text style={{ color: colorVolume, fontWeight: "bold" }}>{Math.abs(perbandinganVolume).toFixed(2)}</Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* perbandingan Biaya */}
                    <TouchableOpacity
                      style={[stylesTable.cell, { width: 170, justifyContent: "center", alignItems: "center" }]}
                      onLongPress={() => handleShowDetail(bulanIni, bulanLaluName, biaya, biayaBulanLalu, "Biaya")}
                      delayLongPress={500}
                    >
                      {index === 0 ? <Text>-</Text> : perbandinganBiaya === 0 ? <Text style={{ color: "gray" }}>-</Text> : (
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <MaterialIcons name={isBiayaNaik ? "arrow-drop-up" : "arrow-drop-down"} size={24} color={colorBiaya} />
                          <Text style={{ color: colorBiaya, fontWeight: "bold" }}>{`Rp ${Math.abs(perbandinganBiaya).toLocaleString("id-ID")}`}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      {/* ai recommendation */}
      <View style={styles.container}>
        <Text style={styles.header2}>Rekomendasi AI</Text>
        {isAiLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>
              Sedang memproses rekomendasi...
            </Text>
          </View>
        )}
        {!isAiLoading && aiRecommendation && (
          <View style={styles.aiResultContainer}>
            <Text style={styles.aiResultText}>{aiRecommendation}</Text>
          </View>
        )}
        {!isAiLoading && !aiRecommendation && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              Rekomendasi akan muncul di sini setelah data dimuat.
            </Text>
          </View>
        )}
      </View>

      {/* modal detail */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detail Perbandingan</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {selectedComparison && (
              <View style={styles.modalBody}>
                <Text style={styles.modalText}>
                  Jenis Data:{" "}
                  <Text style={{ fontWeight: "bold" }}>
                    {selectedComparison.type}
                  </Text>
                </Text>
                <View style={styles.comparisonBox}>
                  <View style={styles.comparisonRow}>
                    <Text style={styles.compLabel}>
                      Bulan Ini ({selectedComparison.currMonth}):
                    </Text>
                    <Text style={styles.compValue}>
                      {selectedComparison.type === "Biaya" ? "Rp " : ""}
                      {selectedComparison.currVal.toLocaleString("id-ID")}
                      {selectedComparison.type === "Volume" ? " m³" : ""}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.comparisonRow,
                      {
                        borderBottomWidth: 1,
                        borderColor: "#ccc",
                        paddingBottom: 5,
                        marginBottom: 5,
                      },
                    ]}
                  >
                    <Text style={styles.compLabel}>
                      Bulan Lalu ({selectedComparison.prevMonth}):
                    </Text>
                    <Text style={styles.compValue}>
                      {selectedComparison.type === "Biaya" ? "Rp " : ""}
                      {selectedComparison.prevVal.toLocaleString("id-ID")}
                      {selectedComparison.type === "Volume" ? " m³" : ""}
                    </Text>
                  </View>
                  <View style={styles.comparisonRow}>
                    <Text style={[styles.compLabel, { fontWeight: "bold" }]}>
                      Selisih / Perubahan:
                    </Text>
                    <Text
                      style={[
                        styles.compValue,
                        {
                          fontWeight: "bold",
                          color:
                            selectedComparison.diff > 0 ? "#d9534f" : "#28a745",
                        },
                      ]}
                    >
                      {selectedComparison.diff > 0 ? "+" : ""}
                      {selectedComparison.type === "Biaya" ? "Rp " : ""}
                      {selectedComparison.diff.toLocaleString("id-ID")}
                      {selectedComparison.type === "Volume" ? " m³" : ""}
                    </Text>
                  </View>
                </View>
                <Text style={styles.infoNote}>
                  *Angka berwarna{" "}
                  <Text style={{ color: "#d9534f", fontWeight: "bold" }}>
                    Merah
                  </Text>{" "}
                  menandakan kenaikan konsumsi/biaya dibandingkan bulan
                  sebelumnya (Indikasi Boros).
                </Text>
                <Text style={styles.infoNote}>
                  *Angka berwarna{" "}
                  <Text style={{ color: "#28a745", fontWeight: "bold" }}>
                    Hijau
                  </Text>{" "}
                  menandakan penurunan konsumsi/biaya dibandingkan bulan
                  sebelumnya (Indikasi Hemat).
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  segmentedContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
    gap: 10,
  },
  segmentedButton: {
    borderWidth: 1,
    borderColor: "#007bff",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  segmentedButtonActive: { backgroundColor: "#007bff" },
  segmentedButtonText: { color: "#007bff", fontWeight: "500" },
  segmentedButtonTextActive: { color: "#fff" },
  container: { padding: 16, backgroundColor: "#f8f9fa", flex: 1 },
  header2: {
    fontSize: 20,
    fontWeight: "bold",
    backgroundColor: "#007bff",
    color: "white",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    textAlign: "center",
  },
  label2: { fontSize: 16, marginBottom: 8 },
  error: { color: "red", fontSize: 16, textAlign: "center" },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    padding: 16,
    elevation: 4,
  },
  header: { fontWeight: "bold", fontSize: 16, marginBottom: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: { fontWeight: "500" },
  graphSection: {
    marginTop: 24,
    backgroundColor: "#fff",
    padding: 0,
    borderRadius: 12,
    elevation: 3,
  },
  dropdownContainer: { marginBottom: 16 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#007BFF",
    borderRadius: 6,
    color: "#007BFF",
  },
  activeButton: { backgroundColor: "#007BFF", color: "white" },
  chart: { borderRadius: 12, fontSize: 1 },
  aiResultContainer: {
    backgroundColor: "#e9f7ff",
    borderLeftWidth: 5,
    borderLeftColor: "#007bff",
    padding: 15,
    marginTop: 10,
    borderRadius: 5,
  },
  aiResultText: { fontSize: 15, lineHeight: 22, color: "#333" },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    minHeight: 100,
  },
  loadingText: { marginTop: 10, color: "#666", fontStyle: "italic" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#007bff" },
  modalBody: { gap: 10 },
  modalText: { fontSize: 16, marginBottom: 5 },
  comparisonBox: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  comparisonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  compLabel: { color: "#555", flex: 1 },
  compValue: { fontWeight: "500", color: "#000" },
  infoNote: { fontSize: 12, color: "#666", fontStyle: "italic", marginTop: 5 },
});

const stylesTable = StyleSheet.create({
  tableRowHeader: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    borderBottomWidth: 2,
    borderBottomColor: "#aaa",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  cellHeader: {
    fontWeight: "bold",
    padding: 8,
    textAlign: "center",
    backgroundColor: "#eaeaea",
  },
  cell: { padding: 8, textAlign: "center" },
});
