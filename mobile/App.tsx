import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './src/store/auth.store';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { SuperAdminDashboardScreen } from './src/screens/SuperAdminDashboardScreen';
import { AdminDashboardScreen } from './src/screens/AdminDashboardScreen';
import { WorkerDashboardScreen } from './src/screens/WorkerDashboardScreen';
import { InventoryManagerDashboardScreen } from './src/screens/InventoryManagerDashboardScreen';
import { VehiclesScreen } from './src/screens/VehiclesScreen';
import { VehicleDetailScreen } from './src/screens/VehicleDetailScreen';
import { SparePartsScreen } from './src/screens/SparePartsScreen';
import { SparePartDetailScreen } from './src/screens/SparePartDetailScreen';
import { Vehicle } from './src/types/vehicle';
import { SparePart } from './src/types/spare-part';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

type AuthScreen = 'login' | 'register';
type AppScreen =
  | 'dashboard'
  | 'vehicles'
  | 'vehicle_detail'
  | 'spare_parts'
  | 'spare_part_detail';

function AppContent() {
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [appScreen, setAppScreen] = useState<AppScreen>('dashboard');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);

  const { user, isAuthenticated, isLoading, checkAuthSession } = useAuthStore();

  useEffect(() => {
    checkAuthSession();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Initializing MotoHub...</Text>
      </View>
    );
  }

  if (isAuthenticated) {
    // 1. SUPERADMIN Role Portal
    if (user?.role === 'SUPERADMIN') {
      return <SuperAdminDashboardScreen />;
    }

    // Common screen renders (Vehicles & Spare Parts)
    if (appScreen === 'vehicles') {
      return (
        <VehiclesScreen
          onSelectVehicle={(vehicle) => {
            setSelectedVehicle(vehicle);
            setAppScreen('vehicle_detail');
          }}
          onBack={() => setAppScreen('dashboard')}
        />
      );
    }

    if (appScreen === 'vehicle_detail' && selectedVehicle) {
      return (
        <VehicleDetailScreen
          vehicle={selectedVehicle}
          onBack={() => setAppScreen('vehicles')}
        />
      );
    }

    if (appScreen === 'spare_parts') {
      return (
        <SparePartsScreen
          onSelectPart={(part) => {
            setSelectedPart(part);
            setAppScreen('spare_part_detail');
          }}
          onBack={() => setAppScreen('dashboard')}
        />
      );
    }

    if (appScreen === 'spare_part_detail' && selectedPart) {
      return (
        <SparePartDetailScreen
          part={selectedPart}
          onBack={() => setAppScreen('spare_parts')}
        />
      );
    }

    // 2. ADMIN Role Portal (Showroom Owner / Manager)
    if (user?.role === 'ADMIN') {
      return (
        <AdminDashboardScreen
          onNavigateToVehicles={() => setAppScreen('vehicles')}
          onNavigateToSpareParts={() => setAppScreen('spare_parts')}
        />
      );
    }

    // 3. WORKER Role Portal (Technician / Mechanic)
    if (user?.role === 'WORKER') {
      return <WorkerDashboardScreen />;
    }

    // 4. INVENTORY_MANAGER Role Portal
    if (user?.role === 'INVENTORY_MANAGER') {
      return (
        <InventoryManagerDashboardScreen
          onNavigateToVehicles={() => setAppScreen('vehicles')}
          onNavigateToSpareParts={() => setAppScreen('spare_parts')}
        />
      );
    }

    // 5. USER / CUSTOMER Role Portal (Public User)
    return (
      <DashboardScreen
        onNavigateToVehicles={() => setAppScreen('vehicles')}
        onNavigateToSpareParts={() => setAppScreen('spare_parts')}
      />
    );
  }

  if (authScreen === 'register') {
    return <RegisterScreen onNavigateToLogin={() => setAuthScreen('login')} />;
  }

  return <LoginScreen onNavigateToRegister={() => setAuthScreen('register')} />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#090d16',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
});
