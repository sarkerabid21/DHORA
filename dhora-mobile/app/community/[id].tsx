import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  MapPin,
  Tag,
  Users,
  MessageSquare,
  Heart,
  Send,
  AlertTriangle,
} from 'lucide-react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { useCommunityBuyStore } from '../../src/stores/communityBuyStore';
import { CountdownTimer } from '../../src/components/community/CountdownTimer';
import { JoinOrderModal } from '../../src/components/community/JoinOrderModal';
import { Button } from '../../src/components/common/Button';
import { Badge } from '../../src/components/common/Badge';

export default function CommunityBuyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDarkMode, theme } = useThemeStore();

  const {
    activePost,
    loading,
    comments,
    commentsLoading,
    fetchPostDetails,
    fetchComments,
    addComment,
    likeComment,
    joinOrder,
  } = useCommunityBuyStore();

  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (id) {
      fetchPostDetails(id);
      fetchComments(id);
    }
  }, [id]);

  if (loading || !activePost) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading group order...
        </Text>
      </View>
    );
  }

  const isClosed =
    activePost.status === 'ORDER_CLOSED' ||
    new Date() >= new Date(activePost.closingAt);

  const spotsRemaining = Math.max(
    0,
    activePost.maxParticipants - activePost.confirmedOrdersCount
  );
  const progressPercent = Math.min(
    100,
    (activePost.confirmedOrdersCount / activePost.maxParticipants) * 100
  );

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    try {
      setPostingComment(true);
      await addComment(activePost._id, commentText, replyingTo?.id);
      setCommentText('');
      setReplyingTo(null);
      setPostingComment(false);
    } catch (err: any) {
      setPostingComment(false);
      Alert.alert('Error', err.message || 'Could not post comment.');
    }
  };

  const handleJoinOrder = async (orderData: {
    size: string;
    color: string;
    quantity: number;
    contactPhone: string;
  }) => {
    const res = await joinOrder(activePost._id, orderData);
    if (res.success) {
      Alert.alert(
        'Order Confirmed! 🎉',
        `You have joined this group order. Your unique pickup token is ${res.data?.order?.pickupUniqueCode}. Save delivery fees and collect together!`
      );
    } else {
      Alert.alert('Failed to Join', res.message || 'Could not place order.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      <View
        style={[
          styles.topBar,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          Group Order Details
        </Text>
        <Badge
          label={isClosed ? 'Closed' : 'Active'}
          variant={isClosed ? 'error' : 'accent'}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Product Image */}
        <Image
          source={{ uri: activePost.productImageUrl }}
          style={styles.productImage}
          resizeMode="cover"
        />

        <View style={styles.content}>
          {/* Tagline & Title */}
          <Text style={[styles.productName, { color: theme.textPrimary }]}>
            {activePost.productName}
          </Text>

          {/* Pricing & Courier Saving */}
          <View style={styles.priceRow}>
            <View>
              <Text style={[styles.unitPrice, { color: theme.accent }]}>
                ৳{activePost.unitPrice}
              </Text>
              <Text style={[styles.perUnitLabel, { color: theme.textSecondary }]}>
                Per piece price
              </Text>
            </View>

            <View
              style={[
                styles.savingBadge,
                { backgroundColor: isDarkMode ? '#132E22' : '#DCFCE7' },
              ]}
            >
              <Tag size={14} color="#16A34A" />
              <Text style={[styles.savingText, { color: '#16A34A' }]}>
                Save ৳{activePost.deliverySavingPerPerson} Courier
              </Text>
            </View>
          </View>

          {/* Countdown Clock */}
          <CountdownTimer closingAt={activePost.closingAt} />

          {/* Order Progress */}
          <View
            style={[
              styles.progressCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View style={styles.progressHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Users size={16} color={theme.accent} />
                <Text style={[styles.progressTitle, { color: theme.textPrimary }]}>
                  Participant Progress
                </Text>
              </View>
              <Text style={[styles.spotsLeft, { color: theme.textSecondary }]}>
                {spotsRemaining} spot{spotsRemaining === 1 ? '' : 's'} left
              </Text>
            </View>

            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercent}%`, backgroundColor: theme.accent },
                ]}
              />
            </View>

            <Text style={[styles.progressSubtext, { color: theme.textSecondary }]}>
              {activePost.confirmedOrdersCount} of {activePost.maxParticipants} orders confirmed
            </Text>
          </View>

          {/* Public Pickup Safety Banner */}
          <View
            style={[
              styles.safetyLocationCard,
              {
                backgroundColor: isDarkMode ? '#132135' : '#EFF6FF',
                borderColor: '#3B82F6',
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <MapPin size={20} color="#2563EB" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.locationHeading, { color: '#1D4ED8' }]}>
                  Verified Public Pickup Point
                </Text>
                <Text style={[styles.locationVenue, { color: theme.textPrimary }]}>
                  {activePost.publicPickupLocation}
                </Text>
                <Text style={[styles.targetAreaText, { color: theme.textSecondary }]}>
                  Target Area: {activePost.targetArea}
                </Text>
                {activePost.pickupInstructions && (
                  <Text style={[styles.pickupNotes, { color: theme.textSecondary }]}>
                    📌 {activePost.pickupInstructions}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Discussion / Comments Section */}
          <View style={styles.commentsSection}>
            <View style={styles.commentsHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MessageSquare size={18} color={theme.textPrimary} />
                <Text style={[styles.commentsTitle, { color: theme.textPrimary }]}>
                  Community Discussion ({comments.length})
                </Text>
              </View>
            </View>

            {/* Invariant Note */}
            <View
              style={[
                styles.commentNotice,
                {
                  backgroundColor: isDarkMode ? '#222216' : '#FEF9C3',
                  borderColor: '#EAB308',
                },
              ]}
            >
              <AlertTriangle size={14} color="#CA8A04" />
              <Text style={[styles.commentNoticeText, { color: isDarkMode ? '#FEF08A' : '#854D0E' }]}>
                Important: Asking questions or commenting here does NOT place an order.
                To join the combined parcel, tap "Join Order" below.
              </Text>
            </View>

            {/* Comments List */}
            {commentsLoading ? (
              <ActivityIndicator size="small" color={theme.accent} style={{ marginVertical: 16 }} />
            ) : comments.length === 0 ? (
              <Text style={[styles.emptyComments, { color: theme.textSecondary }]}>
                No questions yet. Be the first to ask the host!
              </Text>
            ) : (
              comments.map((c) => (
                <View
                  key={c._id}
                  style={[
                    styles.commentBubble,
                    {
                      backgroundColor: theme.surface,
                      borderColor: c.isCreatorReply ? theme.accent : theme.border,
                    },
                  ]}
                >
                  <View style={styles.commentHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.authorName, { color: theme.textPrimary }]}>
                        {c.authorName}
                      </Text>
                      {c.isCreatorReply && (
                        <View style={[styles.creatorBadge, { backgroundColor: theme.accent }]}>
                          <Text style={styles.creatorBadgeText}>Host</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.commentDate, { color: theme.textSecondary }]}>
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>

                  <Text style={[styles.commentBody, { color: theme.textPrimary }]}>
                    {c.content}
                  </Text>

                  <View style={styles.commentActions}>
                    <TouchableOpacity
                      onPress={() => likeComment(c._id)}
                      style={styles.actionBtn}
                    >
                      <Heart size={14} color={c.likesCount > 0 ? '#EF4444' : theme.textSecondary} />
                      <Text style={[styles.actionText, { color: theme.textSecondary }]}>
                        {c.likesCount || 0}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setReplyingTo({ id: c._id, name: c.authorName })}
                      style={styles.actionBtn}
                    >
                      <Text style={[styles.actionText, { color: theme.accent }]}>
                        Reply
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}

            {/* Replying banner */}
            {replyingTo && (
              <View style={[styles.replyBanner, { backgroundColor: theme.surface }]}>
                <Text style={{ fontSize: 12, color: theme.textSecondary }}>
                  Replying to <Text style={{ fontWeight: '700', color: theme.textPrimary }}>{replyingTo.name}</Text>
                </Text>
                <TouchableOpacity onPress={() => setReplyingTo(null)}>
                  <Text style={{ fontSize: 12, color: '#EF4444' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Comment Input */}
            <View
              style={[
                styles.commentInputRow,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <TextInput
                style={[styles.commentInput, { color: theme.textPrimary }]}
                placeholder={replyingTo ? `Reply to ${replyingTo.name}...` : 'Ask a question about this item...'}
                placeholderTextColor={theme.textSecondary}
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity
                onPress={handleSendComment}
                disabled={postingComment || !commentText.trim()}
                style={[
                  styles.sendBtn,
                  {
                    backgroundColor: commentText.trim() ? theme.accent : theme.border,
                  },
                ]}
              >
                {postingComment ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Send size={16} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Join Action */}
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: theme.surface, borderTopColor: theme.border },
        ]}
      >
        <View>
          <Text style={[styles.bottomPrice, { color: theme.textPrimary }]}>
            ৳{activePost.unitPrice}
          </Text>
          <Text style={[styles.bottomSave, { color: '#10B981' }]}>
            Save ৳{activePost.deliverySavingPerPerson} on shipping
          </Text>
        </View>

        <Button
          title={isClosed ? 'Order Closed' : 'Join Order'}
          variant="accent"
          disabled={isClosed || spotsRemaining <= 0}
          onPress={() => setJoinModalVisible(true)}
          style={{ minWidth: 150 }}
        />
      </View>

      {/* Join Order Modal */}
      <JoinOrderModal
        visible={joinModalVisible}
        onClose={() => setJoinModalVisible(false)}
        post={activePost}
        onJoin={handleJoinOrder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 6,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginHorizontal: 10,
  },
  productImage: {
    width: '100%',
    height: 280,
  },
  content: {
    padding: 16,
  },
  productName: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  unitPrice: {
    fontSize: 24,
    fontWeight: '900',
  },
  perUnitLabel: {
    fontSize: 11,
    marginTop: 1,
  },
  savingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  savingText: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  spotsLeft: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 11,
  },
  safetyLocationCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 6,
  },
  locationHeading: {
    fontSize: 13,
    fontWeight: '800',
  },
  locationVenue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  targetAreaText: {
    fontSize: 12,
    marginTop: 2,
  },
  pickupNotes: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
  commentsSection: {
    marginTop: 18,
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  commentNotice: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  commentNoticeText: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  emptyComments: {
    textAlign: 'center',
    paddingVertical: 16,
    fontSize: 13,
  },
  commentBubble: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
  },
  creatorBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  creatorBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  commentDate: {
    fontSize: 11,
  },
  commentBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  replyBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    height: 40,
    fontSize: 13,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  bottomPrice: {
    fontSize: 18,
    fontWeight: '800',
  },
  bottomSave: {
    fontSize: 11,
    fontWeight: '700',
  },
});
