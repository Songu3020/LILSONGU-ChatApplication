import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  sendVerificationCode,
  confirmVerificationCode,
} from "../services/auth";
import { RecaptchaVerifier } from "firebase/auth";
import { auth } from "../services/firebase";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { isValidPhoneNumber } from "../utils/validation";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [error, setError] = useState("");

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    recaptchaVerifierRef.current = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
      },
    );
  }, []);

  const handleSendCode = async () => {
    setError("");

    if (!isValidPhoneNumber(phoneNumber)) {
      setError(
        "Please enter a valid phone number with country code, e.g. +19078374571",
      );
      return;
    }

    try {
      const result = await sendVerificationCode(
        phoneNumber,
        recaptchaVerifierRef.current,
      );
      setConfirmationResult(result);
    } catch (error) {
      console.error("Failed to send code:", error);
      setError("Failed to send verification code. Please try again.");
    }
  };

  const handleVerifyCode = async () => {
    try {
      await confirmVerificationCode(confirmationResult, code);
      navigation.navigate("ChatList");
    } catch (error) {
      console.error("Failed to verify code:", error);
    }
  };

  return (
    <View style={styles.container}>
      <div id="recaptcha-container" />
      <Text style={styles.title}>ChatApp</Text>
      <Text style={styles.subtitle}>Enter your phone number to continue</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="+1 234 567 8900"
          placeholderTextColor="#999"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          onSubmitEditing={handleSendCode}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendCode}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
      {error !== "" && <Text style={styles.error}>{error}</Text>}

      {confirmationResult && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Verification code"
            placeholderTextColor="#999"
            value={code}
            onChangeText={setCode}
            onSubmitEditing={handleVerifyCode}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleVerifyCode}
          >
            <Text style={styles.sendButtonText}>Verify</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0d9588",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "white",
    textAlign: "center",
    marginBottom: 32,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#0d9588",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  error: {
    color: "#ff6b6b",
    textAlign: "center",
    marginBottom: 10,
  },
});
