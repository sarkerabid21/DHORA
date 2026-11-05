import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ShoppingBag,
  Repeat,
  Users,
  Search,
  Sparkles,
  Clock,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  ExternalLink,
  Plus,
  Camera,
  Image as ImageIcon,
  RefreshCw,
  X,
  Layers,
  Lightbulb,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useThemeStore } from '../../src/stores/themeStore';
import { useBeforeYouBuyStore } from '../../src/stores/beforeYouBuyStore';
import { useRentalStore } from '../../src/stores/rentalStore';
import { useShoppingStore } from '../../src/stores/shoppingStore';
import { useCommunityBuyStore } from '../../src/stores/communityBuyStore';
import { CountdownTimer } from '../../src/components/community/CountdownTimer';
import { JoinOrderModal } from '../../src/components/community/JoinOrderModal';
import { CommunityBuyPost } from '../../src/types/communityBuy';
import { RentalCard } from '../../src/components/rental/RentalCard';
import { CreateRentalModal } from '../../src/components/rental/CreateRentalModal';
import { Card } from '../../src/components/common/Card';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import { TopNavbar } from '../../src/components/common/TopNavbar';
import { SPACING, RADIUS } from '../../src/constants/theme';

const { width } = Dimensions.get('window');

type DiscoverTab = 'COMMUNITY' | 'RENT' | 'BEFORE_BUY' | 'SHOP';

const PROSPECTIVE_PRODUCTS = [
  {
    name: 'Unstructured Charcoal Linen Blazer',
    category: 'OUTERWEAR',
    primaryColor: 'Charcoal Grey',
    price: 3600,
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600',
  },
  {
    name: 'Minimal Black Mandarin Shirt',
    category: 'TOPS',
    primaryColor: 'Charcoal Black',
    price: 2100,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
  },
  {
    name: 'Clean White Low-Top Sneakers',
    category: 'FOOTWEAR',
    primaryColor: 'White',
    price: 2800,
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600',
  },
];

export default function DiscoverScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const { theme } = useThemeStore();
  const [activeTab, setActiveTab] = useState<DiscoverTab>('RENT');

  // Stores
  const {
    currentAnalysis,
    analyzeProduct,
    isAnalyzing,
    saveCurrentToWishlist,
  } = useBeforeYouBuyStore();

  const { listings, bookings, fetchListings } = useRentalStore();
  const { products, selectedCategory, setSelectedCategory } = useShoppingStore();
  const {
    posts: communityPosts,
    fetchFeed: fetchCommunityFeed,
    joinOrder: joinCommunityOrder,
    loading: communityLoading,
  } = useCommunityBuyStore();

  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [isSavedToWishlist, setIsSavedToWishlist] = useState(false);
  const [selectedAreaFilter, setSelectedAreaFilter] = useState('All');
  const [joiningPost, setJoiningPost] = useState<CommunityBuyPost | null>(null);
  const [showCreateRentalModal, setShowCreateRentalModal] = useState(false);

  // Custom Before-You-Buy State
  const [customItemName, setCustomItemName] = useState('');
  const [customCategory, setCustomCategory] = useState<string>('TOPS');
  const [customColor, setCustomColor] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customImageUri, setCustomImageUri] = useState<string | null>(null);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);

  const handlePickCustomGallery = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Photo library access is needed to select an item image.'
        );
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.85,
        base64: true,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        const uri = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        setCustomImageUri(uri);
      }
    } catch (err: any) {
      Alert.alert('Error', 'Could not open photo gallery.');
    }
  };

  const handleCaptureCustomCamera = async () => {
    try {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Camera access is needed to photograph prospective items.'
        );
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.85,
        base64: true,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        const uri = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        setCustomImageUri(uri);
      }
    } catch (err: any) {
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  const handleAnalyzeCustom = async () => {
    if (!customItemName.trim()) {
      Alert.alert(
        'Item Name Required',
        'Please enter the clothing/garment name you are thinking of buying.'
      );
      return;
    }
    const effectiveImage =
      customImageUri ||
      customImageUrl.trim() ||
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600';

    setIsSavedToWishlist(false);
    await analyzeProduct({
      productName: customItemName.trim(),
      imageUrl: effectiveImage,
      category: customCategory,
      primaryColor: customColor.trim() || undefined,
      price: customPrice ? Number(customPrice) : undefined,
    });
  };

  React.useEffect(() => {
    if (params.tab === 'before-buy') setActiveTab('BEFORE_BUY');
    else if (params.tab === 'rent') {
      setActiveTab('RENT');
      fetchListings();
    } else if (params.tab === 'community') {
      setActiveTab('COMMUNITY');
      setSelectedAreaFilter('All');
      fetchCommunityFeed();
    } else if (params.tab === 'shop') setActiveTab('SHOP');
  }, [params.tab]);

  React.useEffect(() => {
    if (activeTab === 'COMMUNITY') {
      fetchCommunityFeed(selectedAreaFilter === 'All' ? undefined : selectedAreaFilter);
    } else if (activeTab === 'RENT') {
      fetchListings();
    }
  }, [activeTab, selectedAreaFilter]);

  const handleRunAnalysis = async (index: number) => {
    setSelectedProductIndex(index);
    setIsSavedToWishlist(false);
    const prod = PROSPECTIVE_PRODUCTS[index];
    await analyzeProduct({
      productName: prod.name,
      imageUrl: prod.imageUrl,
      category: prod.category,
      primaryColor: prod.primaryColor,
      price: prod.price,
    });
  };

  const handleSaveWishlist = async () => {
    await saveCurrentToWishlist();
    setIsSavedToWishlist(true);
    Alert.alert('Saved to Wishlist! 🔖', 'Product added to your Before-You-Buy evaluation list.');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Universal DHORA Top Navigation Bar */}
      <TopNavbar subtitle="Discover • Rent, Buy & Community" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Discover
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Fashion shopping, peer rentals & community bulk orders
        </Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}
        >
          <TouchableOpacity
            onPress={() => setActiveTab('RENT')}
            style={[
              styles.tabPill,
              {
                backgroundColor:
                  activeTab === 'RENT' ? theme.accent : theme.surface,
                borderColor:
                  activeTab === 'RENT' ? theme.accent : theme.border,
              },
            ]}
          >
            <Repeat
              size={15}
              color={activeTab === 'RENT' ? '#FFFFFF' : theme.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'RENT' ? '#FFFFFF' : theme.textPrimary },
              ]}
            >
              DHORA Rent
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('BEFORE_BUY')}
            style={[
              styles.tabPill,
              {
                backgroundColor:
                  activeTab === 'BEFORE_BUY' ? theme.accent : theme.surface,
                borderColor:
                  activeTab === 'BEFORE_BUY' ? theme.accent : theme.border,
              },
            ]}
          >
            <Sparkles
              size={15}
              color={activeTab === 'BEFORE_BUY' ? '#FFFFFF' : theme.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === 'BEFORE_BUY' ? '#FFFFFF' : theme.textPrimary,
                },
              ]}
            >
              Before You Buy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('SHOP')}
            style={[
              styles.tabPill,
              {
                backgroundColor:
                  activeTab === 'SHOP' ? theme.accent : theme.surface,
                borderColor:
                  activeTab === 'SHOP' ? theme.accent : theme.border,
              },
            ]}
          >
            <ShoppingBag
              size={15}
              color={activeTab === 'SHOP' ? '#FFFFFF' : theme.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'SHOP' ? '#FFFFFF' : theme.textPrimary },
              ]}
            >
              Fashion Shopping
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('COMMUNITY')}
            style={[
              styles.tabPill,
              {
                backgroundColor:
                  activeTab === 'COMMUNITY' ? theme.accent : theme.surface,
                borderColor:
                  activeTab === 'COMMUNITY' ? theme.accent : theme.border,
              },
            ]}
          >
            <Users
              size={15}
              color={activeTab === 'COMMUNITY' ? '#FFFFFF' : theme.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === 'COMMUNITY' ? '#FFFFFF' : theme.textPrimary,
                },
              ]}
            >
              Community Buy
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* SUBMODULE 1: DHORA Rent */}
        {activeTab === 'RENT' && (
          <View>
            {/* Active Bookings Alert Banner */}
            {bookings.length > 0 && (
              <Card style={styles.bookingStatusBanner}>
                <TouchableOpacity
                  onPress={() => router.push('/rental/manage-bookings' as any)}
                  style={styles.bookingBannerRow}
                >
                  <View style={[styles.bookingIconBadge, { backgroundColor: theme.accentLight }]}>
                    <Repeat size={18} color={theme.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.bookingBannerTitle, { color: theme.textPrimary }]}>
                      Active Booking: {bookings[0].status.replace(/_/g, ' ')}
                    </Text>
                    <Text style={[styles.bookingBannerSub, { color: theme.textSecondary }]}>
                      {bookings[0].totalDays} Days • Escrow held securely. Tap to view stepper & inspection reports.
                    </Text>
                  </View>
                  <ChevronRight size={18} color={theme.textTertiary} />
                </TouchableOpacity>
              </Card>
            )}

            <Card style={styles.bannerCard}>
              <Badge label="Peer Wardrobe Rental" variant="success" />
              <Text style={[styles.bannerTitle, { color: theme.textPrimary, marginTop: 6 }]}>
                Rent High-End Festive & Event Wear
              </Text>
              <Text style={[styles.bannerSub, { color: theme.textSecondary }]}>
                Avoid buying expensive single-use occasion garments. Verified peer-to-peer wardrobe sharing with 7-stage escrow protection.
              </Text>
            </Card>

            {/* List Clothes for Rent Action Button */}
            <TouchableOpacity
              onPress={() => setShowCreateRentalModal(true)}
              style={[
                styles.rentOutBtn,
                { backgroundColor: theme.accent, borderColor: theme.accent },
              ]}
              activeOpacity={0.85}
            >
              <View style={styles.rentOutBtnRow}>
                <View style={styles.rentOutIconBadge}>
                  <Plus size={18} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rentOutBtnTitle}>
                    + List Clothes for Rent (ভাড়া দিন)
                  </Text>
                  <Text style={styles.rentOutBtnSub}>
                    Choose from your closet or photograph an item to earn rental income
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeading, { color: theme.textPrimary, marginBottom: 0 }]}>
                Available Rentals ({listings.length})
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/rental/manage-bookings' as any)}
              >
                <Text style={[styles.manageLink, { color: theme.accent }]}>
                  Manage Rentals →
                </Text>
              </TouchableOpacity>
            </View>

            {listings.map((item) => (
              <RentalCard key={item._id} listing={item} />
            ))}
          </View>
        )}

        {/* SUBMODULE 2: Before You Buy */}
        {activeTab === 'BEFORE_BUY' && (
          <View>
            <Card style={styles.bannerCard}>
              <Badge label="AI Closet Advisor & Duplicate Guard" variant="accent" />
              <Text style={[styles.bannerTitle, { color: theme.textPrimary, marginTop: 6 }]}>
                Before You Spend, Test Your Wardrobe
              </Text>
              <Text style={[styles.bannerSub, { color: theme.textSecondary }]}>
                দোকানে বা অনলাইনে যে জামা পছন্দ হয়েছে তার ছবি তুলুন বা আপলোড করুন। DHORA AI আপনার আলমারি চেক করে বলে দেবে এমন জামা আপনার আগে থেকেই আছে নাকি, এটা কেনা ঠিক হবে নাকি, এবং দারুণ স্টাইলিং পরামর্শ দেবে!
              </Text>
            </Card>

            {/* Custom Item Upload / Photograph Section */}
            <Card style={[styles.uploadItemCard, { backgroundColor: theme.surface }]}>
              <View style={styles.uploadCardHeader}>
                <View style={[styles.uploadCardIconBadge, { backgroundColor: theme.accent + '20' }]}>
                  <Sparkles size={18} color={theme.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.uploadCardTitle, { color: theme.textPrimary }]}>
                    Upload Prospective Purchase
                  </Text>
                  <Text style={[styles.uploadCardSub, { color: theme.textSecondary }]}>
                    Take a live photo or upload from gallery
                  </Text>
                </View>
              </View>

              {/* Photo Upload Area */}
              {customImageUri ? (
                <View style={styles.uploadedPreviewBox}>
                  <Image source={{ uri: customImageUri }} style={styles.uploadedPreviewImg} />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => setCustomImageUri(null)}
                  >
                    <X size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                  <View style={styles.imageReadyBadge}>
                    <CheckCircle2 size={13} color="#FFFFFF" />
                    <Text style={styles.imageReadyText}>Photo Ready</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.uploadActionsRow}>
                  <TouchableOpacity
                    style={[styles.uploadActionBtn, { borderColor: theme.border, backgroundColor: theme.surfaceVariant }]}
                    onPress={handleCaptureCustomCamera}
                    activeOpacity={0.8}
                  >
                    <Camera size={20} color={theme.accent} />
                    <Text style={[styles.uploadActionText, { color: theme.textPrimary }]}>
                      Take Photo
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.uploadActionBtn, { borderColor: theme.border, backgroundColor: theme.surfaceVariant }]}
                    onPress={handlePickCustomGallery}
                    activeOpacity={0.8}
                  >
                    <ImageIcon size={20} color={theme.accent} />
                    <Text style={[styles.uploadActionText, { color: theme.textPrimary }]}>
                      Choose Gallery
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Optional URL Toggle */}
              {!customImageUri && (
                <View style={{ marginTop: 6, marginBottom: 8 }}>
                  <TouchableOpacity
                    onPress={() => setShowCustomUrlInput(!showCustomUrlInput)}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    <Text style={{ fontSize: 12, color: theme.accent, fontWeight: '600' }}>
                      {showCustomUrlInput ? '− Hide Image URL' : '+ Or paste Image URL'}
                    </Text>
                  </TouchableOpacity>
                  {showCustomUrlInput && (
                    <TextInput
                      style={[styles.inputField, { backgroundColor: theme.surfaceVariant, color: theme.textPrimary, borderColor: theme.border, marginTop: 6 }]}
                      placeholder="https://... (Image link)"
                      placeholderTextColor={theme.textSecondary}
                      value={customImageUrl}
                      onChangeText={setCustomImageUrl}
                    />
                  )}
                </View>
              )}

              {/* Garment Name Input */}
              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>
                  Garment / Item Name *
                </Text>
                <TextInput
                  style={[styles.inputField, { backgroundColor: theme.surfaceVariant, color: theme.textPrimary, borderColor: theme.border }]}
                  placeholder="e.g., Black Slim Oxford Shirt, Olive Cargo Pants"
                  placeholderTextColor={theme.textSecondary}
                  value={customItemName}
                  onChangeText={setCustomItemName}
                />
              </View>

              {/* Category Chips */}
              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>
                  Category
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                  {[
                    { key: 'TOPS', label: 'Tops (শার্ট/টি-শার্ট)' },
                    { key: 'BOTTOMS', label: 'Bottoms (প্যান্ট/চিনোস)' },
                    { key: 'OUTERWEAR', label: 'Outerwear (জ্যাকেট/হুডি)' },
                    { key: 'TRADITIONAL', label: 'Traditional (পাঞ্জাবি)' },
                    { key: 'FOOTWEAR', label: 'Footwear (জুতো)' },
                  ].map((cat) => {
                    const isSelected = customCategory === cat.key;
                    return (
                      <TouchableOpacity
                        key={cat.key}
                        onPress={() => setCustomCategory(cat.key)}
                        style={[
                          styles.catChip,
                          {
                            backgroundColor: isSelected ? theme.accent : theme.surfaceVariant,
                            borderColor: isSelected ? theme.accent : theme.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.catChipText,
                            { color: isSelected ? '#FFFFFF' : theme.textPrimary, fontWeight: isSelected ? '700' : '500' },
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* 2-Column: Color & Price */}
              <View style={styles.twoColRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>
                    Color (রং)
                  </Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: theme.surfaceVariant, color: theme.textPrimary, borderColor: theme.border }]}
                    placeholder="e.g., Black, Olive"
                    placeholderTextColor={theme.textSecondary}
                    value={customColor}
                    onChangeText={setCustomColor}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>
                    Price ৳ (দাম)
                  </Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: theme.surfaceVariant, color: theme.textPrimary, borderColor: theme.border }]}
                    placeholder="e.g., 1850"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                    value={customPrice}
                    onChangeText={setCustomPrice}
                  />
                </View>
              </View>

              <Button
                title={isAnalyzing ? 'Analyzing with Wardrobe & AI... ✨' : 'Analyze with My Wardrobe ⚡'}
                variant="accent"
                size="lg"
                loading={isAnalyzing}
                onPress={handleAnalyzeCustom}
                icon={<Sparkles size={18} color="#FFFFFF" />}
                style={{ marginTop: SPACING.md }}
              />
            </Card>

            {/* Analysis Result Card */}
            {currentAnalysis && (
              <Card style={[styles.analysisResultCard, { borderColor: currentAnalysis.verdict === 'SKIP_DUPLICATE' ? '#EF4444' : currentAnalysis.verdict === 'CONSIDER_ALTERNATIVE' ? '#F59E0B' : '#10B981', borderWidth: 1.5 }]}>
                
                {/* Verdict Banner */}
                <View
                  style={[
                    styles.verdictBanner,
                    {
                      backgroundColor:
                        currentAnalysis.verdict === 'SKIP_DUPLICATE'
                          ? '#FEF2F2'
                          : currentAnalysis.verdict === 'CONSIDER_ALTERNATIVE'
                          ? '#FFFBEB'
                          : '#ECFDF5',
                      borderColor:
                        currentAnalysis.verdict === 'SKIP_DUPLICATE'
                          ? '#F87171'
                          : currentAnalysis.verdict === 'CONSIDER_ALTERNATIVE'
                          ? '#FCD34D'
                          : '#6EE7B7',
                    },
                  ]}
                >
                  <View style={styles.verdictIconRow}>
                    {currentAnalysis.verdict === 'SKIP_DUPLICATE' ? (
                      <AlertTriangle size={20} color="#DC2626" />
                    ) : currentAnalysis.verdict === 'CONSIDER_ALTERNATIVE' ? (
                      <AlertTriangle size={20} color="#D97706" />
                    ) : (
                      <CheckCircle2 size={20} color="#059669" />
                    )}
                    <Text
                      style={[
                        styles.verdictTitle,
                        {
                          color:
                            currentAnalysis.verdict === 'SKIP_DUPLICATE'
                              ? '#991B1B'
                              : currentAnalysis.verdict === 'CONSIDER_ALTERNATIVE'
                              ? '#92400E'
                              : '#065F46',
                        },
                      ]}
                    >
                      {currentAnalysis.verdict === 'SKIP_DUPLICATE'
                        ? '🚫 SKIP / DUPLICATE WARNING'
                        : currentAnalysis.verdict === 'CONSIDER_ALTERNATIVE'
                        ? '⚠️ CONSIDER ALTERNATIVE'
                        : '✅ RECOMMENDED PURCHASE'}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.verdictSub,
                      {
                        color:
                          currentAnalysis.verdict === 'SKIP_DUPLICATE'
                            ? '#B91C1C'
                            : currentAnalysis.verdict === 'CONSIDER_ALTERNATIVE'
                            ? '#B45309'
                            : '#047857',
                      },
                    ]}
                  >
                    {currentAnalysis.verdict === 'SKIP_DUPLICATE'
                      ? 'Apnar wardrobe-e already similar item ache! Notun kore eta na kine opochoy theke bachte paren.'
                      : currentAnalysis.verdict === 'CONSIDER_ALTERNATIVE'
                      ? 'Kinar agey onno kono color ba style consider korun jate wardrobe aro versatile hoy.'
                      : 'Wardrobe gap fill korbe ebong apnar existing clothes-er shathe versatile look toiri korbe!'}
                  </Text>
                </View>

                {/* Product Summary Header */}
                <View style={styles.resultHeader}>
                  <Image
                    source={{ uri: currentAnalysis.imageUrl }}
                    style={styles.resultImage}
                  />
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={[styles.resultProdName, { color: theme.textPrimary }]}>
                      {currentAnalysis.productName}
                    </Text>
                    {currentAnalysis.estimatedPrice ? (
                      <Text style={[styles.resultPrice, { color: theme.accent }]}>
                        ৳{currentAnalysis.estimatedPrice} • {currentAnalysis.category}
                      </Text>
                    ) : (
                      <Text style={[styles.resultPrice, { color: theme.accent }]}>
                        {currentAnalysis.category}
                      </Text>
                    )}
                    <Badge
                      label={currentAnalysis.recommendationBadge}
                      variant={
                        currentAnalysis.recommendationBadge === 'Fits Your Wardrobe' ||
                        currentAnalysis.verdict === 'BUY'
                          ? 'success'
                          : currentAnalysis.recommendationBadge === 'Similar Item Already Exists' ||
                            currentAnalysis.verdict === 'SKIP_DUPLICATE'
                          ? 'error'
                          : 'warning'
                      }
                    />
                  </View>
                </View>

                {/* AI Valuable Styling Comment (Short & Punchy Bengali) */}
                <View style={[styles.aiCommentCard, { backgroundColor: theme.surfaceVariant, borderColor: theme.accent }]}>
                  <View style={styles.aiCommentHeader}>
                    <Sparkles size={16} color={theme.accent} />
                    <Text style={[styles.aiCommentTitle, { color: theme.accent }]}>
                      DHORA AI Verdict (পরামর্শ)
                    </Text>
                  </View>
                  <Text style={[styles.aiCommentBody, { color: theme.textPrimary }]}>
                    {currentAnalysis.aiValuableComment || currentAnalysis.stylingRationale}
                  </Text>
                </View>

                {/* Duplicate Alert Warning */}
                {currentAnalysis.similarItemNames && currentAnalysis.similarItemNames.length > 0 && (
                  <View style={styles.duplicateWarning}>
                    <AlertTriangle size={16} color="#DC2626" />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.duplicateWarningTitle, { color: '#991B1B' }]}>
                        Wardrobe Duplication Detected:
                      </Text>
                      <Text style={styles.duplicateWarningText}>
                        You already own "{currentAnalysis.similarItemNames.join(', ')}". Buying this adds duplicate style without unlocking new looks.
                      </Text>
                    </View>
                  </View>
                )}

                {/* Compatibility Metrics */}
                <View style={styles.metricsRow}>
                  <View style={[styles.metricBox, { backgroundColor: theme.surfaceVariant }]}>
                    <Text style={[styles.metricVal, { color: theme.accent }]}>
                      {currentAnalysis.compatibilityScore}%
                    </Text>
                    <Text style={[styles.metricLbl, { color: theme.textSecondary }]}>
                      Closet Compatibility
                    </Text>
                  </View>

                  <View style={[styles.metricBox, { backgroundColor: theme.surfaceVariant }]}>
                    <Text style={[styles.metricVal, { color: '#059669' }]}>
                      +{currentAnalysis.newCombinationsCount}
                    </Text>
                    <Text style={[styles.metricLbl, { color: theme.textSecondary }]}>
                      New Outfits Created
                    </Text>
                  </View>
                </View>

                {/* Pairings from Existing Closet */}
                {currentAnalysis.compatibleItemsSample && currentAnalysis.compatibleItemsSample.length > 0 && (
                  <View style={{ marginVertical: SPACING.xs }}>
                    <Text style={[styles.compatSampleHeading, { color: theme.textSecondary }]}>
                      Pairs with your existing clothes:
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 6 }}>
                      {currentAnalysis.compatibleItemsSample.map((item, idx) => (
                        <View key={idx} style={[styles.compatItemBox, { backgroundColor: theme.surfaceVariant, borderColor: theme.border }]}>
                          <Image source={{ uri: item.imageUrl }} style={styles.compatItemImg} />
                          <Text numberOfLines={1} style={[styles.compatItemName, { color: theme.textPrimary }]}>
                            {item.name}
                          </Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <Button
                  title={isSavedToWishlist ? 'Saved in Wishlist 🔖' : 'Save to Wishlist'}
                  variant={isSavedToWishlist ? 'secondary' : 'accent'}
                  size="md"
                  onPress={handleSaveWishlist}
                  icon={<Bookmark size={16} color={isSavedToWishlist ? theme.accent : '#FFFFFF'} />}
                  style={{ marginTop: SPACING.sm }}
                />
              </Card>
            )}

            {/* Presets Quick Test Row */}
            <View style={{ marginTop: SPACING.md }}>
              <Text style={[styles.sectionHeading, { color: theme.textPrimary, marginBottom: 8 }]}>
                Or Quick Test with Ready Items:
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.prospectiveRow}
              >
                {PROSPECTIVE_PRODUCTS.map((prod, idx) => {
                  const isSelected = selectedProductIndex === idx;
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleRunAnalysis(idx)}
                      style={[
                        styles.prospectThumb,
                        {
                          borderColor: isSelected ? theme.accent : theme.border,
                          borderWidth: isSelected ? 2.5 : 1,
                        },
                      ]}
                    >
                      <Image source={{ uri: prod.imageUrl }} style={styles.prospectImage} />
                      <View style={styles.prospectLabelBox}>
                        <Text numberOfLines={1} style={styles.prospectLabelText}>
                          {prod.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        )}

        {/* SUBMODULE 3: Fashion Shopping */}
        {activeTab === 'SHOP' && (
          <View>
            <Card style={styles.bannerCard}>
              <Badge label="Curated Bangladesh Fashion" variant="default" />
              <Text style={[styles.bannerTitle, { color: theme.textPrimary, marginTop: 6 }]}>
                Local Ethical Designers & Brands
              </Text>
              <Text style={[styles.bannerSub, { color: theme.textSecondary }]}>
                Explore timeless staples and contemporary designs from verified merchants (Aarong, Sailor, Taaga, Klothe, Apex).
              </Text>
            </Card>

            <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
              Featured Catalog ({products.length} Items)
            </Text>

            {products.map((prod) => (
              <Card key={prod._id} style={styles.productCard}>
                <Image source={{ uri: prod.images[0] }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <View style={styles.merchantRow}>
                    <Text style={[styles.merchantName, { color: theme.accent }]}>
                      {prod.merchantName}
                    </Text>
                    <Badge label={prod.category} variant="default" />
                  </View>

                  <Text style={[styles.productTitle, { color: theme.textPrimary }]}>
                    {prod.title}
                  </Text>
                  <Text numberOfLines={2} style={[styles.productDesc, { color: theme.textSecondary }]}>
                    {prod.description}
                  </Text>

                  <View style={styles.productFooter}>
                    <View>
                      <Text style={[styles.productPrice, { color: theme.textPrimary }]}>
                        ৳{prod.discountPrice || prod.price}
                      </Text>
                      {prod.discountPrice ? (
                        <Text style={[styles.productOriginalPrice, { color: theme.textTertiary }]}>
                          ৳{prod.price}
                        </Text>
                      ) : null}
                    </View>

                    <Button
                      title="Buy at Store"
                      variant="accent"
                      size="sm"
                      icon={<ExternalLink size={14} color="#FFFFFF" />}
                      iconPosition="right"
                      onPress={() => Linking.openURL(prod.affiliateUrl)}
                    />
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* SUBMODULE 4: Community Buy */}
        {activeTab === 'COMMUNITY' && (
          <View>
            <Card style={styles.bannerCard}>
              <View style={styles.bannerRow}>
                <View style={{ flex: 1 }}>
                  <Badge label="Time-Limited Group Orders" variant="accent" />
                  <Text style={[styles.bannerTitle, { color: theme.textPrimary, marginTop: 6 }]}>
                    Split Courier Fees with Neighbors
                  </Text>
                  <Text style={[styles.bannerSub, { color: theme.textSecondary }]}>
                    Join bulk orders closing in 2 to 6 hours. Collect at safe public pickup points with unique verification passes.
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                    <Button
                      title="Launch Order"
                      variant="accent"
                      size="sm"
                      icon={<Plus size={14} color="#FFFFFF" />}
                      onPress={() => router.push('/community/create')}
                    />
                    <Button
                      title="My Orders & Tokens"
                      variant="outline"
                      size="sm"
                      onPress={() => router.push('/community/my-orders')}
                    />
                  </View>
                </View>
              </View>
            </Card>

            {/* Target Area Filters */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, marginBottom: 12 }}
            >
              {['All', 'Dhaka (Dhanmondi)', 'Dhaka (DU Campus)', 'Dhaka (Gulshan)', 'Dhaka (Uttara)'].map((area) => {
                const isSelected = selectedAreaFilter === area;
                return (
                  <TouchableOpacity
                    key={area}
                    onPress={() => setSelectedAreaFilter(area)}
                    style={[
                      styles.tabPill,
                      {
                        backgroundColor: isSelected ? theme.accent : theme.surface,
                        borderColor: isSelected ? theme.accent : theme.border,
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                      ]}
                    >
                      {area}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
              Active Nearby Orders ({communityPosts.length})
            </Text>

            {communityPosts.map((post) => {
              const isClosed =
                post.status === 'ORDER_CLOSED' ||
                new Date() >= new Date(post.closingAt);

              return (
                <Card key={post._id} style={styles.postCard}>
                  <TouchableOpacity
                    onPress={() => router.push(`/community/${post._id}`)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.postHeader}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={[styles.productName, { color: theme.textPrimary }]}>
                          {post.productName}
                        </Text>
                        <Text style={[styles.creatorName, { color: theme.textSecondary }]}>
                          📍 {post.targetArea}
                        </Text>
                      </View>
                      <CountdownTimer closingAt={post.closingAt} compact />
                    </View>

                    <Image
                      source={{ uri: post.productImageUrl }}
                      style={styles.postImage}
                    />
                  </TouchableOpacity>

                  <View style={styles.postDetails}>
                    <View style={styles.detailRow}>
                      <Text style={[styles.priceText, { color: theme.textPrimary }]}>
                        ৳ {post.unitPrice}{' '}
                        <Text style={{ fontSize: 11, color: '#10B981', fontWeight: '700' }}>
                          (Saves ৳{post.deliverySavingPerPerson} delivery)
                        </Text>
                      </Text>
                      <Badge
                        label={`${post.confirmedOrdersCount} / ${post.maxParticipants} Joined`}
                        variant={post.confirmedOrdersCount >= post.maxParticipants ? 'error' : 'default'}
                      />
                    </View>

                    <View style={styles.pickupLocation}>
                      <MapPin size={14} color={theme.accent} />
                      <Text
                        style={[styles.pickupText, { color: theme.textSecondary }]}
                        numberOfLines={1}
                      >
                        Public Pickup: {post.publicPickupLocation}
                      </Text>
                    </View>

                    <View style={styles.postActions}>
                      <Button
                        title={isClosed ? 'Order Closed' : 'Join Group Order'}
                        variant="accent"
                        size="md"
                        disabled={isClosed || post.confirmedOrdersCount >= post.maxParticipants}
                        onPress={() => setJoiningPost(post)}
                        style={{ flex: 1 }}
                      />
                      <Button
                        title={`💬 ${post.commentsCount || 0} Questions`}
                        variant="outline"
                        size="md"
                        onPress={() => router.push(`/community/${post._id}`)}
                      />
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Quick Join Modal */}
      {joiningPost && (
        <JoinOrderModal
          visible={!!joiningPost}
          onClose={() => setJoiningPost(null)}
          post={joiningPost}
          onJoin={async (data) => {
            const res = await joinCommunityOrder(joiningPost._id, data);
            if (res.success) {
              Alert.alert(
                'Joined Group Order! 🎉',
                `Pickup token: ${res.data?.order?.pickupUniqueCode}. Show it at ${joiningPost.publicPickupLocation} upon delivery.`
              );
            } else {
              Alert.alert('Error', res.message || 'Could not join order.');
            }
          }}
        />
      )}

      {/* Create / List Clothes for Rent Modal */}
      <CreateRentalModal
        visible={showCreateRentalModal}
        onClose={() => setShowCreateRentalModal(false)}
        onSuccess={() => {
          fetchListings();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rentOutBtn: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  rentOutBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rentOutIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rentOutBtnTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  rentOutBtnSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  tabBarContainer: {
    marginVertical: SPACING.sm,
  },
  tabBar: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  bannerCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  bannerRow: {
    flexDirection: 'row',
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  bannerSub: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  bookingStatusBanner: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  bookingBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  bookingIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  bookingBannerSub: {
    fontSize: 11,
    lineHeight: 15,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  manageLink: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  prospectiveRow: {
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  prospectThumb: {
    width: 120,
    height: 120,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
  },
  prospectImage: {
    width: '100%',
    height: '100%',
  },
  prospectLabelBox: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    padding: 4,
  },
  prospectLabelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  analysisResultCard: {
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  resultHeader: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  resultImage: {
    width: 80,
    height: 90,
    borderRadius: RADIUS.md,
  },
  resultProdName: {
    fontSize: 15,
    fontWeight: '700',
  },
  resultPrice: {
    fontSize: 13,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  metricBox: {
    flex: 1,
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '800',
  },
  metricLbl: {
    fontSize: 10,
    marginTop: 2,
  },
  rationaleBox: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  rationaleTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  rationaleBody: {
    fontSize: 12,
    lineHeight: 17,
  },
  duplicateWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: SPACING.sm + 2,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  duplicateWarningTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  duplicateWarningText: {
    fontSize: 11,
    color: '#991B1B',
    fontWeight: '500',
    lineHeight: 16,
  },
  uploadItemCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  uploadCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  uploadCardIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadCardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  uploadCardSub: {
    fontSize: 11,
    marginTop: 2,
  },
  uploadedPreviewBox: {
    position: 'relative',
    width: '100%',
    height: 160,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  uploadedPreviewImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageReadyBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(5, 150, 105, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  imageReadyText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  uploadActionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  uploadActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  uploadActionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: SPACING.sm,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  inputField: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  catChipText: {
    fontSize: 12,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  verdictBanner: {
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  verdictIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  verdictTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  verdictSub: {
    fontSize: 12,
    lineHeight: 17,
  },
  aiCommentCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderLeftWidth: 4,
    marginBottom: SPACING.sm,
  },
  aiCommentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  aiCommentTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aiCommentBody: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
  },
  compatSampleHeading: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  compatItemBox: {
    width: 80,
    alignItems: 'center',
    padding: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  compatItemImg: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.sm,
    marginBottom: 4,
  },
  compatItemName: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  productCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  productImage: {
    width: '100%',
    height: 180,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  productInfo: {
    gap: 4,
  },
  merchantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  merchantName: {
    fontSize: 12,
    fontWeight: '700',
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  productDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  productOriginalPrice: {
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  postCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
  },
  creatorName: {
    fontSize: 11,
    marginTop: 2,
  },
  postImage: {
    width: '100%',
    height: 180,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  postDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
  },
  pickupLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 4,
  },
  pickupText: {
    fontSize: 11,
  },
  postActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
});
