import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import M2kiri from "../../../assets/picturePng/M2TKF.png";
import M3kanan from "../../../assets/picturePng/mahasiswa3kanan.png";
import M4TB from "../../../assets/picturePng/mahasiswa4TB.png";
import M1TA from "../../../assets/picturePng/mahasiwa1TA.png";

const { width, height } = Dimensions.get("window");

const PlaceHolderSSnextFirst = () => {
  const [showSecondImage, setShowSecondImage] = useState(false);
  const [showThirdImage, setShowThirdImage] = useState(true);
  const [showFinalButton, setShowFinalButton] = useState(false); // Animasi untuk gambar pertama
  const [currentStep, setCurrentStep] = useState(0); // 0: first, 1: second, 2: third
  const slideAnimKiri = useRef(new Animated.Value(100)).current;
  const opacityKiri = useRef(new Animated.Value(0)).current;
  const slideAnimKanan = useRef(new Animated.Value(100)).current;
  const opacityKanan = useRef(new Animated.Value(0)).current;

  const slideAnimM2kiri = useRef(new Animated.Value(100)).current;
  const opacityM2kiri = useRef(new Animated.Value(0)).current;
  // Animasi untuk gambar kedua (M4TB)
  const slideAnimM4TB = useRef(new Animated.Value(100)).current;
  const opacityM4TB = useRef(new Animated.Value(0)).current;

  const slideCurvedRectangle = useRef(new Animated.Value(height)).current;
  const animations = useRef([]); // simpan semua animasi
  const isMounted = useRef(true);

  const navigation = useNavigation();
  useEffect(() => {
    Animated.timing(slideCurvedRectangle, {
      toValue: 0, // Bergerak ke posisi normal
      duration: 800,
      useNativeDriver: true,
    }).start();
  });
  useEffect(() => {
    const timer = setTimeout(() => {
      // Gambar awal masuk setelah delay 1 detik
      setCurrentStep(1); // 👈 pindah step
      Animated.stagger(200, [
        Animated.parallel([
          Animated.timing(slideAnimKiri, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacityKiri, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(slideAnimKanan, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacityKanan, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, 1150);

    // Cleanup untuk clear timeout kalau komponen unmount
    return () => clearTimeout(timer);
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem("hasSeenOnboarding");
      if (hasSeenOnboarding === "true") {
        navigation.replace("LoginScreen");
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
      navigation.replace("LoginScreen");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const [isNextDisabled, setIsNextDisabled] = useState(false);

  const handleNext = () => {
    if (isNextDisabled) return; // Cegah aksi jika sedang delay

    setIsNextDisabled(true); // Matikan tombol sementara
    setTimeout(() => {
      setIsNextDisabled(false); // Aktifkan kembali setelah 1 detik
    }, 1000);

    if (!showSecondImage) {
      // Tampilkan gambar M4TB
      Animated.parallel([
        Animated.timing(opacityKiri, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityKanan, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowSecondImage(true);
        setShowThirdImage(false);
        setCurrentStep(2); // 👈 pindah step
        Animated.parallel([
          Animated.timing(slideAnimM4TB, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacityM4TB, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else if (!showThirdImage) {
      // Tampilkan gambar M2kiri
      Animated.timing(opacityM4TB, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setShowThirdImage(true);
        setShowFinalButton(true);
        setCurrentStep(3); // 👈 pindah step
        Animated.parallel([
          Animated.timing(slideAnimM2kiri, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacityM2kiri, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else if (showSecondImage && showThirdImage && !showFinalButton) {
      setShowFinalButton(true);
    }
  };

  const [secondButtonEnabled, setSecondButtonEnabled] = useState(false);
  const [thirdButtonEnabled, setThirdButtonEnabled] = useState(false);
  const [finalButtonEnabled, setFinalButtonEnabled] = useState(false);

  useEffect(() => {
    if (!showSecondImage) {
      const timer = setTimeout(() => setSecondButtonEnabled(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setSecondButtonEnabled(false);
    }
  }, [showSecondImage]);

  useEffect(() => {
    if (!showThirdImage) {
      const timer = setTimeout(() => setThirdButtonEnabled(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setThirdButtonEnabled(false);
    }
  }, [showThirdImage]);

  useEffect(() => {
    if (showFinalButton) {
      const timer = setTimeout(() => setFinalButtonEnabled(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setFinalButtonEnabled(false);
    }
  }, [showFinalButton]);

  useEffect(() => {
    return () => {
      isMounted.current = false; // ketika unmount, flag jadi false
      animations.current.forEach((anim) => anim.stop()); // hentikan semua animasi
    };
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0973FF", "#054599"]} style={StyleSheet.absoluteFill} />
      <TouchableOpacity
        style={styles.skipButton}
        // onPress={() => navigation.navigate("LoginScreen")}
        onPress={completeOnboarding}>
        <Text style={styles.skipText}>Lewati</Text>
      </TouchableOpacity>
      {/* Gambar Awal (KIRI & KANAN) */}
      {!showSecondImage && (
        <>
          <Animated.View
            style={{
              position: "absolute",
              width: 350,
              height: 380,
              left: -100,
              bottom: height * 0.6 - 70,
              transform: [{ translateY: slideAnimKiri }],
              opacity: opacityKiri,
            }}>
            <Image source={M3kanan} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
          </Animated.View>

          <Animated.View
            style={{
              position: "absolute",
              width: 350,
              height: 380,
              right: -100,
              bottom: height * 0.6 - 70,
              transform: [{ translateY: slideAnimKanan }],
              opacity: opacityKanan,
            }}>
            <Image source={M1TA} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
          </Animated.View>
        </>
      )}

      {/* Gambar Baru (M4TB) */}
      {showSecondImage && (
        <Animated.View
          style={{
            position: "absolute",
            width: 350,
            height: 380,
            alignSelf: "center",
            bottom: height * 0.6 - 70,
            transform: [{ translateY: slideAnimM4TB }],
            opacity: opacityM4TB,
          }}>
          <Image source={M4TB} style={{ width: "100%", height: "100%", right: 60 }} resizeMode="contain" />
        </Animated.View>
      )}

      {showThirdImage && (
        <Animated.View
          style={{
            position: "absolute",
            width: 350,
            height: 380,
            alignSelf: "center",
            bottom: height * 0.6 - 70,
            transform: [{ translateY: slideAnimM2kiri }],
            opacity: opacityM2kiri,
          }}>
          <Image source={M2kiri} style={{ width: "100%", height: "100%", left: 15 }} resizeMode="contain" />
        </Animated.View>
      )}

      {/* Rectangle bawah */}
      <Animated.View
        style={[
          styles.curvedRectangle,
          {
            transform: [{ translateY: slideCurvedRectangle }],
          },
        ]}>
        <View style={styles.textWrapper}>
          {!showThirdImage ? (
            <>
              <Text style={styles.titleTextWater}>Water is the source</Text>
              <Text style={styles.titleTextWater}>of life, but a small</Text>
              <Text style={styles.titleTextWater}>leak can be a big threat.</Text>
            </>
          ) : showSecondImage ? (
            <>
              <Text style={styles.titleTextElec}>Electrical energy is precious, </Text>
              <Text style={styles.titleTextElec}>every watt wasted is lost</Text>
              <Text style={styles.titleTextElec}>potential.</Text>
            </>
          ) : (
            <>
              <Text style={styles.titleText}>Welcome To</Text>
              <Text style={styles.titleText}>Sustainability Apps</Text>
            </>
          )}

          {!showSecondImage && (
            <View style={{ marginBottom: -40 }}>
              <TouchableOpacity
                style={[styles.button, !secondButtonEnabled && { opacity: 1 }]}
                onPress={handleNext}
                disabled={!secondButtonEnabled}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* {!showThirdImage && (
            <View style={{ marginBottom: -40 }}>
              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )} */}

          {!showThirdImage && (
            <View style={{ marginBottom: -40 }}>
              <TouchableOpacity
                style={[styles.button, !thirdButtonEnabled && { opacity: 1 }]}
                onPress={handleNext}
                disabled={!thirdButtonEnabled}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* {showFinalButton && (
            <View style={{ marginBottom: -60 }}>
              <TouchableOpacity
                style={[styles.button3]}
                // onPress={() => navigation.navigate("LoginScreen")}
                onPress={() => navigation.navigate("MainMenu")}
              >
                <Text style={styles.buttonText3}>Next</Text>
              </TouchableOpacity>
            </View>
          )} */}

          {showFinalButton && (
            <View style={{ marginBottom: -60 }}>
              <TouchableOpacity
                style={[styles.button3, !finalButtonEnabled && { opacity: 1 }]}
                // onPress={() => navigation.navigate("LoginScreen")}
                //onPress={() => navigation.navigate("MainMenu")}
                onPress={completeOnboarding}
                disabled={!finalButtonEnabled}>
                <Text style={styles.buttonText3}>Next</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ flexDirection: "row", top: 250 }}>
            {[1, 2, 3].map((step) => (
              <View
                key={step}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  marginHorizontal: 6,
                  backgroundColor: currentStep === step ? "#000" : "transparent",
                  borderWidth: 1.5,
                  borderColor: "#000",
                }}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  curvedRectangle: {
    width: width,
    height: height * 0.551,
    backgroundColor: "#fff",
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    justifyContent: "flex-end",
    paddingBottom: 340,
  },
  titleText: {
    color: "#0973FF",
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "Poppins",
    textAlign: "center",
    lineHeight: 30,
    bottom: -40,
  },
  titleTextWater: {
    color: "#0973FF",
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "Poppins",
    textAlign: "center",
    bottom: -80,
    lineHeight: 30,
    bottom: -100,
  },
  titleTextElec: {
    color: "#0973FF",
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "Poppins",
    textAlign: "center",
    lineHeight: 30,
    bottom: -80,
  },
  textWrapper: {
    alignItems: "center",
  },
  button: {
    top: 200,
    backgroundColor: "#0973FF",
    paddingVertical: 8,
    paddingHorizontal: 45,
    borderRadius: 30,
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Poppins",
  },
  button3: {
    top: 180,
    backgroundColor: "#0973FF",
    paddingVertical: 8,
    paddingHorizontal: 45,
    borderRadius: 30,
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    position: "relative",
  },
  buttonText3: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Poppins",
  },
  skipButton: {
    position: "absolute",
    top: 50, // sesuaikan agar tidak ketutup status bar
    right: 20,
    padding: 8,
    zIndex: 10,
  },
  skipText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PlaceHolderSSnextFirst;
