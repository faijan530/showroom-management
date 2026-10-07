import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomerRouteName } from './CustomerDrawer';

interface CustomerBottomBarProps {
  currentRoute: CustomerRouteName;
  onNavigate: (route: CustomerRouteName) => void;
}

export const CustomerBottomBar: React.FC<CustomerBottomBarProps> = ({
  currentRoute,
  onNavigate,
}) => {
  const tabs = [
    {
      id: 'dashboard' as CustomerRouteName,
      label: 'Home',
      icon: 'grid-outline' as const,
      activeIcon: 'grid' as const,
    },
    {
      id: 'garage' as CustomerRouteName,
      label: 'My Garage',
      icon: 'car-sport-outline' as const,
      activeIcon: 'car-sport' as const,
    },
    {
      id: 'vehicles' as CustomerRouteName,
      label: 'Marketplace',
      icon: 'bicycle-outline' as const,
      activeIcon: 'bicycle' as const,
    },
    {
      id: 'spare_parts' as CustomerRouteName,
      label: 'Parts',
      icon: 'cube-outline' as const,
      activeIcon: 'cube' as const,
    },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = currentRoute === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabButton}
            onPress={() => onNavigate(tab.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={20}
                color={isActive ? '#3b82f6' : '#64748b'}
              />
            </View>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#090d16',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 2,
  },
  iconBoxActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  tabLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#3b82f6',
    fontWeight: '800',
  },
});
