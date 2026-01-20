import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { getLogs, saveLogsToFile, clearLogs } from '../utils/errorLogger';

const DebugLogsScreen: React.FC = () => {
  const [logs] = useState(() => getLogs());

  const handleSave = async () => {
    try {
      const path = await saveLogsToFile();
      Alert.alert('Saved', `Logs written to: ${path}`);
    } catch (err) {
      Alert.alert('Error', String(err));
    }
  };

  const handleClear = () => {
    clearLogs();
    Alert.alert(
      'Cleared',
      'In-memory logs cleared. Reload app to refresh view.',
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Debug Logs</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
            <Text style={styles.actionText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleClear}>
            <Text style={styles.actionText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={logs}
        keyExtractor={(item, idx) => `${idx}`}
        renderItem={({ item }) => (
          <View style={styles.logItem}>
            <Text style={styles.logTime}>
              {item.timestamp} [{item.level}]
            </Text>
            <Text style={styles.logMessage}>{item.message}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  header: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { color: '#fff', fontSize: 18 },
  actions: { flexDirection: 'row' },
  actionButton: {
    marginLeft: 8,
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionText: { color: '#fff' },
  logItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#222' },
  logTime: { color: '#999', fontSize: 12 },
  logMessage: { color: '#fff', marginTop: 4 },
});

export default DebugLogsScreen;
