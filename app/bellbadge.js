import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import  Icon  from 'react-native-vector-icons/FontAwesome';

export default function BellWithBadge({ count }) {
  return (
    <View style={{ position: 'relative' }}>
      {/* 🔔 Bell */}
      <Icon name="bell" size={24} color="red" />

      {/* 🟡 Badge */}
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -1,
    right: -6,
    backgroundColor: 'lightblue',
    borderRadius: 10,
    paddingHorizontal: 5,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
});
