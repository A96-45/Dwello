import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, MessageCircle, Users, Bell } from 'lucide-react-native';

const MOCK_CHATS = [
  {
    id: '1',
    type: 'landlord' as const,
    name: 'John Kamau',
    lastMessage: 'Yes, viewing available tomorrow at 2 PM',
    time: '2 min ago',
    unread: 2,
    online: true,
  },
  {
    id: '2',
    type: 'group' as const,
    name: 'Westlands Apartments',
    lastMessage: 'Sarah: Anyone has a plumber recommendation?',
    time: '15 min ago',
    unread: 3,
    members: 42,
  },
  {
    id: '3',
    type: 'landlord' as const,
    name: 'Mary Wanjiku',
    lastMessage: 'Thank you for the inquiry',
    time: '1 hour ago',
    unread: 0,
    online: false,
  },
  {
    id: '4',
    type: 'group' as const,
    name: 'Kilimani Residents',
    lastMessage: 'Power outage right now?',
    time: '2 hours ago',
    unread: 12,
    members: 28,
  },
];

export default function ChatsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'messages' | 'groups' | 'notifications'>('messages');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = MOCK_CHATS.filter((chat) =>
    activeTab === 'messages' ? chat.type === 'landlord' : chat.type === 'group'
  );

  const handleChatPress = (chat: typeof MOCK_CHATS[0]) => {
    if (chat.type === 'group') {
      router.push(`/group/${chat.id}`);
    } else {
      router.push(`/chat/${chat.id}`);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'messages' && styles.tabActive]}
          onPress={() => setActiveTab('messages')}
        >
          <MessageCircle
            size={20}
            color={activeTab === 'messages' ? '#3B82F6' : '#6B7280'}
          />
          <Text style={[styles.tabText, activeTab === 'messages' && styles.tabTextActive]}>
            Messages
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'groups' && styles.tabActive]}
          onPress={() => setActiveTab('groups')}
        >
          <Users size={20} color={activeTab === 'groups' ? '#3B82F6' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'groups' && styles.tabTextActive]}>
            Groups
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notifications' && styles.tabActive]}
          onPress={() => setActiveTab('notifications')}
        >
          <Bell size={20} color={activeTab === 'notifications' ? '#3B82F6' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'notifications' && styles.tabTextActive]}>
            Alerts
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.chatList} showsVerticalScrollIndicator={false}>
        {activeTab === 'notifications' ? (
          <View style={styles.emptyState}>
            <Bell size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>You&apos;re all caught up!</Text>
          </View>
        ) : filteredChats.length === 0 ? (
          <View style={styles.emptyState}>
            <MessageCircle size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No conversations</Text>
            <Text style={styles.emptySubtitle}>
              Start chatting with landlords from property details
            </Text>
          </View>
        ) : (
          filteredChats.map((chat) => (
            <TouchableOpacity key={chat.id} style={styles.chatItem} onPress={() => handleChatPress(chat)}>
              <View style={styles.chatAvatar}>
                <Text style={styles.chatAvatarText}>{chat.name.charAt(0)}</Text>
                {chat.type === 'landlord' && chat.online && <View style={styles.onlineIndicator} />}
              </View>
              <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                  <Text style={styles.chatName} numberOfLines={1}>
                    {chat.name}
                  </Text>
                  <Text style={styles.chatTime}>{chat.time}</Text>
                </View>
                <View style={styles.chatFooter}>
                  <Text style={styles.chatMessage} numberOfLines={1}>
                    {chat.lastMessage}
                  </Text>
                  {chat.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{chat.unread}</Text>
                    </View>
                  )}
                </View>
                {chat.type === 'group' && (
                  <Text style={styles.memberCount}>{chat.members} members</Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#111827',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  tabActive: {
    backgroundColor: '#EFF6FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#3B82F6',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    gap: 12,
  },
  chatAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative' as const,
  },
  chatAvatarText: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute' as const,
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    flex: 1,
  },
  chatTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  chatFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatMessage: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  memberCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});
