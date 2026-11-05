import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import {
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  HelpCircle,
  Eye,
  CheckCircle2,
} from 'lucide-react-native';
import { GroundedOutfit } from '../../types/stylist';
import { useThemeStore } from '../../stores/themeStore';
import { useStylistStore } from '../../stores/stylistStore';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { RADIUS, SPACING } from '../../constants/theme';

export interface OutfitCardProps {
  outfit: GroundedOutfit;
  onPreview?: (outfit: GroundedOutfit) => void;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({
  outfit,
  onPreview,
}) => {
  const { theme } = useThemeStore();
  const { savedLooks, saveOutfit, unsaveOutfit, submitFeedback } =
    useStylistStore();

  const [showRationale, setShowRationale] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'LIKE' | 'DISLIKE' | null>(
    null
  );

  const isSaved = savedLooks.some(
    (l) => l._id === outfit._id || l.title === outfit.title
  );

  const handleToggleSave = () => {
    if (isSaved) {
      if (outfit._id) unsaveOutfit(outfit._id);
    } else {
      saveOutfit(outfit);
    }
  };

  const handleFeedback = (rating: 'LIKE' | 'DISLIKE') => {
    setFeedbackGiven(rating);
    if (outfit._id) {
      submitFeedback(outfit._id, rating);
    }
  };

  return (
    <Card style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: SPACING.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Sparkles size={16} color={theme.accent} />
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              {outfit.title}
            </Text>
          </View>
          <Text style={[styles.occasion, { color: theme.accent }]}>
            {outfit.occasion}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleToggleSave}
          style={[
            styles.saveBtn,
            {
              backgroundColor: isSaved
                ? theme.accentLight
                : theme.surfaceVariant,
            },
          ]}
        >
          <Bookmark
            size={18}
            color={isSaved ? theme.accent : theme.textSecondary}
            fill={isSaved ? theme.accent : 'none'}
          />
        </TouchableOpacity>
      </View>

      {/* Grounded In Closet Verification Badge */}
      <View style={styles.badgeRow}>
        <Badge label="100% In Closet" variant="success" />
        <Text style={[styles.itemCountText, { color: theme.textSecondary }]}>
          {outfit.items.length} items
        </Text>
      </View>

      {/* Items Visual Carousel / Row */}
      <View style={styles.itemsRow}>
        {outfit.items.map((item, idx) => (
          <View
            key={idx}
            style={[
              styles.itemCard,
              { backgroundColor: theme.surfaceVariant },
            ]}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.itemImage}
              resizeMode="cover"
            />
            <Text
              numberOfLines={1}
              style={[styles.itemName, { color: theme.textPrimary }]}
            >
              {item.name}
            </Text>
            <Text style={[styles.itemRole, { color: theme.textSecondary }]}>
              {item.role}
            </Text>
          </View>
        ))}
      </View>

      {/* Styling Rationale */}
      {showRationale && (
        <View
          style={[
            styles.rationaleBox,
            { backgroundColor: theme.surfaceVariant },
          ]}
        >
          <Text style={[styles.rationaleTitle, { color: theme.textPrimary }]}>
            💡 Gemini Stylist Rationale:
          </Text>
          <Text style={[styles.rationaleText, { color: theme.textSecondary }]}>
            {outfit.rationale}
          </Text>
        </View>
      )}

      {/* Card Action Controls */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={() => setShowRationale(!showRationale)}
          style={[styles.actionBtn, { borderColor: theme.border }]}
        >
          <HelpCircle size={14} color={theme.textSecondary} />
          <Text style={[styles.actionBtnText, { color: theme.textSecondary }]}>
            {showRationale ? 'Hide Rationale' : 'Why This Outfit?'}
          </Text>
        </TouchableOpacity>

        {onPreview && (
          <TouchableOpacity
            onPress={() => onPreview(outfit)}
            style={[styles.actionBtn, { borderColor: theme.border }]}
          >
            <Eye size={14} color={theme.accent} />
            <Text style={[styles.actionBtnText, { color: theme.accent }]}>
              Preview
            </Text>
          </TouchableOpacity>
        )}

        {/* Like & Dislike Feedback */}
        <View style={styles.feedbackButtons}>
          <TouchableOpacity
            onPress={() => handleFeedback('LIKE')}
            style={[
              styles.thumbBtn,
              {
                backgroundColor:
                  feedbackGiven === 'LIKE'
                    ? '#ECFDF5'
                    : theme.surfaceVariant,
              },
            ]}
          >
            <ThumbsUp
              size={14}
              color={feedbackGiven === 'LIKE' ? '#059669' : theme.textSecondary}
              fill={feedbackGiven === 'LIKE' ? '#059669' : 'none'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleFeedback('DISLIKE')}
            style={[
              styles.thumbBtn,
              {
                backgroundColor:
                  feedbackGiven === 'DISLIKE'
                    ? '#FEF2F2'
                    : theme.surfaceVariant,
              },
            ]}
          >
            <ThumbsDown
              size={14}
              color={feedbackGiven === 'DISLIKE' ? '#DC2626' : theme.textSecondary}
              fill={feedbackGiven === 'DISLIKE' ? '#DC2626' : 'none'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  occasion: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  saveBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  itemCountText: {
    fontSize: 11,
    fontWeight: '500',
  },
  itemsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  itemCard: {
    flex: 1,
    padding: 6,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  itemImage: {
    width: '100%',
    height: 68,
    borderRadius: RADIUS.sm,
    marginBottom: 4,
  },
  itemName: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  itemRole: {
    fontSize: 9,
    marginTop: 1,
  },
  rationaleBox: {
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  rationaleTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  rationaleText: {
    fontSize: 11,
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  thumbBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
