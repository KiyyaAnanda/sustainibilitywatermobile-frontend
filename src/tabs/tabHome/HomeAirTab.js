// import React, { useState, useEffect, useRef } from "react";
// import { View, Text, FlatList, Dimensions, StyleSheet } from "react-native";
// import { postUser } from "../../services/apiService";

import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { postUser } from "../../services/apiService";
import { Picker } from "@react-native-picker/picker";

// const months = [
//   "JANUARI",
//   "FEBRUARI",
//   "MARET",
//   "APRIL",
//   "MEI",
//   "JUNI",
//   "JULI",
//   "AGUSTUS",
//   "SEPTEMBER",
//   "OKTOBER",
//   "NOVOMBER",
//   "DESEMBER",
// ];
// const SCREEN_WIDTH = Dimensions.get("window").width;
// const SIDE_MARGIN = 8;
// const CARD_WIDTH = SCREEN_WIDTH * 0.7;
// const CARD_MARGIN = 10;
// const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN * 2;
// const TOTAL_DUPLICATE = 10; // ulangi 10 kali untuk efek loop

// const CardPerMonth = ({
//   month,
//   ytdText,
//   waterConsumption,
//   konsumsiIndividu,
//   targetIndividu,
//   withdrawalAktual,
//   withdrawalTarget,
// }) => (
//   <View style={styles.card}>
//     <Text style={styles.header}>{month}</Text>
//     {ytdText && <Text style={styles.ytdLabel}>{`YTD ${ytdText}`}</Text>}
//     <View style={styles.row}>
//       <Text style={styles.label}>Water Consumption:</Text>
//       <Text>{`${waterConsumption} m³`}</Text>
//     </View>
//     <View style={styles.row}>
//       <Text style={styles.label}>WC/Individu (Aktual):</Text>
//       <Text>{`${konsumsiIndividu} m³`}</Text>
//     </View>
//     <View style={styles.row}>
//       <Text style={styles.label}>WC/Individu (Target):</Text>
//       <Text>{`${targetIndividu} m³`}</Text>
//     </View>
//     <View style={styles.row}>
//       <Text style={styles.label}>Reduction (%) (Aktual):</Text>
//       <Text>{`${withdrawalAktual}%`}</Text>
//     </View>
//     <View style={styles.row}>
//       <Text style={styles.label}>Reduction (%) (Target):</Text>
//       <Text>{`-${withdrawalTarget}%`}</Text>
//     </View>
//   </View>
// );

// export default function HomeTabAir() {
//   const dataWithYTD = [...months, "YTD"];
//   const loopedData = Array(TOTAL_DUPLICATE).fill(dataWithYTD).flat();
//   const middleIndex = Math.floor(loopedData.length / 2);

//   const flatListRef = useRef(null);
//   const timeoutRef = useRef(null);
//   const [activeIndex, setActiveIndex] = useState(middleIndex);

//   const currentYear = new Date().getFullYear();
//   const currentMonthIndex = new Date().getMonth();
//   const currentMonthName = months[currentMonthIndex];

//   const [monthlyConsumptionData, setMonthlyConsumptionData] = useState(
//     Array(12).fill(0)
//   );
//   const [aktualIndividuData, setAktualIndividuData] = useState([]);
//   const [targetData, setTargetData] = useState(Array(12).fill(0));
//   const [withdrawalReduction, setWithdrawalReduction] = useState([]);
//   const [targetReductionValue, setTargetReductionValue] = useState(0);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isError, setIsError] = useState(false);
//   //SETTING TOTAL YTD
//   useEffect(() => {
//     const fetchAll = async () => {
//       setIsLoading(true);
//       setIsError(false);
//       try {
//         const [a, b, c, d] = await Promise.all([
//           postUser("Dashboard/GetDataChartMonthly", { year: currentYear }),
//           postUser("Dashboard/GetDataAktualIndividu", { year: currentYear }),
//           postUser("Dashboard/GetDataTargetIndividu", { year: currentYear }),
//           postUser("Dashboard/GetTargetReduction", {}),
//         ]);

//         if (a !== "ERROR") {
//           const arr = Array(12).fill(0);
//           a.forEach((item) => (arr[item.Bulan - 1] = item.TotalKonsumsi));
//           setMonthlyConsumptionData(arr);
//         }

//         if (b !== "ERROR") setAktualIndividuData(b);

//         // if (c !== "ERROR" && c.length > 0) {
//         //   const targetValue = parseFloat(c[0].trg_target_bulanan_individu || 0);
//         //   const currentMonth = new Date().getMonth(); // 0 = Jan, 11 = Dec
//         //   const arr = Array(12).fill(0);

//         //   for (let i = 0; i <= currentMonth; i++) {
//         //     arr[i] = targetValue; // hanya isi sampai bulan saat ini
//         //   }

//         //   setTargetData(arr);
//         // }
//         if (c !== "ERROR" && c.length > 0) {
//           const targetValue = parseFloat(c[0].trg_target_bulanan_individu || 0);
//           const arr = Array(12).fill(targetValue); // isi semua bulan
//           setTargetData(arr);
//         }

//         if (d !== "ERROR" && d[0]) {
//           setTargetReductionValue(
//             parseFloat(d[0].trg_persentase_target_penghematan || 0)
//           );
//         }

//         const reduksi = Array(12)
//           .fill(0)
//           .map((_, i) => {
//             const target = c[i]?.trg_target_bulanan_individu || 0;
//             const aktual = b[i]?.TotalKonsumsi || 0;
//             if (target === 0 || aktual === 0) return 0;
//             return +(((aktual - target) / target) * 100).toFixed(2);
//           });
//         setWithdrawalReduction(reduksi);
//       } catch (err) {
//         console.error(err);
//         setIsError(true);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchAll();
//   }, []);

//   useEffect(() => {
//     if (flatListRef.current) {
//       setTimeout(() => {
//         flatListRef.current.scrollToIndex({
//           index: middleIndex,
//           animated: false,
//         });
//         setActiveIndex(middleIndex);
//       }, 100);
//     }
//   }, []);

//   useEffect(() => {
//     return () => {
//       if (timeoutRef.current) clearTimeout(timeoutRef.current);
//     };
//   }, []);

//   const handleScrollEnd = (event) => {
//     const offsetX = event.nativeEvent.contentOffset.x;
//     const index = Math.round(offsetX / SNAP_INTERVAL);
//     setActiveIndex(index);

//     // reset ke tengah jika dekat ujung
//     const edgeThreshold = dataWithYTD.length;
//     if (index <= edgeThreshold || index >= loopedData.length - edgeThreshold) {
//       if (flatListRef.current) {
//         flatListRef.current.scrollToIndex({
//           index: middleIndex,
//           animated: false,
//         });
//         setActiveIndex(middleIndex);
//       }
//     }

//     // Reset timer jika sebelumnya sudah ada
//     if (timeoutRef.current) clearTimeout(timeoutRef.current);

//     // Kembali ke YTD jika idle 10 detik
//     if (loopedData[index] !== "YTD") {
//       timeoutRef.current = setTimeout(() => {
//         const nearestYTD = loopedData.findIndex(
//           (item, i) => item === "YTD" && i >= middleIndex
//         );
//         if (flatListRef.current && nearestYTD >= 0) {
//           flatListRef.current.scrollToIndex({
//             index: nearestYTD,
//             animated: true,
//           });
//           setActiveIndex(nearestYTD);
//         }
//       }, 10000);
//     }
//   };

//   const renderItem = ({ item, index }) => {
//     const isYTD = item === "YTD";

//     // Index untuk data per bulan
//     const originalIndex = dataWithYTD.indexOf(item);
//     const dataIndex = isYTD ? currentMonthIndex : originalIndex;

//     // Data default
//     const water = isYTD
//       ? monthlyConsumptionData
//           .slice(0, currentMonthIndex + 1)
//           .reduce((a, b) => a + b, 0)
//       : monthlyConsumptionData[dataIndex] || 0;

//     const aktual = isYTD
//       ? aktualIndividuData
//           .slice(0, currentMonthIndex + 1)
//           .reduce((acc, curr) => acc + (curr.TotalKonsumsi || 0), 0)
//       : aktualIndividuData[dataIndex]?.TotalKonsumsi || 0;

//     const target = isYTD
//       ? targetData.slice(0, currentMonthIndex + 1).reduce((a, b) => a + b, 0)
//       : targetData[dataIndex] || 0;

//     const ytdReductionArray = withdrawalReduction.slice(
//       0,
//       currentMonthIndex + 1
//     );
//     const reduksi = isYTD
//       ? ytdReductionArray.reduce((a, b) => a + b, 0) / ytdReductionArray.length
//       : withdrawalReduction[dataIndex] || 0;

//     return (
//       <View style={{ width: CARD_WIDTH, marginHorizontal: CARD_MARGIN }}>
//         <CardPerMonth
//           month={item}
//           ytdText={isYTD ? `${currentMonthName} ${currentYear}` : null}
//           waterConsumption={parseFloat(water).toFixed(2)}
//           konsumsiIndividu={parseFloat(aktual).toFixed(2)}
//           targetIndividu={parseFloat(target).toFixed(2)}
//           withdrawalAktual={parseFloat(reduksi).toFixed(2)}
//           withdrawalTarget={targetReductionValue}
//         />
//       </View>
//     );
//   };
//   return (
//     <View style={styles.container}>
//       <Text style={styles.header2}>Progress Pencapaian Water Withdrawal</Text>
//       {isLoading ? (
//         <Text>Loading...</Text>
//       ) : isError ? (
//         <Text>Error fetching data</Text>
//       ) : (
//         <FlatList
//           ref={flatListRef}
//           horizontal
//           data={loopedData}
//           keyExtractor={(_, i) => i.toString()}
//           renderItem={renderItem}
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={{ paddingHorizontal: SIDE_MARGIN }}
//           getItemLayout={(_, i) => ({
//             length: SNAP_INTERVAL,
//             offset: SNAP_INTERVAL * i,
//             index: i,
//           })}
//           scrollEventThrottle={16}
//           pagingEnabled
//           snapToInterval={SNAP_INTERVAL}
//           decelerationRate="fast"
//           onMomentumScrollEnd={handleScrollEnd}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, paddingTop: 20 },
//   header2: {
//     fontSize: 18,
//     fontWeight: "600",
//     marginLeft: 16,
//     marginBottom: 12,
//   },
//   card: {
//     backgroundColor: "#fff",
//     padding: 16,
//     borderRadius: 8,
//     elevation: 2,
//   },
//   header: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
//   ytdLabel: {
//     fontSize: 12,
//     color: "#555",
//     marginBottom: 8,
//   },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginVertical: 4,
//   },
//   label: { fontWeight: "500" },
// });

// import React, { useRef, useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   StyleSheet,
//   Dimensions,
//   ScrollView,
//   ActivityIndicator,
//   TouchableOpacity,
// } from "react-native";
// import { LineChart } from "react-native-chart-kit";
// import { postUser } from "../../services/apiService";
// import { Picker } from "@react-native-picker/picker";

const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const SCREEN_WIDTH = Dimensions.get("window").width;
const SIDE_MARGIN = 8;
const CARD_WIDTH = SCREEN_WIDTH * 0.7;
const CARD_MARGIN = 10;
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN * 2;
const TOTAL_DUPLICATE = 10; // ulangi 10 kali untuk efek loop

const CardPerMonth = ({
  month,
  ytdText,
  waterConsumption,
  konsumsiIndividu,
  targetIndividu,
  withdrawalAktual,
  withdrawalTarget,
}) => {
  const { t } = useTranslation();
  return (
    <View style={styles.card}>
      {month !== "YTD" && <Text style={styles.header}>{month}</Text>}
      {ytdText && <Text style={styles.ytdLabel ?? styles.header}>{`${month}. ${ytdText} INDICATOR OVER / LOWER`}</Text>}
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
      {/* <View style={styles.row}>
        <Text style={styles.label}>{t("reduction_aktual")}</Text>
        <Text>{`${withdrawalAktual}%`}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t("reduction_target")}</Text>
        <Text>{`-${withdrawalTarget}%`}</Text>
      </View> */}
    </View>
  );
};

export default function HomeTabAir() {
  const { t } = useTranslation();
  const dataWithYTD = [...months, "YTD"];
  const loopedData = Array(TOTAL_DUPLICATE).fill(dataWithYTD).flat();
  const middleIndex = Math.floor(loopedData.length / 2);

  const flatListRef = useRef(null);
  const timeoutRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(middleIndex);

  const currentYear = new Date().getFullYear();
  const currentMonthIndex = new Date().getMonth();
  const currentMonthName = months[currentMonthIndex];

  const [monthlyConsumptionData, setMonthlyConsumptionData] = useState(Array(12).fill(0));
  const [aktualIndividuData, setAktualIndividuData] = useState([]);
  const [targetData, setTargetData] = useState(Array(12).fill(0));
  const [withdrawalReduction, setWithdrawalReduction] = useState([]);
  const [targetReductionValue, setTargetReductionValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  //SETTING TOTAL YTD

  useFocusEffect(
    useCallback(() => {
      const fetchAll = async () => {
        setIsLoading(true);
        setIsError(false);
        try {
          const [a, b, c, d] = await Promise.all([
            postUser("Dashboard/GetDataChartMonthly", { year: currentYear }),
            postUserArray("Dashboard/GetDataAktualIndividu", { year: currentYear }),
            postUser("Dashboard/GetDataTargetIndividu", { year: currentYear }),
            postUser("Dashboard/GetTargetReduction", {}),
          ]);

          // console.log("Type of c:", typeof c);
          // console.log("Is array:", Array.isArray(c));

          if (a !== "ERROR") {
            const arr = Array(12).fill(0);
            const parsedA = typeof a === "string" ? JSON.parse(a) : a;
            parsedA.forEach((item) => (arr[item.Bulan - 1] = item.TotalKonsumsi));
            setMonthlyConsumptionData(arr);
          }

          if (b !== "ERROR") setAktualIndividuData(b);
          if (c !== "ERROR" && c.length > 0) {
            const arr = Array(12).fill(0);
            const parsedC = typeof c === "string" ? JSON.parse(c) : c;
            parsedC.forEach((item) => {
              const bulanIndex = item.bulan - 1;
              arr[bulanIndex] = parseFloat(item.trg_target_bulanan_individu || 0);
            });
            setTargetData(arr);
          }

          if (d !== "ERROR" && d[0]) {
            setTargetReductionValue(parseFloat(d[0].trg_persentase_target_penghematan || 0));
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

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SNAP_INTERVAL);
    setActiveIndex(index);

    // reset ke tengah jika dekat ujung
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

    // Reset timer jika sebelumnya sudah ada
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Kembali ke YTD jika idle 10 detik
    if (loopedData[index] !== "YTD") {
      timeoutRef.current = setTimeout(() => {
        const nearestYTD = loopedData.findIndex((item, i) => item === "YTD" && i >= middleIndex);
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

    // Index untuk data per bulan
    const originalIndex = dataWithYTD.indexOf(item);
    const dataIndex = isYTD ? currentMonthIndex : originalIndex;

    // Data default
    const water = isYTD
      ? monthlyConsumptionData.slice(0, currentMonthIndex + 1).reduce((a, b) => a + b, 0)
      : monthlyConsumptionData[dataIndex] || 0;

    const aktual = isYTD
      ? aktualIndividuData.slice(0, currentMonthIndex + 1).reduce((acc, curr) => acc + (curr.TotalKonsumsi || 0), 0)
      : aktualIndividuData[dataIndex]?.TotalKonsumsi || 0;

    //DENGAN MEMBUAT
    // console.log("targetData: ", targetData);
    const target = isYTD
      ? targetData.slice(0, currentMonthIndex + 1).reduce((a, b) => a + b, 0)
      : targetData[dataIndex] || 0;

    const ytdReductionArray = withdrawalReduction.slice(0, currentMonthIndex + 1);
    const reduksi = isYTD
      ? ytdReductionArray.reduce((a, b) => a + b, 0) / ytdReductionArray.length
      : withdrawalReduction[dataIndex] || 0;

    return (
      <View style={{ width: CARD_WIDTH, marginHorizontal: CARD_MARGIN }}>
        <CardPerMonth
          month={item}
          ytdText={isYTD ? `${currentMonthName} ${currentYear}` : null}
          waterConsumption={parseFloat(water).toFixed(2)}
          konsumsiIndividu={parseFloat(aktual).toFixed(2)}
          targetIndividu={parseFloat(target).toFixed(2)}
          // withdrawalAktual={parseFloat(reduksi).toFixed(2)}
          // withdrawalTarget={targetReductionValue}
        />
      </View>
    );
  };

  // export default function HomeTabAir() {
  const [filterType, setFilterType] = useState("yearly");
  const [chartData, setChartData] = useState(new Array(12).fill(0));

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: "#1E90FF",
    },
  };

  // const chartLabels = {
  //   daily: Array.from({ length: 24 }, (_, i) => `${i + 1}`),
  //   weekly: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
  //   monthly: months,
  //   yearly: ["2025"],
  // };

  const [tooltipPos, setTooltipPos] = useState({
    x: 0,
    y: 0,
    visible: false,
    value: 0,
  });

  const [filterVolume, setFilterVolume] = useState("volume");
  //const [isLoading, setIsLoading] = useState(true);
  //const [isError, setIsError] = useState(false);
  const [topKomponenData, setTopKomponenData] = useState([]);
  //const currentYear = new Date().getFullYear();

  useFocusEffect(
    useCallback(() => {
      const fetchTopData = async () => {
        setIsLoading(true);
        // setIsError(false);
        try {
          let endpoint = "";
          let data;
          if (filterVolume === "volume") {
            endpoint = "Dashboard/GetTopKomponen";
          } else if (filterVolume === "lokasi") {
            endpoint = "Dashboard/GetTopLokasi";
          } else if (filterVolume === "tanggal") {
            endpoint = "Dashboard/GetTopTanggal";
          }

          const response = await postUser(`${endpoint}`, {
            year: currentYear,
          });

          console.log("Type of response:", typeof response);
          console.log("Is array:", Array.isArray(response));

          if (response === "ERROR") {
            setIsError(true);
          } else {
            if (typeof response === "string") {
              try {
                data = JSON.parse(response);
              } catch (parseError) {
                console.error("Error parsing data:", parseError);
                setIsError(true);
                return;
              }
            } else data = response;
            setTopKomponenData(data);
          }
        } catch (error) {
          setIsError(true);
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchTopData();
    }, [filterVolume])
  );
  const [chartLabels, setChartLabels] = useState({
    daily: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    weekly: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
    monthly: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
    yearly: [], // Akan diisi dinamis dari API
  });

  useFocusEffect(
    useCallback(() => {
      const fetchChartData = async () => {
        setIsLoading(true);
        // setIsError(false);
        try {
          let endpoint = "";
          console.log("filter type : ", filterType);
          if (filterType === "daily") {
            endpoint = "Dashboard/GetDataChartDaily";
          } else if (filterType === "weekly") {
            endpoint = "Dashboard/GetDataChartWeekly";
          } else if (filterType === "monthly") {
            endpoint = "Dashboard/GetDataChartMonthly";
          } else if (filterType === "yearly") {
            endpoint = "Dashboard/GetDataChartYearly";
          }

          const response = await postUser(endpoint, { year: currentYear });
          let data;
          // logging untuk liat tipe data.
          console.log("Data grafik: ", response);
          console.log("Filter Type:", filterType);
          console.log("Is Array:", Array.isArray(response));
          console.log("Type of Data:", typeof response);

          // parsing jika data merupakan JSON bukan array
          if (typeof response === "string") {
            try {
              data = JSON.parse(response);
            } catch (parseError) {
              console.error("Error parsing data:", parseError);
              setIsError(true);
              return;
            }
          } else data = response;

          if (response === "ERROR") {
            setIsError(true);
            return;
          }

          if (!Array.isArray(data)) {
            console.error("Data is not an array after parsing:", data);
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
              const index = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].indexOf(item.NamaHari);
              if (index >= 0) weeklyData[index] = item.TotalKonsumsi;
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
          console.error("Chart Fetch Error:", error);
          setIsError(true);
        } finally {
          setIsLoading(false);
        }
      };

      fetchChartData();
    }, [filterType])
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Text style={styles.header2}>{t("progress_title")}</Text>
        {/* {isLoading ? (
          <Text>Loading...</Text>
        ) : isError ? (
          <Text>Error fetching data</Text>
        ) : ( */}
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
      <View style={styles.graphSection}>
        <Text style={styles.header2}>{`${t("water_usage_chart")} (${filterType})`}</Text>
        <View style={styles.dropdownContainer}>
          <Text style={styles.label}>Pilih Tampilan Chart:</Text>
          <View style={styles.buttonRow}>
            {["yearly", "monthly", "weekly"].map((type) => (
              <Text
                key={type}
                style={[styles.filterButton, filterType === type && styles.activeButton]}
                onPress={() => setFilterType(type)}>
                {type}
              </Text>
            ))}
          </View>
        </View>
        {/* {isLoading ? ( */}
        {/* <ActivityIndicator size="large" color="#007bff" /> */}
        {/* ) : isError ? (
            <Text style={{ color: "red", marginTop: 10 }}>
              Gagal memuat data. Silakan coba lagi.
            </Text>
          ) : ( */}
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
                  setTimeout(() => {
                    setTooltipPos((prev) => ({ ...prev, visible: false }));
                  }, 1000);
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
                  }}>
                  <Text style={{ color: "white", fontSize: 12 }}>{tooltipPos.value} m³</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
        {/* )} */}
      </View>

      <View style={styles.container}>
        <Text style={styles.header2}>{t("top_Sensor_title")}</Text>
        <Text style={styles.label2}>{t("sort_by")}</Text>

        <View style={styles.segmentedContainer}>
          {["volume", "lokasi", "tanggal"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.segmentedButton, filterVolume === item && styles.segmentedButtonActive]}
              onPress={() => setFilterVolume(item)}>
              <Text style={[styles.segmentedButtonText, filterVolume === item && styles.segmentedButtonTextActive]}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {/* Header */}
            <View style={stylesTable.tableRowHeader}>
              <Text style={[stylesTable.cellHeader, { width: 50 }]}>No</Text>
              <Text style={[stylesTable.cellHeader, { width: 120 }]}>No Komponen</Text>
              <Text style={[stylesTable.cellHeader, { width: 150 }]}>Lokasi</Text>
              <Text style={[stylesTable.cellHeader, { width: 160 }]}>Total Volume Air</Text>
              <Text style={[stylesTable.cellHeader, { width: 200 }]}>Tanggal</Text>
            </View>

            {/* Body */}
            {topKomponenData.map((item, index) => (
              <View key={index} style={stylesTable.tableRow}>
                <Text style={[stylesTable.cell, { width: 50 }]}>{index + 1}</Text>
                <Text style={[stylesTable.cell, { width: 120 }]} numberOfLines={1} ellipsizeMode="tail">
                  {item.NoKomponen}
                </Text>
                <Text style={[stylesTable.cell, { width: 150 }]} numberOfLines={1} ellipsizeMode="tail">
                  {item.Lokasi || "-"}
                </Text>
                <Text style={[stylesTable.cell, { width: 160 }]}>{parseFloat(item.TotalVolumeAir).toFixed(2)}</Text>
                <Text style={[stylesTable.cell, { width: 200 }]} numberOfLines={1} ellipsizeMode="tail">
                  {new Date(item.Tanggal).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </>
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

  segmentedButtonActive: {
    backgroundColor: "#007bff",
  },

  segmentedButtonText: {
    color: "#007bff",
    fontWeight: "500",
  },

  segmentedButtonTextActive: {
    color: "#fff",
  },
  container: {
    padding: 16,
    backgroundColor: "#f8f9fa",
    flex: 1,
  },
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
  label2: {
    fontSize: 16,
    marginBottom: 8,
  },
  picker: {
    height: 50,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  error: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
  tableRowHeader: {
    flexDirection: "row",
    backgroundColor: "#007bff",
    padding: 8,
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 8,
    borderBottomWidth: 1,
    borderColor: "#dee2e6",
  },
  cellHeader: {
    fontWeight: "bold",
    color: "black",
    padding: 8,
    minWidth: 120,
    fontSize: 12,
    textAlign: "center",
  },
  cell: {
    padding: 8,
    minWidth: 120,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  tableRowHeader: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    borderBottomWidth: 2,
    borderBottomColor: "#aaa",
  },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    padding: 16,
    elevation: 4,
  },
  header: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontWeight: "500",
  },
  graphSection: {
    marginTop: 24,
    backgroundColor: "#fff",
    padding: 0,
    borderRadius: 12,
    elevation: 3,
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  dropdownContainer: {
    marginBottom: 16,
  },
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
  activeButton: {
    backgroundColor: "#007BFF",
    color: "white",
  },
  chart: {
    borderRadius: 12,
    fontSize: 1,
  },
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
  cell: {
    padding: 8,
    textAlign: "center",
  },
});
