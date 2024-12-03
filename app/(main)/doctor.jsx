import { Alert, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Pressable, TextInput, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import Header from "../../components/Header";
import ScreenWrapper from '../../components/ScreenWrapper';
import { hp, wp } from '../../constants/helpers/common';
import { theme } from '../../constants/theme';
import axios from 'axios';
import { usePathname, useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Location from 'expo-location'; // Import Location module
import { showAlert } from '../../utilities/showAlert';

const doctor = () => {
  const [loading, setLoading] = useState(true);
  const [loadingW, setLoadingW] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null); // Store device location
  const [userInput, setUserInput] = useState(''); // For the user input
  const [botResponse, setBotResponse] = useState(''); 
  const [isagri, setagri]=useState("");
  const [pr,setPr]=useState("");
  
  const router = useRouter();
  const API_KEY = '8a7bed89cfa149e7b9b120236242711';
  const GPT_API_KEY = 'AIzaSyB2AA89d7fl_0Lwx8iqyStnKChhVtKpnnk';
  
  const isActive = (route) => {
    const pathname = usePathname();
    return pathname === route;
  };

  // Get the current location of the device
  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location.coords); // Set the location coordinates
      } else {
        showAlert('Permission denied', 'Permission to access location was denied');
      }
    };

    getLocation();
  }, []);

  useEffect(() => {
    if (location) {
      
      const fetchWeatherData = async () => {
        try {
          setLoading(true);
          const { latitude, longitude } = location;
          const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${latitude},${longitude}&hours=12`;  // Use coordinates in the API URL
          const response = await axios.get(API_URL);
          setWeatherData(response.data.forecast.forecastday[0].hour); // Extract hourly data
        } catch (err) {
          setError("Failed to fetch weather data.");
          showAlert("Error", "Failed to fetch weather data from WeatherAPI.");
        } finally {
          setLoading(false);
        }
      };

      fetchWeatherData();
    }
  }, [location]); // Fetch weather data when location is updated

  const renderWeatherData = () => {
    if (loading) {
      return <ActivityIndicator size="large" color={theme.colors.primary} />;
    }

    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }

    if (weatherData) {
      return (
        <View style={styles.weatherContainer}>
          <Text style={styles.weatherHeading}>Weather</Text>
          <ScrollView horizontal contentContainerStyle={styles.weatherList}>
            {weatherData.map((hour, index) => (
              <View key={index} style={styles.weatherCard}>
                <Text style={styles.timeText}>{new Date(hour.time).toLocaleTimeString()}</Text>
                <Text style={styles.tempText}>{`${hour.temp_c}°C`}</Text>
                <Text style={styles.weatherCondition}>{hour.condition.text}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      );
    }

    return null;
  };

  const handleChatSubmit = async () => {

    setLoadingW(true);

    try {
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(GPT_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Construct the prompt based on user input
      let prompt = userInput;

      try {
        const result = await model.generateContent(prompt+". provide details in both kannada and english and hindi, and don't mention here's the description in kannada and english");
        if (result && result.response) {
          setBotResponse(result.response.text || "No response from Gemini");
        } else {
          setBotResponse("No response available.");
        }
      } catch (error) {
        console.error("Error in generating content:", error);
        setBotResponse("Failed to generate content. Please try again.");
      }
    } catch (error) {
      console.error("Error in Generative AI request:", error);
      setBotResponse("Failed to get response from the AI.");
    } finally {

      setLoadingW(false);
    }
};

  
  
  return (
    <ScreenWrapper>
      <View style={styles.bigcontainer}>
        <View style={styles.headerContainer}>
          <Pressable onPress={() => router.replace('home')} style={styles.bcbutton}>
            <Icon name="chevron-left" width={23} size={20} color={theme.colors.text} />
          </Pressable>
          <Header title={"Dr. Agro - Crop Solutions"} mb={10} showBackButon={false} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.container}>
            {renderWeatherData()}

            {/* Dr. Bot Heading */}
            <Text style={styles.botHeading}>Dr. Bot - Crop Disease Assistance</Text>

            {/* Text Input for the user to input their problem */}
            <TextInput
              style={styles.input}
              placeholder="Describe your crop problem or disease"
              value={userInput}
              onChangeText={setUserInput}
            />

            {/* Button to submit user input and get response */}
            
            <TouchableOpacity onPress={handleChatSubmit} style={styles.submitButton}>
              <Text style={styles.submitButtonText}>Get Solution</Text>
            </TouchableOpacity>

            {/* Display the bot response */}
            { userInput && loadingW ? (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            ) : (
              botResponse && <Text style={styles.botResponse}>{botResponse}</Text>
            )}

          </View>
        </ScrollView>

        <View style={styles.footer}>
          {/* Your footer style */}
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default doctor;

const styles = StyleSheet.create({
  bigcontainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    marginHorizontal: wp(1),
    justifyContent: 'space-between',
  },
  container: {
    gap: 10,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: '#ddd',
    borderRadius: theme.radius.xxl * 1.1,
    paddingHorizontal: wp(4),
    shadowColor: '#000',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  weatherContainer: {
    width: '100%',
    marginBottom: 20,
  },
  weatherHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 10,
  },
  weatherList: {
    paddingBottom: 20,
  },
  weatherCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    marginVertical: 8,
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    width: wp(22),
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  tempText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 5,
  },
  weatherCondition: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  footer: {
    // Your footer style
  },
  bcbutton: {
    alignSelf: 'flex-start',
    marginLeft: 5,
  },
  botHeading: {
    fontSize: 18,
    color: theme.colors.primary,
    marginTop: 20,
  },
  input: {
    width: '100%',
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    fontSize: 16,
    color: theme.colors.text,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  submitButtonText: {
    fontSize: 18,
    color: '#fff',
  },
  botResponse: {
    marginTop: 20,
    fontSize: 16,
    color: theme.colors.text,
  },
});
