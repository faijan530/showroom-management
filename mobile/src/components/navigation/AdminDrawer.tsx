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

export type AdminRouteName =
  | 'dashboard'
  | 'service_jobs'
  | 'enquiries'
  | 'worker_dispatch'
  | 'customer_reviews'
  | 'staff_directory'
  | 'vehicles'
  | 'spare_parts'
  | 'reports'
  | 'profile';

interface AdminDrawerProps {
  visible: boolean;
  onClose: () => void;
  currentRoute: AdminRouteName;
  onNavigate: (route: AdminRouteName) => void;
  showroomName: string;
  showroomCode: string;
  onLogout: () => void;
}

export const AdminDrawer: React.FC<AdminDrawerProps> = ({
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

  const handleSelect = (route: AdminRouteName) => {
    onNavigate(route);
    onClose();
  };

  const renderNavItem = (
    route: AdminRouteName,
    label: string,
    iconName: keyof typeof Ionicons.glyphMap,
    badgeCount?: number
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
            color={isActive ? '#a855f7' : '#94a3b8'}
          />
          <Text style={[styles.navItemText, isActive ? styles.navItemTextActive : null]}>
            {label}
          </Text>
        </View>

        {badgeCount !== undefined && badgeCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeCount}</Text>
          </View>
        ) : (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={isActive ? '#a855f7' : '#475569'}
          />
        )}
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
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Animated Slide Drawer */}
        <Animated.View
          style={[
            styles.drawerContent,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          {/* Showroom Header Context */}
          <View style={styles.drawerHeader}>
            <View style={styles.showroomIconBox}>
              <Ionicons name="business" size={24} color="#a855f7" />
            </View>
            <View style={styles.showroomMetaCol}>
              <Text style={styles.showroomNameText} numberOfLines={1}>
                {showroomName}
              </Text>
              <Text style={styles.showroomCodeText}>
                Branch Code: {showroomCode}
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Navigation Links Scrollable */}
          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Dashboard Primary Item */}
            {renderNavItem('dashboard', 'Dashboard', 'home')}

            {/* SECTION 1: OPERATIONS */}
            <Text style={styles.sectionHeader}>OPERATIONS</Text>
            {renderNavItem('service_jobs', 'Service Jobs', 'construct-outline')}
            {renderNavItem('enquiries', 'Inquiries & Test Rides', 'chatbubbles-outline')}
            {renderNavItem('worker_dispatch', 'Worker Dispatch', 'people-outline')}
            {renderNavItem('customer_reviews', 'Customer Reviews', 'star-outline')}

            {/* SECTION 2: SHOWROOM MANAGEMENT */}
            <Text style={styles.sectionHeader}>SHOWROOM MANAGEMENT</Text>
            {renderNavItem('staff_directory', 'Staff Directory', 'body-outline')}
            {renderNavItem('vehicles', 'Vehicles', 'bicycle-outline')}
            {renderNavItem('spare_parts', 'Spare Parts', 'cube-outline')}

            {/* SECTION 3: REPORTS & INSIGHTS */}
            <Text style={styles.sectionHeader}>REPORTS & INSIGHTS</Text>
            {renderNavItem('reports', 'Reports', 'bar-chart-outline')}

            {/* SECTION 4: ACCOUNT */}
            <Text style={styles.sectionHeader}>ACCOUNT</Text>
            {renderNavItem('profile', 'Profile', 'person-outline')}
          </ScrollView>

          {/* Footer Logout Button */}
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
  overlayContainer: {
    flex: 1,
    flexDirection: 'row',
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 16,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  showroomIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  showroomMetaCol: {
    flex: 1,
  },
  showroomNameText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800',
  },
  showroomCodeText: {
    color: '#a855f7',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 14,
  },
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
    backgroundColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  navItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navItemText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  navItemTextActive: {
    color: '#f8fafc',
    fontWeight: '800',
  },
  badge: {
    backgroundColor: '#a855f7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  drawerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
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
  logoutText: {
    color: '#f43f5e',
    fontSize: 14,
    fontWeight: '800',
  },
});
