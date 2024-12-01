import { Alert, Platform } from "react-native";

export const showAlert = (title, message) => {
  if (Platform.OS === "web") {
    window.alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
};
// Helper to simulate multi-option alerts on the web
export const showChoiceAlert = ({ title, message, options }) => {
    if (Platform.OS === "web") {
      const choice = window.prompt(
        `${title}\n\n${message}\n\nOptions:\n${options.map(
          (o, i) => `${i + 1}: ${o.text}`
        ).join("\n")}`,
        "Enter the option number"
      );
  
      if (choice) {
        const selectedOption = options[parseInt(choice, 10) - 1];
        if (selectedOption && selectedOption.onPress) {
          selectedOption.onPress();
        }
      }
    } else {
      Alert.alert(title, message, options);
    }
  };