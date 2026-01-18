/**
 * Setup Screen
 * Shows Firebase configuration status and next steps
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';

const SetupScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.icon}>⚙️</Text>
          <Text style={styles.title}>Setup Required</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Firebase Configuration</Text>
          <Text style={styles.description}>
            To use ARCampusNavigator, you need to configure Firebase with Firestore.
          </Text>
        </View>

        <View style={styles.steps}>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Create Firebase Project</Text>
              <Text style={styles.stepDesc}>
                Go to console.firebase.google.com and create a new project
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Download google-services.json</Text>
              <Text style={styles.stepDesc}>
                From Firebase Console → Project Settings → Download google-services.json
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Place in android/app/</Text>
              <Text style={styles.stepDesc}>
                Copy google-services.json to: android/app/google-services.json
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepNumber}>4</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Create Firestore Collections</Text>
              <Text style={styles.stepDesc}>
                Create these collections in Firestore: buildings, routes, pathNodes
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepNumber}>5</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Rebuild the App</Text>
              <Text style={styles.stepDesc}>
                Run: npx react-native run-android
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Firestore Schema</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.code}>buildings/</Text>
            <Text style={styles.code}>  - id: string</Text>
            <Text style={styles.code}>  - name: string</Text>
            <Text style={styles.code}>  - location: GeoPoint</Text>
            <Text style={styles.code}>  - description: string</Text>
            <Text style={styles.code}>  - floors: number</Text>
          </View>

          <View style={styles.codeBlock}>
            <Text style={styles.code}>routes/</Text>
            <Text style={styles.code}>  - id: string</Text>
            <Text style={styles.code}>  - startBuilding: string</Text>
            <Text style={styles.code}>  - endBuilding: string</Text>
            <Text style={styles.code}>  - pathNodeIds: string[]</Text>
          </View>

          <View style={styles.codeBlock}>
            <Text style={styles.code}>pathNodes/</Text>
            <Text style={styles.code}>  - routeId: string</Text>
            <Text style={styles.code}>  - coordinates: GeoPoint</Text>
            <Text style={styles.code}>  - order: number</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF8C00',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  steps: {
    marginBottom: 20,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 12,
    minWidth: 30,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 18,
  },
  infoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  codeBlock: {
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#333333',
    lineHeight: 16,
  },
});

export default SetupScreen;
