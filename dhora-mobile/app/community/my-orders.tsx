import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, MapPin, QrCode, Package } from 'lucide-react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { useCommunityBuyStore } from '../../src/stores/communityBuyStore';
import { PickupQrModal } from '../../src/components/community/PickupQrModal';
import { Badge } from '../../src/components/common/Badge';
import { EmptyState } from '../../src/components/common/EmptyState';
import { CommunityBuyOrder, CommunityBuyPost } from '../../src/types/communityBuy';

export default function MyCommunityOrdersScreen() {
  const router = useRouter();
  const { isDarkMode, theme } = useThemeStore();
  const { myOrders, fetchMyOrders, loading } = useCommunityBuyStore();

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const openPickupPass = (order: CommunityBuyOrder) => {
    const post = order.postId as CommunityBuyPost;
    setSelectedOrder({
      pickupUniqueCode: order.pickupUniqueCode,
      productName: post?.productName || 'Group Buy Item',
      status: order.status,
      publicPickupLocation: post?.publicPickupLocation,
      pickupInstructions: post?.pickupInstructions,
      size: order.size,
      color: order.color,
      quantity: order.quantity,
    });
    setModalVisible(true);
  };

  const renderOrderItem = ({ item }: { item: CommunityBuyOrder }) => {
    const post = item.postId as CommunityBuyPost;
    const isCollected = item.status === 'COLLECTED';

    return (
      <View
        style={[
          styles.orderCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.codeBadge, { color: theme.accent }]}>
            Token: {item.pickupUniqueCode}
          </Text>
          <Badge
            label={item.status.replace(/_/g, ' ')}
            variant={isCollected ? 'success' : 'default'}
          />
        </View>

        <View style={styles.itemRow}>
          {post?.productImageUrl && (
            <Image
              source={{ uri: post.productImageUrl }}
              style={styles.productImg}
              resizeMode="cover"
            />
          )}
          <View style={{ flex: 1 }}>
            <Text style={[styles.productTitle, { color: theme.textPrimary }]} numberOfLines={2}>
              {post?.productName || 'Group Order Product'}
            </Text>
            <Text style={[styles.variantText, { color: theme.textSecondary }]}>
              Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
            </Text>
            <Text style={[styles.priceText, { color: theme.textPrimary }]}>
              Total: ৳{item.totalPrice}
            </Text>
          </View>
        </View>

        {post?.publicPickupLocation && (
          <View style={styles.locationRow}>
            <MapPin size={14} color="#3B82F6" />
            <Text
              style={[styles.locationText, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {post.publicPickupLocation}
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={() => openPickupPass(item)}
          style={[styles.passBtn, { borderColor: theme.accent }]}
        >
          <QrCode size={16} color={theme.accent} />
          <Text style={[styles.passBtnText, { color: theme.accent }]}>
            View Pickup Pass & Token
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View
        style={[
          styles.topBar,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: theme.textPrimary }]}>
          My Group Orders
        </Text>
        <View style={{ width: 32 }} />
      </View>

      {loading && myOrders.length === 0 ? (
        <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={myOrders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={
            <EmptyState
              icon={<Package size={40} color={theme.accent} />}
              title="No Group Orders Yet"
              description="Join an active community order to save on parcel courier charges with neighbors."
            />
          }
        />
      )}

      {/* Pickup Pass Modal */}
      <PickupQrModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        order={selectedOrder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  orderCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  codeBadge: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  productImg: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  variantText: {
    fontSize: 12,
    marginBottom: 4,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 12,
    flex: 1,
  },
  passBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  passBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
