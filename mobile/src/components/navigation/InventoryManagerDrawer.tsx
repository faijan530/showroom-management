import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 320);

export type InventoryManagerRouteName =
  | 'dashboard'
  | 'spare_parts'
  | 'vehicles'
  | 'profile';

interface InventoryManagerDrawerProps {
  visible: boolean;
  onClose: () => void;
  currentRoute: InventoryManagerRouteName;
  onNavigate: (route: InventoryManagerRouteName) => void;
  showroomName: string;
  showroomCode: string;
  onLogout: () => void;
}

export const InventoryManagerDrawer: React.FC<InventoryManagerDrawerProps> = ({
  visible,
  onClose,
  currentRoute,
  onNavigate,
  showroomName,
  showroomCode,
  onLogout,
}) => {
  const slideAnim = React.useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  const handleSelect = (route: InventoryManagerRouteName) => {
    onNavigate(route);
    onClose();
  };

  const renderNavItem = (
    route: InventoryManagerRouteName,
    label: string,
    iconName: keyof typeof Ionicons.glyphMap
  ) => {
    const isActive = currentRoute === route;
    return (
      <TouchableOpacity
        key={route}
        style={[styles.navItem, isActive ? styles.navItemActive : null]}
        onPress={() => handleSelect(route)}
        activeOpacity={0.7}
      >
        <View style={styles.navItemLeft}>
          <Ionicons
            name={iconName}
            size={20}
            color={isActive ? '#06b6d4' : '#94a3b8'}
          />
          <Text style={[styles.navItemText, isActive ? styles.navItemTextActive : null]}>
            {label}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={isActive ? '#06b6d4' : '#475569'}
        />
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlayContainer}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          style={[
            styles.drawerContent,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          {/* Showroom Stock Header */}
          <View style={styles.drawerHeader}>
            <View style={styles.iconBox}>
              <Ionicons name="cube" size={24} color="#06b6d4" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {showroomName}
              </Text>
              <Text style={styles.headerSub}>Code: {showroomCode}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Links */}
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {renderNavItem('dashboard', 'Stock Dashboard', 'home')}

            <Text style={styles.sectionHeader}>INVENTORY CONTROL</Text>
            {renderNavItem('spare_parts', 'Spare Parts Catalog', 'cube-outline')}
            {renderNavItem('vehicles', 'Vehicle Stock Catalog', 'bicycle-outline')}

            <Text style={styles.sectionHeader}>ACCOUNT</Text>
            {renderNavItem('profile', 'Profile', 'person-outline')}
          </ScrollView>

          <View style={styles.drawerFooter}>
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => {
                onClose();
                onLogout();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out" size={20} color="#f43f5e" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayContainer: { flex: 1, flexDirection: 'row' },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(3, 7, 18, 0.75)',
  },
  drawerContent: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#090d16',
    borderRightWidth: 1,
    borderRightColor: '#1e293b',
    paddingTop: 44,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  headerTitle: { color: '#f8fafc', fontSize: 15, fontWeight: '800' },
  headerSub: { color: '#06b6d4', fontSize: 11, fontWeight: '700', marginTop: 2 },
  closeBtn: { padding: 6 },
  scrollContainer: { flex: 1, paddingHorizontal: 14, paddingTop: 14 },
  sectionHeader: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 18,
    marginBottom: 8,
    marginLeft: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  navItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  navItemText: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },
  navItemTextActive: { color: '#f8fafc', fontWeight: '800' },
  drawerFooter: { padding: 16, borderTopWidth: 1, borderTopColor: '#1e293b' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  logoutText: { color: '#f43f5e', fontSize: 14, fontWeight: '800' },
});
