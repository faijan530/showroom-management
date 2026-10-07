import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SuperAdminRouteName } from './SuperAdminDrawer';

interface SuperAdminBottomBarProps {
  currentRoute: SuperAdminRouteName;
  onNavigate: (route: SuperAdminRouteName) => void;
}

export const SuperAdminBottomBar: React.FC<SuperAdminBottomBarProps> = ({
  currentRoute,
  onNavigate,
}) => {
  const tabs = [
    {
      id: 'dashboard' as SuperAdminRouteName,
      label: 'Dashboard',
      icon: 'grid-outline' as const,
      activeIcon: 'grid' as const,
    },
    {
      id: 'showrooms' as SuperAdminRouteName,
      label: 'Showrooms',
      icon: 'business-outline' as const,
      activeIcon: 'business' as const,
    },
    {
      id: 'audit_logs' as SuperAdminRouteName,
      label: 'Audit Logs',
      icon: 'shield-checkmark-outline' as const,
      activeIcon: 'shield-checkmark' as const,
    },
    {
      id: 'profile' as SuperAdminRouteName,
      label: 'Profile',
      icon: 'person-outline' as const,
      activeIcon: 'person' as const,
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
                color={isActive ? '#f43f5e' : '#64748b'}
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
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
  },
  tabLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#f43f5e',
    fontWeight: '800',
  },
});
