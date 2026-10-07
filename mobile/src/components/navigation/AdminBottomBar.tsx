import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminRouteName } from './AdminDrawer';

interface AdminBottomBarProps {
  currentRoute: AdminRouteName;
  onNavigate: (route: AdminRouteName) => void;
}

export const AdminBottomBar: React.FC<AdminBottomBarProps> = ({
  currentRoute,
  onNavigate,
}) => {
  const tabs = [
    {
      id: 'dashboard' as AdminRouteName,
      label: 'Dashboard',
      icon: 'grid-outline' as const,
      activeIcon: 'grid' as const,
    },
    {
      id: 'vehicles' as AdminRouteName,
      label: 'Vehicles',
      icon: 'bicycle-outline' as const,
      activeIcon: 'bicycle' as const,
    },
    {
      id: 'spare_parts' as AdminRouteName,
      label: 'Parts',
      icon: 'cube-outline' as const,
      activeIcon: 'cube' as const,
    },
    {
      id: 'staff_directory' as AdminRouteName,
      label: 'Staff',
      icon: 'people-outline' as const,
      activeIcon: 'people' as const,
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
                color={isActive ? '#a855f7' : '#64748b'}
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
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
  },
  tabLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#a855f7',
    fontWeight: '800',
  },
});
