import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, StyleSheet, Animated } from "react-native";

const Input = React.forwardRef(
  (
    {
      label = "",
      value,
      onChangeText,
      isRequired = false,
      isDisabled = false,
      errorMessage,
      multiline = false,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const animatedIsFocused = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
      Animated.timing(animatedIsFocused, {
        toValue: isFocused || !!value ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }, [isFocused, value]);

    const labelStyle = {
      position: "absolute",
      left: 12,
      color: animatedIsFocused.interpolate({
        inputRange: [0, 1],
        outputRange: ["#aaa", errorMessage ? "red" : "#888"],
      }),
      top: animatedIsFocused.interpolate({
        inputRange: [0, 1],
        outputRange: [18, 6],
      }),
      fontSize: animatedIsFocused.interpolate({
        inputRange: [0, 1],
        outputRange: [16, 12],
      }),
      backgroundColor: "#fff",
      paddingHorizontal: 4,
      zIndex: 1,
    };

    return (
      <View style={[styles.container, { marginBottom: errorMessage ? 6 : 22 }]}>
        <View
          style={[
            styles.inputWrapper,
            isDisabled && styles.disabledInput,
            errorMessage && styles.errorBorder,
            multiline && { paddingTop: 26 },
          ]}
        >
          <Animated.Text style={labelStyle}>
            {label}
            {isRequired && " *"}
          </Animated.Text>
          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            editable={!isDisabled}
            multiline={multiline}
            style={[styles.input, multiline && styles.textarea]}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
        </View>

        {/* Error message di luar inputWrapper */}
        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    // Hapus marginBottom dari sini, biar developer yang atur
  },
  inputWrapper: {
    position: "relative",
    borderWidth: 1,
    borderColor: "#555555",
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingTop: 12,
    backgroundColor: "#fff",
  },
  errorBorder: {
    borderColor: "red",
  },
  input: {
    height: 40,
    fontSize: 14,
    color: "#000",
    paddingHorizontal: 3,
  },
  textarea: {
    height: 100,
    textAlignVertical: "top",
  },
  disabledInput: {
    borderColor: "#ccc",
    opacity: 0.6,
  },
  errorText: {
    marginTop: 2,
    marginLeft: 12,
    color: "red",
    fontSize: 12,
  },
});

export default Input;
