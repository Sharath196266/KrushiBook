import React, { useState, useEffect } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Linking,
  Platform,
  ScrollView,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { hp, wp } from '../../constants/helpers/common';
import { theme } from '../../constants/theme';
import ScreenWrapper from '../../components/ScreenWrapper';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from '@react-navigation/native';
import ErrorBoundary from '../../components/ErrorBoundary';

const GovtServices = () => {
  const [states, setStates] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [priceData, setPriceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [commodityDropdownOpen, setCommodityDropdownOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState(null);
  const [district, setDistrict] = useState(null);

  const navigation = useNavigation();

  const API_KEY_GOVT = "579b464db66ec23bdd0000017c37c28b0d5c4b24650ca76c3cdb31c5";
  const API_URL = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${API_KEY_GOVT}&format=json&limit=1000`;

  const govtWebsites = [
    { title: "Ministry of Agriculture", url: "https://agricoop.nic.in/" },
    { title: "eNAM (National Agriculture Market)", url: "https://www.enam.gov.in/" },
    { title: "PM Kisan Samman Nidhi", url: "https://www.pmkisan.gov.in/" },
    { title: "Indian Council of Agricultural Research (ICAR)", url: "https://icar.org.in/" },
    { title: "Krishi Vigyan Kendra", url: "https://kvk.icar.gov.in/" },
    { title: "Karnataka State Department of Agriculture", url: "http://raitamitra.kar.nic.in/" },
    { title: "Karnataka State Agricultural Marketing Board", url: "https://www.ksamb.karnataka.gov.in/" },
    { title: "Bhoomi (Land Records Karnataka)", url: "https://landrecords.karnataka.gov.in/" },
    { title: "Crop Insurance Karnataka", url: "https://pmfby.gov.in/" },
    { title: "Kaveri Online Services", url: "https://kaverionline.karnataka.gov.in/" },
  ];

  const fetchInitialData = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (data && data.records) {
        const uniqueStates = [...new Set(data.records.map((item) => item.state))];
        if (!uniqueStates.includes("Karnataka")) {
          uniqueStates.push("Karnataka");
        }
  
        const uniqueCommodities = [...new Set(data.records.map((item) => item.commodity))];
        setStates(uniqueStates.map((state) => ({ label: state, value: state })));
        setCommodities(uniqueCommodities.map((commodity) => ({ label: commodity, value: commodity })));
        setSelectedState(uniqueStates[0]);
        setSelectedCommodity(uniqueCommodities[0]);
      } else {
        Alert.alert("Failed to load states and commodities.");
      }
    } catch (error) {
      Alert.alert("Error fetching initial data", error.message);
    }
  };

  const findMaxPriceAndDistrict = (data) => {
    let max = -Infinity;
    let district = '';

    data.forEach((item) => {
      if (item.max_price > max) {
        max = item.max_price;
        district = item.district;
      }
    });

    return { maxPrice: max, district };
  };

  // Function to fetch paginated market data
  const fetchMarketData = async () => {
    setLoading(true);
    let allData = [];
    let offset = 0;
    const limit = 1000; // Fetch in batches of 1000 records
    
    try {
      while (true) {
        const response = await fetch(
          `${API_URL}&filters[state]=${selectedState}&filters[commodity]=${selectedCommodity}&offset=${offset}&limit=${limit}`
        );
        const data = await response.json();
        
        if (data && data.records && data.records.length > 0) {
          allData = [...allData, ...data.records];
          offset += limit; // Increment offset to fetch next batch
        } else {
          break; // No more records available
        }
      }
      
      if (allData.length > 0) {
        setPriceData(allData);
      } else {
        Alert.alert("No data available for the selected options.");
        setPriceData([]);
      }
    } catch (error) {
      Alert.alert("Error fetching data", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);
  useEffect(() => {
    if (priceData.length > 0) {
      // Find max price and corresponding district
      const { maxPrice, district } = findMaxPriceAndDistrict(priceData);
      setMaxPrice(maxPrice);
      setDistrict(district);
    }
  }, [priceData]);

  
  const currentPrice = priceData.length > 0 ? priceData[0].modal_price : "N/A";
  const currentMaxPrice = priceData.length > 0 ? maxPrice : "N/A";
  const currentDate = priceData.length > 0 ? priceData[0].arrival_date : "N/A";
  const currentDist = priceData.length > 0 ? district : "N/A";

  return (
    
    <ScreenWrapper>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      <FlatList
        data={[1]} // Dummy data to render the entire layout
        renderItem={() => (
          <View style={styles.container}>
            <Text style={styles.heading}>Govt Services</Text>

            <Text style={styles.title}>Marker Insights</Text>
            <View style={styles.dropdownRow}>
              <DropDownPicker
                open={stateDropdownOpen}
                value={selectedState}
                items={states}
                setOpen={setStateDropdownOpen}
                setValue={setSelectedState}
                placeholder="Select a state"
                containerStyle={styles.dropdownContainer}
                style={styles.dropdown}
                scrollViewProps={{ nestedScrollEnabled: true }}
                maxHeight={200}
                zIndex={stateDropdownOpen ? 1000 : 1} // Ensure dropdown is on top when open
              />
              
              <DropDownPicker
                open={commodityDropdownOpen}
                value={selectedCommodity}
                items={commodities}
                setOpen={setCommodityDropdownOpen}
                setValue={setSelectedCommodity}
                placeholder="Select a commodity"
                containerStyle={styles.dropdownContainer}
                style={styles.dropdown}
                scrollViewProps={{ nestedScrollEnabled: true }}
                maxHeight={200}
                zIndex={commodityDropdownOpen ? 1000 : 1} // Ensure dropdown is on top when open
              />
            </View>

            <TouchableOpacity
              style={styles.fetchButton}
              onPress={fetchMarketData}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Loading..." : "Fetch Data"}
              </Text>
            </TouchableOpacity>

            {priceData.length > 0 ? (
              <>
                <Text style={styles.currentPriceText}>Modal Price: ₹{currentPrice}</Text>
                <Text style={styles.currentPriceText}>Max Price: ₹{currentMaxPrice}</Text>
                <Text style={styles.currentPriceText}>Date: {currentDate}</Text>
                <Text style={styles.currentPriceText}>Highest price at APMC: {currentDist}</Text>
                
                <Text style={styles.title}>Price Trend</Text>
                {(Platform.OS !== "android") ?
                <LineChart
                  data={{
                    labels: priceData.slice(-10).map(() => ''), // Creating empty strings for labels
                    datasets: [
                      {
                        data: priceData
                          .slice(0, 10) // Get the last 10 records
                          .map((item) => parseFloat(item.modal_price) || 0), // Convert modal_price to number
                        color: (opacity = 1) => theme.colors.primary, // Customize line color
                        strokeWidth: 2,
                      },
                    ],
                  }}
                  width={wp(80)} // Width of the chart
                  height={hp(30)} // Height of the chart
                  yAxisLabel="₹"
                  chartConfig={{
                    backgroundColor: '#FFFFFF',
                    backgroundGradientFrom: '#FFFFFF',
                    backgroundGradientTo: '#FFFFFF',
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    strokeWidth: 2,
                    propsForDots: {
                      r: "6", // Dot radius
                      strokeWidth: "2", // Dot border width
                      stroke: theme.colors.primary, // Dot border color
                    },
                    style: { borderRadius: 16 },
                  }}
                  style={styles.chart}
                /> : 
                <ScrollView horizontal={true}>
                <View style={styles.tableContainer}>
                  <Text style={styles.title}> Displaying Table, due to fail in generating chart</Text>
                {/* Table Header */}
                <View style={styles.row}>
                  <Text style={styles.headerText}>City</Text>
                  <Text style={styles.headerText}>Variety</Text>
                  <Text style={styles.headerText}>Modal Price</Text>
                  <Text style={styles.headerText}>Max Price</Text>
                </View>
          
                {/* Table Data */}
                {priceData.map((item, index) => (
                  <View key={index} style={styles.row}>
                    <Text style={styles.cellText}>{item.district}</Text>
                    <Text style={styles.cellText}>{item.variety}</Text>
                    <Text style={styles.cellText}>{item.modal_price}</Text>
                    <Text style={styles.cellText}>{item.max_price}</Text>
                  </View>
                ))}
              </View>
              </ScrollView>
                 }
              </>
            ) : (
              <Text style={styles.currentPriceText}>No data available to render the chart.</Text>
            )}


            <Text style={styles.title}>Govt Websites</Text>
            {govtWebsites.map((site, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => Linking.openURL(site.url)}
              >
                <Text style={styles.websiteLink}>{index + 1}. {site.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        keyExtractor={(item, index) => `container-${index}`}
      />
    </ScreenWrapper>
    
  );
};

export default GovtServices;


const styles = StyleSheet.create({
  container: {
    padding: wp(4),
    backgroundColor: 'white',
  },
  tableContainer: {
    padding: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  headerText: {
    fontWeight: 'bold',
    width: '30%',
  },
  cellText: {
    width: '30%',
  },
  backButton: {
    padding: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    margin: wp(2),
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  heading: {
    fontSize: hp(3),
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: hp(2.5),
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  fetchButton: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dropdownContainer: {
    height: hp(6),
    width: wp(40),
  },
  dropdown: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
  },
  chart: {
    marginVertical: 20,
  },
  websiteLink: {
    fontSize: hp(2),
    color: theme.colors.primary,
    marginBottom: 10,
    textDecorationLine: 'underline',
  },
  currentPriceText: {
    fontSize: hp(2),
    color: theme.colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
});