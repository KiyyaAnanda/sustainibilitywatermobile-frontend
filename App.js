import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "react-native";

import NavigationMenu from "./src/navigation/NavigationMenu";
import BantuanScreen from "./src/screens/BantuanScreen/BantuanScreen";
import LoginScreen from "./src/screens/loginScreen/PlaceHolderLoginScreen";
import SigninScreen from "./src/screens/loginScreen/PlaceHolderSigninScreen";
import NotifikasiScreen from "./src/screens/NotifikasiScreen/NotifikasiScreen";
import EditReplacePasswordScreen from "./src/screens/PasswordScreen/EditrReplacePasswordScreen";
import EditProfileScreen from "./src/screens/ProfileScreen/EditProfileScreen";
import ProfileScreen from "./src/screens/ProfileScreen/ProfileScreen";
import PlaceHolderSplashScreen from "./src/screens/SpScreen/PlaceHolderSplashScreen";
import PlaceHolderSSUntilNext from "./src/screens/SpScreen/SplashScreenUntilNext/PlaceHolderSSUntilNext";
import TentangAplikasi from "./src/screens/TentangScreen/TentangAplikasiScreen";

import EvaluasiTargetAdd from "./src/tabs/tabAir/MasterEvaluasiTarget/EvaluasiTargetAdd";
import EvaluasiTargetDetail from "./src/tabs/tabAir/MasterEvaluasiTarget/EvaluasiTargetDetail";
import EvaluasiTargetEdit from "./src/tabs/tabAir/MasterEvaluasiTarget/EvaluasiTargetEdit";

import KomponenAirAdd from "./src/tabs/tabAir/MasterKomponenAir/KomponenAirAdd";
import KomponenAirDetail from "./src/tabs/tabAir/MasterKomponenAir/KomponenAirDetail";
import KomponenAirDetailHistory from "./src/tabs/tabAir/MasterKomponenAir/KomponenAirDetailHistory";
import KomponenAirEdit from "./src/tabs/tabAir/MasterKomponenAir/KomponenAirEdit";

import LokasiSensorAdd from "./src/tabs/tabAir/MasterLokasiSensor/LokasiSensorAdd";
import LokasiSensorDetail from "./src/tabs/tabAir/MasterLokasiSensor/LokasiSensorDetail";
import LokasiSensorEdit from "./src/tabs/tabAir/MasterLokasiSensor/LokasiSensorEdit";

import KontrolKomponenAirAdd from "./src/tabs/tabAir/TransaksiKontrolKomponenAir/KontrolKomponenAirAdd";
import KontrolKomponenAirDetail from "./src/tabs/tabAir/TransaksiKontrolKomponenAir/KontrolKomponenAirDetail";
import KontrolKomponenAirEdit from "./src/tabs/tabAir/TransaksiKontrolKomponenAir/KontrolKomponenAirEdit";
import KontrolKomponenAirTab from "./src/tabs/tabAir/TransaksiKontrolKomponenAir/KontrolKomponenAirTab";
import PenggunaanAirDetail from "./src/tabs/tabAir/TransaksiPenggunaanAir/PengunaanAirDetail";

import { I18nextProvider } from "react-i18next";
import "./src/i18n";
import i18n from "./src/i18n";
import LanguageScreen from "./src/screens/Language/LanguageScreen";

import { SafeAreaProvider } from "react-native-safe-area-context";
import HomeAirTab from "./src/tabs/tabHome/HomeAirTab";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        <I18nextProvider i18n={i18n}>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Splash"
              //initialRouteName="SigninScreen"
              //initialRouteName="LoginScreen"
              //initialRouteName="MainMenu"
              screenOptions={{ headerShown: false }} // jika ingin tanpa header
            >
              <Stack.Screen name="Splash" component={PlaceHolderSplashScreen} />
              <Stack.Screen name="UntilNext" component={PlaceHolderSSUntilNext} />
              <Stack.Screen name="LoginScreen" component={LoginScreen} />
              <Stack.Screen name="SigninScreen" component={SigninScreen} />
              <Stack.Screen name="MainMenu" component={NavigationMenu} />
              {/* Route untuk Menu Setting */}
              <Stack.Screen name="TentangAplikasi" component={TentangAplikasi} />
              <Stack.Screen name="BantuanScreen" component={BantuanScreen} />
              <Stack.Screen name="NotifikasiScreen" component={NotifikasiScreen} />
              <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
              <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
              <Stack.Screen name="EditReplacePasswordScreen" component={EditReplacePasswordScreen} />

              {/* Route untuk MainMenu / Dashboard Air & Listrik */}
              <Stack.Screen name="HomeAirTab" component={HomeAirTab} />
              {/* Route Menu Master Evaluasi Target Air */}
              <Stack.Screen name="EvaluasiTargetAdd" component={EvaluasiTargetAdd} />
              <Stack.Screen name="EvaluasiTargetDetail" component={EvaluasiTargetDetail} />
              <Stack.Screen name="EvaluasiTargetEdit" component={EvaluasiTargetEdit} />
              {/* Route Menu Master Komponen Air */}
              <Stack.Screen name="KomponenAirAdd" component={KomponenAirAdd} />
              <Stack.Screen name="KomponenAirDetail" component={KomponenAirDetail} />
              <Stack.Screen name="KomponenAirEdit" component={KomponenAirEdit} />
              <Stack.Screen name="KomponenAirDetailHistory" component={KomponenAirDetailHistory} />
              {/* Route Menu Master Lokasi Sensor */}
              <Stack.Screen name="LokasiSensorAdd" component={LokasiSensorAdd} />
              <Stack.Screen name="LokasiSensorEdit" component={LokasiSensorEdit} />
              <Stack.Screen name="LokasiSensorDetail" component={LokasiSensorDetail} />
              <Stack.Screen name="PenggunaanAirDetail" component={PenggunaanAirDetail} />

              {/* Route Menu Transaksi Kontrol Komponen Air */}
              <Stack.Screen name="KontrolKomponenAirAdd" component={KontrolKomponenAirAdd} />
              <Stack.Screen name="KontrolKomponenAirDetail" component={KontrolKomponenAirDetail} />
              <Stack.Screen name="KontrolKomponenAirTab" component={KontrolKomponenAirTab} />
              <Stack.Screen name="KontrolKomponenAirEdit" component={KontrolKomponenAirEdit} />

              <Stack.Screen name="LanguageScreen" component={LanguageScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </I18nextProvider>
      </SafeAreaProvider>
    </>
  );
}
