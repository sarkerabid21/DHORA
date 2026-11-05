import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  Sparkles,
  Send,
  Bookmark,
  RefreshCw,
  Compass,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../../src/stores/themeStore';
import { useStylistStore } from '../../src/stores/stylistStore';
import { OutfitCard } from '../../src/components/stylist/OutfitCard';
import { OutfitPreviewModal } from '../../src/components/stylist/OutfitPreviewModal';
import { GroundedOutfit } from '../../src/types/stylist';
import { TopNavbar } from '../../src/components/common/TopNavbar';
import { SPACING, RADIUS } from '../../src/constants/theme';

const PROMPT_SUGGESTIONS = [
  'What should I wear to university today?',
  'Suggest a smart casual outfit for 29°C weather',
  'Style my black mandarin shirt',
  'Outfit for a dinner party with friends',
];

export default function StylistScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { chatMessages, isTyping, sendMessage, savedLooks } =
    useStylistStore();

  const [inputText, setInputText] = useState('');
  const [previewOutfit, setPreviewOutfit] = useState<GroundedOutfit | null>(null);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    setInputText('');
    await sendMessage(text.trim());
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Universal DHORA Top Navigation Bar */}
      <TopNavbar subtitle="AI Personal Stylist" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View
            style={[
              styles.sparkleCircle,
              { backgroundColor: theme.accentLight },
            ]}
          >
            <Sparkles size={20} color={theme.accent} />
          </View>
          <View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              DHORA AI Stylist
            </Text>
            <Text style={[styles.statusText, { color: theme.accent }]}>
              ● Grounded in Your Closet
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/outfit/saved')}
          style={[styles.savedLooksBtn, { backgroundColor: theme.surfaceVariant }]}
        >
          <Bookmark size={15} color={theme.textPrimary} />
          <Text style={[styles.savedLooksCount, { color: theme.textPrimary }]}>
            {savedLooks.length} Saved
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Messages Stream */}
        <ScrollView
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {chatMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageBubbleContainer,
                  isUser ? styles.userMsgContainer : styles.aiMsgContainer,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isUser
                      ? [styles.userBubble, { backgroundColor: theme.textPrimary }]
                      : [
                          styles.aiBubble,
                          {
                            backgroundColor: theme.surface,
                            borderColor: theme.border,
                          },
                        ],
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      { color: isUser ? '#FFFFFF' : theme.textPrimary },
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>

                {/* Structured Visual Outfit Recommendation Card */}
                {msg.outfit && (
                  <View style={{ width: '100%', marginTop: SPACING.sm }}>
                    <OutfitCard
                      outfit={msg.outfit}
                      onPreview={(outfit) => setPreviewOutfit(outfit)}
                    />
                  </View>
                )}
              </View>
            );
          })}

          {isTyping && (
            <View style={styles.typingContainer}>
              <ActivityIndicator size="small" color={theme.accent} />
              <Text style={[styles.typingText, { color: theme.textSecondary }]}>
                DHORA AI is matching combinations from your closet...
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Quick Suggestion Chips */}
        <View style={styles.suggestionsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsScroll}
          >
            {PROMPT_SUGGESTIONS.map((prompt, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleSend(prompt)}
                style={[
                  styles.suggestionChip,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <Text style={[styles.suggestionText, { color: theme.textPrimary }]}>
                  {prompt}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View
          style={[
            styles.inputBar,
            { backgroundColor: theme.surface, borderTopColor: theme.border },
          ]}
        >
          <TextInput
            placeholder="Ask DHORA to style an outfit..."
            placeholderTextColor={theme.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend()}
            style={[styles.inputField, { color: theme.textPrimary }]}
          />
          <TouchableOpacity
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
            style={[
              styles.sendBtn,
              {
                backgroundColor: inputText.trim()
                  ? theme.accent
                  : theme.surfaceVariant,
              },
            ]}
          >
            <Send
              size={18}
              color={inputText.trim() ? '#FFFFFF' : theme.textTertiary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Outfit Preview Modal */}
      <OutfitPreviewModal
        visible={!!previewOutfit}
        outfit={previewOutfit}
        onClose={() => setPreviewOutfit(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm + 2,
  },
  sparkleCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  savedLooksBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  savedLooksCount: {
    fontSize: 11,
    fontWeight: '600',
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.md,
  },
  messageBubbleContainer: {
    marginBottom: SPACING.md,
    maxWidth: '92%',
  },
  userMsgContainer: {
    alignSelf: 'flex-end',
  },
  aiMsgContainer: {
    alignSelf: 'flex-start',
    width: '100%',
  },
  messageBubble: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.lg,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: SPACING.xs,
  },
  typingText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    paddingVertical: SPACING.xs,
  },
  suggestionsScroll: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  suggestionChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    gap: SPACING.sm,
  },
  inputField: {
    flex: 1,
    height: 44,
    fontSize: 14,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
