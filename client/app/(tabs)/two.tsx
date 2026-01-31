import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Image, Platform } from 'react-native';

import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GlassView from '../../components/GlassView';


const MOCK_GROUPS = [
  { id: '1', name: 'Moda Coffee Hunters', members: 4, lastMessage: 'Let\'s meet at 5?', image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18' },
  { id: '2', name: 'Weekend Vibes', members: 6, lastMessage: 'Who liked VR Escape?', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac' },
];

import { useRouter } from 'expo-router';

export default function GroupsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Community</Text>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.tint }]}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={theme.tabIconDefault} />
        <Text style={[styles.searchText, { color: theme.tabIconDefault }]}>Find your squad...</Text>
      </View>

      <FlatList
        data={MOCK_GROUPS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push({
              pathname: '/chat',
              params: { groupId: item.id, groupName: item.name }
            })}
          >
            <GlassView intensity={40} style={styles.groupCard}>
              <Image source={{ uri: item.image }} style={styles.groupImage} />
              <View style={styles.groupInfo}>
                <Text style={[styles.groupName, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.groupLastMessage, { color: theme.tabIconDefault }]} numberOfLines={1}>
                  {item.lastMessage}
                </Text>
              </View>
              <LinearGradient
                colors={theme.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.memberBadge}
              >
                <Text style={styles.memberCount}>{item.members}</Text>
              </LinearGradient>
            </GlassView>
          </TouchableOpacity>
        )}
      />


      <TouchableOpacity style={styles.createGroupBanner}>
        <LinearGradient
          colors={theme.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bannerGradient}
        >
          <View style={styles.bannerContent}>
            <View style={[styles.bannerIcon, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Ionicons name="sparkles" size={24} color="white" />
            </View>
            <View>
              <Text style={[styles.bannerTitle, { color: 'white' }]}>Yeni Grup Oluştur</Text>
              <Text style={[styles.bannerSubtitle, { color: 'rgba(255, 255, 255, 0.8)' }]}>Arkadaşlarınla beraber karar ver</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="rgba(255, 255, 255, 0.5)" />
        </LinearGradient>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    padding: 12,
    borderRadius: 15,
    marginBottom: 30,
    gap: 10,
  },
  searchText: {
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    gap: 16,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    gap: 16,
  },
  groupImage: {
    width: 60,
    height: 60,
    borderRadius: 18,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  groupLastMessage: {
    fontSize: 14,
    fontWeight: '500',
  },
  memberBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 11,
    fontWeight: '800',
    color: 'white',
  },

  createGroupBanner: {
    marginTop: 20,
    marginBottom: 110, // Increased to clear absolute tab bar
    borderRadius: 24,

    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  bannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bannerIcon: {
    width: 50,
    height: 50,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  bannerSubtitle: {
    fontSize: 13,
    fontWeight: '600',
  },

});
