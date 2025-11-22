import React from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const FormContainerWithBlur = ({
  children,
  containerStyle,
  scrollContentStyle,
  maxHeight = 600,
  showTopBlur = true,
  showBottomBlur = true,
  blurHeight = 40,
}) => {
  // Separate title and form content
  const childrenArray = React.Children.toArray(children);

  // Check if first child is a Text component (title)
  let titleElement = null;
  let formContent = childrenArray;

  if (childrenArray.length > 0 && childrenArray[0]?.type === Text) {
    titleElement = childrenArray[0];
    formContent = childrenArray.slice(1);
  }

  return (
    <View style={[styles.container, { maxHeight }, containerStyle]}>
      {/* Fixed Title - tidak bisa di-scroll */}
      {titleElement && <View style={styles.titleWrapper}>{titleElement}</View>}

      {/* Scrollable Form Content */}
      <View style={styles.scrollWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, scrollContentStyle]}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
        >
          {formContent}
        </ScrollView>

        {/* Top Blur Overlay */}
        {showTopBlur && (
          <LinearGradient
            colors={["rgba(255,255,255,1)", "rgba(255,255,255,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.blurOverlay, styles.blurTop, { height: blurHeight }]}
            pointerEvents="none"
          />
        )}

        {/* Bottom Blur Overlay */}
        {showBottomBlur && (
          <LinearGradient
            colors={["rgba(255,255,255,0)", "rgba(255,255,255,1)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[
              styles.blurOverlay,
              styles.blurBottom,
              { height: blurHeight },
            ]}
            pointerEvents="none"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
  },
  titleWrapper: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: "#fff",
    zIndex: 5,
  },
  scrollWrapper: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  blurOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10,
    pointerEvents: "none",
  },
  blurTop: {
    top: 0,
  },
  blurBottom: {
    bottom: 0,
  },
});

export default FormContainerWithBlur;
