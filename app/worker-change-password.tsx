 import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WorkerChangePasswordScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>
      <Text>This is the worker change password screen.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default WorkerChangePasswordScreen;