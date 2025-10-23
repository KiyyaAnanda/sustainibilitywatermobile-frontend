// styles/globalStyles.js
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 12,
    color: "#333",
    paddingHorizontal: 16,
  },
  sensorItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f0f4ff",
    borderBottomLeftRadius: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  sensorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#dce6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sensorIconText: {
    fontSize: 18,
  },
  sensorInfo: {
    flex: 1,
  },
  sensorName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  sensorStatus: {
    fontSize: 12,
    color: "#666",
  },
  sensorArrow: {
    fontSize: 20,
    color: "#888",
  },
  infoCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  infoCardContent: {
    position: "relative",
  },
  infoTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  infoSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginBottom: 5,
  },
  deviceInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 20,
  },
  buttonAdd: {
    alignSelf: "flex-start",
  },
  deviceImagePlaceholder: {
    width: 100,
    height: 80,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    marginTop: "-10%",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
});

export const stylesB = StyleSheet.create({
  trformContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    marginTop: 10,
    height: 820,
  },
  formContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    marginTop: 10,
    height: 560,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -105,
    padding: 24,
  },
  trButtonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
});

export const stylesDetail = StyleSheet.create({
  formContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    marginTop: 300,
    minHeight: 700, // ✅ gunakan minHeight agar tetap tinggi minimum, tapi bisa tumbuh
    zIndex: 1,
  },
  rectangle: {
    width: 345,
    height: 400,
    backgroundColor: "#0971FB",
    borderRadius: 20, // radius lengkungan sudut
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  containerValue: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
     paddingHorizontal: 28, // ganti marginLeft jadi padding biar proporsional
  paddingTop: 35, // ganti marginTop biar lebih fleksibel
  },
});
