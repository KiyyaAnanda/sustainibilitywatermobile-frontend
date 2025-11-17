import React, { useState, useRef, useEffect } from "react";
import LottieView from "lottie-react-native";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  registerCallableModule,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import DropDown from "../../../components/DropDown";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import DropDownForm from "../../../components/DropDownForm";
import FormLayout from "../../../components/FormLayout";
import { stylesB, stylesDetail } from "../../../styles/globalStyles";
import { postUser, postUserArray } from "../../../services/apiService";
import TextView from "../../../components/TextView";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { RollInRight } from "react-native-reanimated";
import { formatDateOnly } from "../../../Util/Formatting";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
const EvaluasiTargetDetail = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const route = useRoute();
  const { id } = route.params || {};
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const formDataRef = useRef({
    jumlahIndividu: "",
    targetBulananIndividu: "",
    persentaseTargetPenghematan: "",
    tanggalMulaiBerlaku: "",
  });

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setIsError({ error: false, message: "" });
        try {
          setIsLoading(true);
          const data = await postUserArray(
            "MasterEvaluasiTarget/DetailEvaluasiTarget",
            { id: id }
          );

          if (data === "ERROR" || !data || data.length === 0) {
            throw new Error("Gagal mengambil data target.");
          }

          formDataRef.current = { ...formDataRef.current, ...data[0] };
          // Jika ingin memicu render ulang, bisa juga gunakan useState
        } catch (error) {
          setIsError({ error: true, message: error.message });
        } finally {
          setIsLoading(false);
        }
      };

      if (id) {
        fetchData();
      } else {
        setIsError({
          error: true,
          message: "ID tidak ditemukan di route params.",
        });
        setIsLoading(false);
      }
    }, [id])
  );

  // Gunakan isLoading dan isError untuk mengontrol tampilan
  if (isLoading) {
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

  if (isError.error) {
    return <Text>Error: {isError.message}</Text>;
  }

  return (
    <FormLayout
      source={require("../../../assets/picturePng/mahasiwa1TA.png")}
      image={{ height: 450, position: "absolute", top: 50, left: 0, zIndex: 0 }}
      upperLabel={t("target_evaluation_details")}
      lowerLabel={t("target_evaluation_introduction")}
    >
      <View style={stylesDetail.formContainer}>
        <Text style={stylesB.title}>{t("target_evaluation_details")}</Text>

        <View style={stylesDetail.rectangle}>
          <Button
            iconName="edit"
            style={{
              backgroundColor: "#fff",
              bottom: 179,
              left: 141,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 20,
              borderBottomLeftRadius: 15,
              borderBottomRightRadius: 0,
              justifyContent: "center",
              alignItems: "center",
              width: 60,
              height: 40,
              borderWidth: 2,
              borderColor: "#0971FB",
            }}
            iconColor={{ color: "#0971FB", fontWeight: "bold" }}
            onPress={() => navigation.navigate("EvaluasiTargetEdit", { id })}
          />
          <View style={stylesDetail.containerValue}>
            <TextView
              title={t("number_of_individuals")}
              data={formDataRef.current.jumlahIndividu}
            />
            <TextView
              title={t("montyly_target_individuals_details")}
              data={formDataRef.current.targetBulananIndividu + "m³"}
            />
            <TextView
              title={t("month_and_year")}
              data={formatDateOnly(formDataRef.current.tanggalMulaiBerlaku)}
            />
            <TextView
              title={t("persentage_of_savings_target_details")}
              data={formDataRef.current.persentaseTargetPenghematan + "%"}
            />
          </View>

          <Image
            source={require("../../../assets/picturePng/Town.png")}
            style={{
              position: "absolute",
              top: 97,
              left: 95,
              zIndex: 0,
              height: 400,
              width: 250,
              resizeMode: "contain",
            }}
          />
        </View>
      </View>
    </FormLayout>
  );
};

export default EvaluasiTargetDetail;
