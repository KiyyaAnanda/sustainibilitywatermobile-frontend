import { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import mVR1 from "../../assets/picturePng/mVR1.png";
import { Ionicons as Icon } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { postUser } from "../../services/apiService";
import Input from "../../components/Input";
import DropDownForm from "../../components/DropDownForm";
import * as yup from "yup";
import { validateAllInputs, validateInput } from "../../Util/ValdiationForm";
import DateTimePicker from "@react-native-community/datetimepicker";

// Pastikan font sudah dimuat sebelum menampilkan UI

const { width, height } = Dimensions.get("window");

const PlaceHolderSigninScreen = () => {
  const navigation = useNavigation();
  const slideCurvedRectangle = useRef(new Animated.Value(height)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Text States
  const [usernameText, setUsernameText] = useState("");
  const [passwordText, setPasswordText] = useState("");
  const [namaText, setNamaText] = useState("");
  const [tanggalText, setTanggalText] = useState("");
  const [emailText, setEmailText] = useState("");
  const [departemenText, setDepartemenText] = useState("");

  // Refs for value access
  const usernameRef = useRef("");
  const passwordRef = useRef("");
  const namaRef = useRef("");
  const tanggalLahirRef = useRef("");
  const departemenRef = useRef("");
  const emailRef = useRef("");

  const [fontsLoaded] = useFonts({
    "Poppins-Bold": require("../../../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Regular": require("../../../assets/fonts/Poppins-Regular.ttf"),
  });

  const departemenList = [
    { label: "MARKETING", value: "MARKETING" },
    { label: "ENGINEERING", value: "ENGINEERING" },
    { label: "PPIC", value: "PPIC" },
  ];

  const formDataRef = useRef({
    username: "",
    nama: "",
    departemen: "",
    tgllahir: "",
    email: "",
    password: "",
  });
  const signUpSchema = yup.object().shape({
    username: yup.string().required("Username wajib diisi"),
    password: yup.string().required("Password wajib diisi"),
    nama: yup.string().required("Nama wajib diisi"),
    tgllahir: yup.string().required("Tanggal lahir wajib diisi"),
    departemen: yup.string().required("Departemen wajib dipilih"),
    email: yup
      .string()
      .email("Email tidak valid")
      .required("Email wajib diisi"),
  });

  const handleInputChange = async (name, value) => {
    if (name === "username") usernameRef.current = value;
    if (name === "password") passwordRef.current = value;
    if (name === "nama") namaRef.current = value;
    if (name === "tgllahir") tanggalLahirRef.current = value;
    if (name === "email") emailRef.current = value;
    if (name === "departemen") departemenRef.current = value;

    const validationError = await validateInput(name, value, signUpSchema);
    setErrors((prev) => ({
      ...prev,
      [name]: validationError.error,
    }));
  };
  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`; // hasil: 2025-06-29
  };

  const handleSignUp = async () => {
    const values = {
      username: usernameRef.current,   // @p1
      nama: namaRef.current,           // @p2
      tgllahir: tanggalLahirRef.current, // @p3
      departemen: "Admin GA",          // @p4
      email: emailRef.current,         // @p5
      password: passwordRef.current,   // @p6
    };   

    const validationErrors = await validateAllInputs(
      values,
      signUpSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((err) => !err)) {
      setIsLoading(true);
      console.log(values);
      try {
        const data = await postUser("MasterProfile/CreateDataProfile", values);

        const response = Array.isArray(data) ? data[0] : data;

        if (response.status === "ERROR") {
          Alert.alert("Gagal", response.message || "Terjadi kesalahan.");
        } else if (response.status === "OK") {
          Alert.alert("Sukses", response.message || "Kembali Kemenu Utama", [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]);
        } else {
          Alert.alert("Gagal", "Format respon tidak dikenali.");
        }
      } catch (error) {
        setIsError({ error: true, message: error.message });
      }
    }
  };
  useEffect(() => {
    const today = new Date();
    const formattedDate = formatDate(today);
    setTanggalText(formattedDate);
    formDataRef.current.tgllahir = formattedDate;
    handleInputChange("tgllahir", formattedDate);
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        delay: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fontsLoaded]);

  useEffect(() => {
    Animated.timing(slideCurvedRectangle, {
      toValue: 0,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, []); // <-- tambahkan ini

  if (!fontsLoaded) {
    // While fonts are loading, you can display a loading indicator or a splash screen
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0973FF", "#054599"]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={{
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        }}
      >
        <Image source={mVR1} style={styles.image} resizeMode="contain" />
      </Animated.View>

      <Animated.View
        style={{
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        }}
      >
        <Text style={styles.welcomeText}>Sign Up</Text>
      </Animated.View>

      {/* Rectangle bawah */}
      <Animated.View
        style={[
          styles.curvedRectangle,
          {
            transform: [{ translateY: slideCurvedRectangle }],
          },
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
          <ScrollView
            style={styles.form}
            contentContainerStyle={{ paddingBottom: 10 }}
            showsVerticalScrollIndicator={false}
          >
            <Input
              label="Username"
              value={usernameText}
              onChangeText={(text) => {
                setUsernameText(text);
                handleInputChange("username", text);
              }}
              errorMessage={errors.username}
            />

            <View style={{ position: "relative" }}>
              <Input
                label="Password"
                value={passwordText}
                secureTextEntry={!showPassword}
                onChangeText={(text) => {
                  setPasswordText(text);
                  handleInputChange("password", text);
                }}
                errorMessage={errors.password}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 18,
                  top: 22,
                }}
              >
                <Icon
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#555"
                />
              </TouchableOpacity>
            </View>

            <Input
              label="Nama"
              value={namaText}
              onChangeText={(text) => {
                setNamaText(text);
                handleInputChange("nama", text);
              }}
              errorMessage={errors.nama}
            />

            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Input
                label="Tanggal Lahir"
                value={tanggalText}
                editable={false} // agar tidak bisa diketik manual
                pointerEvents="none" // supaya input tidak fokus saat ditekan
                errorMessage={errors.tgllahir}
              />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={tanggalText ? new Date(tanggalText) : new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    const formattedDate = formatDate(selectedDate);
                    setTanggalText(formattedDate); // update ke state UI
                    formDataRef.current.tgllahir = formattedDate;
                    handleInputChange("tgllahir", formattedDate);
                  }
                }}
              />
            )}

            {/* <DropDownForm
              label="Departemen"
              arrData={departemenList}
              selectedValue={departemenText}
              onValueChange={(val) => {
                setDepartemenText(val);
                handleInputChange("departemen", val);
              }}
              errorMessage={errors.departemen}
            /> */}

            <Input
              label="Email"
              value={emailText}
              onChangeText={(text) => {
                setEmailText(text);
                handleInputChange("email", text);
              }}
              errorMessage={errors.email}
            />

            <View style={{ marginTop: -5 }}>
              <TouchableOpacity
                style={styles.signInButton}
                onPress={handleSignUp}
              >
                <Text style={styles.signInText}>Buat Akun</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  signInButton: {
    marginTop: 15,
    backgroundColor: "#fff",
    borderColor: "#407BFF",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  signInText: {
    color: "#407BFF",
    fontWeight: "600",
  },
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  // curvedRectangle: {
  //   width: width,
  //   height: height * 0.73,
  //   backgroundColor: "#fff",
  //   borderTopLeftRadius: 60,
  //   borderTopRightRadius: 60,
  //   justifyContent: "flex-end",
  //   paddingBottom: 340,
  // },
  curvedRectangle: {
   height: Platform.select({
      ios: height * 0.72,
      android: height * 0.75, 
    }),
    width: width,
    backgroundColor: "#fff",
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
  },
  image: {
    width: 500,
    height: 500,
    right: 105,
    top: 300,
  },
  title: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
  },
  form: {
    flex: 1,
    // marginTop: 60,
    marginTop: Platform.select({
      ios: 60,
      android: 40,
    }),
    backgroundColor: "#fff",
    borderTopLeftRadius: 55,
    borderTopRightRadius: 55,
    padding: 25,
  },
  label: {
    fontFamily: "Poppins-Bold", // <-- pakai Poppins reguler
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
    marginTop: 10,
    left: 15,
  },
  inputPass: {
    fontFamily: "Poppins-Regular",
    backgroundColor: "#EEF2FF",
    borderRadius: 60,
    paddingHorizontal: 5,
    paddingVertical: 12,
    paddingTop: 13,
    fontSize: 14,
    marginBottom: -2,
    textAlignVertical: "center",
  },
  input: {
    fontFamily: "Poppins-Regular",
    backgroundColor: "#EEF2FF",
    borderRadius: 60,
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingTop: 12,
    marginBottom: 5,
    fontSize: 14,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    borderRadius: 60,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  // loginButton: {
  //   backgroundColor: "#4C00FF",
  //   paddingVertical: 10,
  //   width: 170,
  //   borderRadius: 12,
  //   marginTop: 20,
  //   alignItems: "center",
  //   shadowColor: "#000",
  //   shadowOpacity: 0.15,
  //   shadowOffset: { width: 0, height: 4 },
  //   shadowRadius: 6,
  //   elevation: 5,
  //   borderRadius: 60,
  //   left: 85,
  // },
  // loginText: {
  //   fontFamily: "Poppins-Bold",
  //   color: "#fff",
  //   fontSize: 16,
  // },
  loginButton: {
    backgroundColor: "#0973FF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    borderRadius: 8,
  },
  loginText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  forgotText: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 13,
    color: "#444",
  },
  fingerprintText: {
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    marginTop: 10,
    fontSize: 13,
    color: "#444",
  },
  orText: {
    textAlign: "center",
    marginVertical: 15,
    color: "#888",
    fontSize: 13,
  },
  socialIcons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginHorizontal: 50,
  },
  welcomeText: {
    fontFamily: "Poppins-Bold",
    fontSize: 26,
    color: "#fff",
    marginTop: 60,
    alignSelf: "center",
    bottom: 120,
    left: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    marginBottom: 10,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingHorizontal: 10,
  },
  modalText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#333",
  },
});

export default PlaceHolderSigninScreen;
