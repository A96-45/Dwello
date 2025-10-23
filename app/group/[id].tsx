import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {  Send, Image as ImageIcon, Paperclip, Users, ArrowLeft } from 'lucide-react-native';

interface GroupMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isMe: boolean;
}

const MOCK_GROUP_MESSAGES: GroupMessage[] = [
  {
    id: '1',
    senderId: 'landlord',
    senderName: 'John Kamau (Landlord)',
    content: 'Welcome to Westlands Apartments community group! Feel free to reach out if you need anything.',
    timestamp: new Date(Date.now() - 7200000),
    isMe: false,
  },
  {
    id: '2',
    senderId: 'tenant1',
    senderName: 'Sarah M.',
    content: 'Hi everyone! Just moved into Unit 3B. Excited to be here!',
    timestamp: new Date(Date.now() - 5400000),
    isMe: false,
  },
  {
    id: '3',
    senderId: 'me',
    senderName: 'You',
    content: 'Welcome Sarah!',
    timestamp: new Date(Date.now() - 4800000),
    isMe: true,
  },
  {
    id: '4',
    senderId: 'tenant2',
    senderName: 'Peter K.',
    content: 'Anyone knows a good plumber? My sink is clogged.',
    timestamp: new Date(Date.now() - 3600000),
    isMe: false,
  },
  {
    id: '5',
    senderId: 'tenant3',
    senderName: 'Mary W.',
    content: 'I can recommend someone! Let me DM you their number.',
    timestamp: new Date(Date.now() - 2400000),
    isMe: false,
  },
  {
    id: '6',
    senderId: 'landlord',
    senderName: 'John Kamau (Landlord)',
    content: 'Reminder: Rent is due on the 1st of each month. Please pay via M-Pesa to 0712345678.',
    timestamp: new Date(Date.now() - 1200000),
    isMe: false,
  },
];

export default function GroupChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [messages, setMessages] = useState<GroupMessage[]>(MOCK_GROUP_MESSAGES);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const handleSend = useCallback(() => {
    if (inputText.trim()) {
      const newMessage: GroupMessage = {
        id: Date.now().toString(),
        senderId: 'me',
        senderName: 'You',
        content: inputText.trim(),
        timestamp: new Date(),
        isMe: true,
      };
      setMessages(prev => [...prev, newMessage]);
      setInputText('');
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [inputText]);

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const renderMessage = ({ item }: { item: GroupMessage }) => (
    <View style={[styles.messageContainer, item.isMe ? styles.myMessage : styles.theirMessage]}>
      {!item.isMe && (
        <Text style={styles.senderName}>{item.senderName}</Text>
      )}
      <View style={[styles.messageBubble, item.isMe ? styles.myMessageBubble : styles.theirMessageBubble]}>
        <Text style={[styles.messageText, item.isMe ? styles.myMessageText : styles.theirMessageText]}>
          {item.content}
        </Text>
        <Text style={[styles.timestamp, item.isMe ? styles.myTimestamp : styles.theirTimestamp]}>
          {formatTime(item.timestamp)}
        </Text>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Westlands Apartments',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity style={styles.headerAction}>
              <Users size={22} color="#111827" />
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={[styles.container, { paddingBottom: insets.bottom }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <View style={styles.groupInfo}>
          <Text style={styles.groupInfoText}>42 members</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Paperclip size={22} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.attachButton}>
            <ImageIcon size={22} color="#6B7280" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Message Westlands Apartments..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Send size={20} color={inputText.trim() ? '#FFFFFF' : '#9CA3AF'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerAction: {
    padding: 4,
  },
  groupInfo: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },
  groupInfoText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  theirMessage: {
    alignSelf: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600' as const,
    marginBottom: 4,
    marginLeft: 12,
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '100%',
  },
  myMessageBubble: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  theirMessageText: {
    color: '#111827',
  },
  timestamp: {
    fontSize: 11,
    alignSelf: 'flex-end',
  },
  myTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  theirTimestamp: {
    color: '#9CA3AF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  attachButton: {
    padding: 8,
    marginBottom: 4,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    fontSize: 15,
    color: '#111827',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
});
