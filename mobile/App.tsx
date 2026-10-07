import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Image } from 'react-native';
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
import { CustomerGarageScreen } from './src/screens/CustomerGarageScreen';
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
  | 'spare_part_detail'
  | 'garage';

function AppContent() {
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [appScreen, setAppScreen] = useState<AppScreen>('dashboard');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  const [prefilledServiceVehicle, setPrefilledServiceVehicle] = useState<{ details: string; type: 'BIKE' | 'CAR' } | null>(null);

  const { user, isAuthenticated, isLoading, checkAuthSession } = useAuthStore();

  useEffect(() => {
    checkAuthSession();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require('./assets/logo.png')}
          style={styles.splashLogo}
          resizeMode="contain"
        />
        <Text style={styles.splashAppName}>MOTOHUB</Text>
        <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
        <Text style={styles.loadingText}>Initializing Showroom Platform...</Text>
      </View>
    );
  }

  if (isAuthenticated) {
    // 1. SUPERADMIN Role Portal
    if (user?.role === 'SUPERADMIN') {
      return <SuperAdminDashboardScreen />;
    }

    // Customer Garage Screen
    if (appScreen === 'garage') {
      return (
        <CustomerGarageScreen
          onBack={() => setAppScreen('dashboard')}
          onBookServiceForVehicle={(details, type) => {
            setPrefilledServiceVehicle({ details, type });
            setAppScreen('dashboard');
          }}
        />
      );
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
        onNavigateToGarage={() => setAppScreen('garage')}
        initialServiceVehicle={prefilledServiceVehicle}
        onClearPrefilledServiceVehicle={() => setPrefilledServiceVehicle(null)}
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
    backgroundColor: '#070a12',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  splashLogo: {
    width: 140,
    height: 140,
    borderRadius: 28,
    marginBottom: 16,
  },
  splashAppName: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  loader: {
    marginVertical: 14,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
});

