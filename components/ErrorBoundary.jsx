import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.log('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong: {this.state.error.message}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}




const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffdddd', // Light red background
    padding: 20,
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff0000', // Red border
  },
  errorText: {
    color: '#ff0000', // Red text color
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
export default ErrorBoundary;