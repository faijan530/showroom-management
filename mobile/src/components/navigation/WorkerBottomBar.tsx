import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WorkerRouteName } from './WorkerDrawer';

interface WorkerBottomBarProps {
  currentRoute: WorkerRouteName;
  onNavigate: (route: WorkerRouteName) => void;
}

export const WorkerBottomBar: React.FC<WorkerBottomBarProps> = ({
  currentRoute,
  onNavigate,
}) => {
  const tabs = [
    {
      id: 'dashboard' as WorkerRouteName,
      label: 'Task Queue',
      icon: 'construct-outline' as const,
      activeIcon: 'construct' as const,
    },
    {
      id: 'spare_parts' as WorkerRouteName,
      label: 'Parts Lookup',
      icon: 'cube-outline' as const,
      activeIcon: 'cube' as const,
    },
    {
      id: 'profile' as WorkerRouteName,
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
                color={isActive ? '#f59e0b' : '#64748b'}
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
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  tabLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#f59e0b',
    fontWeight: '800',
  },
});
