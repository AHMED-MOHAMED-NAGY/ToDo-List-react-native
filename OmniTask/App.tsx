/**
 * OmniTask - Main Application Entry Point
 * Initializes database, loads settings, and renders the app shell
 */
import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ActivityIndicator, StatusBar} from 'react-native';
import {ThemeProvider} from './src/theme/ThemeContext';
import {initDatabase} from './src/core/database';
import {useAppStore} from './src/core/store/useAppStore';
import AppNavigator from './src/navigation/AppNavigator';

const AppLoader = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const initialize = useAppStore((state) => state.initialize);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        // Step 1: Initialize SQLite database tables
        await initDatabase();
        // Step 2: Load app state (theme, settings, tasks, stats)
        await initialize();
        setIsReady(true);
      } catch (err: any) {
        console.error('[OmniTask] Initialization failed:', err);
        setError(err.message);
      }
    };
    bootstrap();
  }, []);

  if (error) {
    return (
      <View style={styles.splash}>
        <Text style={styles.errorText}>⚠️ Failed to start OmniTask</Text>
        <Text style={styles.errorDetail}>{error}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashTitle}>⚡ OmniTask</Text>
        <ActivityIndicator size="large" color="#6C8AFF" style={{marginTop: 20}} />
        <Text style={styles.splashSub}>Loading your productivity hub...</Text>
      </View>
    );
  }

  return <AppNavigator />;
};

const App = () => {
  return (
    <ThemeProvider>
      <StatusBar translucent={false} />
      <AppLoader />
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F1117',
  },
  splashTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#6C8AFF',
    letterSpacing: -1,
  },
  splashSub: {
    fontSize: 14,
    color: '#5A6478',
    marginTop: 12,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 18,
    color: '#F87171',
    fontWeight: '700',
  },
  errorDetail: {
    fontSize: 13,
    color: '#8B95A8',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default App;
