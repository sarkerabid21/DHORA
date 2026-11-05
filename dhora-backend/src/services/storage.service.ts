import fs from 'fs';
import path from 'path';

export interface StorageData {
  users: any[];
  userProfiles: any[];
  clothingItems: any[];
  conversations: any[];
  savedOutfits: any[];
  plannerEvents: any[];
  notifications: any[];
  communityPosts: any[];
  rentals: any[];
  otps?: { [email: string]: { otp: string; expiresAt: number; fullName?: string; passwordHash?: string; type?: string } };
}

const DB_FILE_PATH = path.resolve(__dirname, '../../data/dhora_db.json');

const DEFAULT_RENTALS = [
  {
    _id: 'listing_rent_1',
    title: 'Heritage Silk Jamdani Panjabi with Antique Embroidery',
    description: 'Worn once for brother wedding. Genuine Dhakai Jamdani handloom silk with gold zari needlework. Hand-dry cleaned and in impeccable condition.',
    category: 'TRADITIONAL',
    size: '40 (M)',
    condition: 'LIKE_NEW',
    dailyRentalPrice: 650,
    securityDeposit: 1500,
    minRentalDays: 2,
    maxRentalDays: 7,
    locationArea: 'Dhaka (Dhanmondi)',
    pickupAddressInstruction: 'Meet at Dhanmondi 27 Star Kabab or Courier available via Pathao Parcel.',
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'],
    status: 'AVAILABLE',
    rating: 4.9,
    reviewsCount: 6,
    ownerId: { email: 'sultana.begum@dhora.fashion' },
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'listing_rent_2',
    title: 'Bespoke Charcoal Double-Breasted Wool Tuxedo',
    description: 'Custom tailored Italian wool blend tuxedo with silk satin peak lapels. Ideal for corporate galas and wedding receptions.',
    category: 'OUTERWEAR',
    size: '38R (M)',
    condition: 'LIKE_NEW',
    dailyRentalPrice: 1200,
    securityDeposit: 3000,
    minRentalDays: 2,
    maxRentalDays: 5,
    locationArea: 'Dhaka (Gulshan)',
    pickupAddressInstruction: 'Gulshan 2 Pink City shopping arcade pickup point.',
    images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600'],
    status: 'AVAILABLE',
    rating: 5.0,
    reviewsCount: 4,
    ownerId: { email: 'fahim.chowdhury@dhora.fashion' },
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'listing_rent_3',
    title: 'Handcrafted Crimson Benarasi Katan Bridal Saree',
    description: 'Authentic Mirpur Benarasi Katan saree with heavy floral jaal border. Perfect for festive weddings.',
    category: 'TRADITIONAL',
    size: 'Free Size',
    condition: 'BRAND_NEW',
    dailyRentalPrice: 1800,
    securityDeposit: 4000,
    minRentalDays: 3,
    maxRentalDays: 7,
    locationArea: 'Dhaka (Mirpur)',
    pickupAddressInstruction: 'Mirpur 10 Benarasi Polli verified pickup point.',
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'],
    status: 'AVAILABLE',
    rating: 4.8,
    reviewsCount: 3,
    ownerId: { email: 'afia.rahman@dhora.fashion' },
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'listing_rent_4',
    title: 'Royal Maroon Velvet Embroidered Sherwani',
    description: 'Luxury zardozi work handcrafted velvet groom / groomsman sherwani with brooch and churidar.',
    category: 'TRADITIONAL',
    size: '42 (L)',
    condition: 'LIKE_NEW',
    dailyRentalPrice: 1500,
    securityDeposit: 3500,
    minRentalDays: 2,
    maxRentalDays: 5,
    locationArea: 'Dhaka (Banani)',
    pickupAddressInstruction: 'Banani 11 verified handover point or courier delivery.',
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600'],
    status: 'AVAILABLE',
    rating: 5.0,
    reviewsCount: 5,
    ownerId: { email: 'tanvir.hasan@dhora.fashion' },
    createdAt: new Date().toISOString(),
  },
];

class StorageService {
  private data: StorageData = {
    users: [],
    userProfiles: [],
    clothingItems: [],
    conversations: [],
    savedOutfits: [],
    plannerEvents: [],
    notifications: [],
    communityPosts: [],
    rentals: [],
    otps: {},
  };

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        if (raw.trim()) {
          this.data = { ...this.data, ...JSON.parse(raw) };
        }
      } else {
        this.save();
      }
      if (!this.data.rentals || this.data.rentals.length === 0) {
        this.data.rentals = [...DEFAULT_RENTALS];
        this.save();
      }
    } catch (err) {
      console.warn('[StorageService] Error reading database file:', err);
    }
  }

  public save(): void {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[StorageService] Error writing database file:', err);
    }
  }

  // --- Users ---
  public findUserByEmail(email: string): any | undefined {
    return this.data.users.find(
      (u) => u.email?.toLowerCase() === email?.toLowerCase()
    );
  }

  public findUserById(id: string): any | undefined {
    return this.data.users.find((u) => u._id === id || u.id === id);
  }

  public createUser(userData: any): any {
    const newUser = {
      _id: userData._id || `user_${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public updateUser(id: string, updates: any): any {
    const index = this.data.users.findIndex((u) => u._id === id || u.id === id);
    if (index !== -1) {
      this.data.users[index] = {
        ...this.data.users[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.save();
      return this.data.users[index];
    }
    return null;
  }

  // --- Wardrobe ---
  public getWardrobeItems(userId: string): any[] {
    return this.data.clothingItems.filter((i) => i.userId === userId);
  }

  public addWardrobeItem(itemData: any): any {
    const newItem = {
      _id: itemData._id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: 'AVAILABLE',
      isFavorite: false,
      timesWorn: 0,
      createdAt: new Date().toISOString(),
      ...itemData,
    };
    this.data.clothingItems.unshift(newItem);
    this.save();
    return newItem;
  }

  public updateWardrobeItem(id: string, userId: string, updates: any): any {
    const index = this.data.clothingItems.findIndex(
      (i) => i._id === id && i.userId === userId
    );
    if (index !== -1) {
      this.data.clothingItems[index] = {
        ...this.data.clothingItems[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.save();
      return this.data.clothingItems[index];
    }
    return null;
  }

  public deleteWardrobeItem(id: string, userId?: string): boolean {
    const prevLen = this.data.clothingItems.length;
    this.data.clothingItems = this.data.clothingItems.filter(
      (i) => i._id !== id
    );
    if (this.data.clothingItems.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Conversations & Chat ---
  public getConversation(convId: string, userId: string): any {
    let conv = this.data.conversations.find(
      (c) => c._id === convId || c.id === convId
    );
    if (!conv) {
      conv = {
        _id: convId,
        userId,
        messages: [],
        createdAt: new Date().toISOString(),
      };
      this.data.conversations.push(conv);
      this.save();
    }
    return conv;
  }

  public addMessage(convId: string, userId: string, message: { sender: string; text: string; outfit?: any }): void {
    const conv = this.getConversation(convId, userId);
    conv.messages.push({
      ...message,
      createdAt: new Date().toISOString(),
    });
    this.save();
  }

  // --- Saved Outfits ---
  public getSavedOutfits(userId: string): any[] {
    return this.data.savedOutfits.filter((o) => o.userId === userId);
  }

  public saveOutfit(userId: string, outfit: any): any {
    const newLook = {
      _id: outfit._id || `look_${Date.now()}`,
      userId,
      isFavorite: true,
      savedAt: new Date().toISOString(),
      ...outfit,
    };
    this.data.savedOutfits.unshift(newLook);
    this.save();
    return newLook;
  }

  public unsaveOutfit(id: string, userId: string): boolean {
    const prevLen = this.data.savedOutfits.length;
    this.data.savedOutfits = this.data.savedOutfits.filter(
      (o) => !(o._id === id && o.userId === userId)
    );
    if (this.data.savedOutfits.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Planner Calendar Events ---
  public getPlannerEvents(userId: string): any[] {
    return this.data.plannerEvents.filter((e) => e.userId === userId);
  }

  public addPlannerEvent(eventData: any): any {
    const newEvent = {
      _id: eventData._id || `event_${Date.now()}`,
      isWornConfirmed: false,
      createdAt: new Date().toISOString(),
      ...eventData,
    };
    this.data.plannerEvents.unshift(newEvent);
    this.save();
    return newEvent;
  }

  public deletePlannerEvent(id: string, userId: string): boolean {
    const prevLen = this.data.plannerEvents.length;
    this.data.plannerEvents = this.data.plannerEvents.filter(
      (e) => !(e._id === id && e.userId === userId)
    );
    if (this.data.plannerEvents.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  public confirmPlannerEvent(id: string, userId: string): any {
    const event = this.data.plannerEvents.find(
      (e) => e._id === id && e.userId === userId
    );
    if (event) {
      event.isWornConfirmed = true;
      event.confirmedAt = new Date().toISOString();
      this.save();
      return event;
    }
    return null;
  }

  // --- DHORA Rent & Listings ---
  public getRentalListings(category?: string, search?: string): any[] {
    let list = this.data.rentals || [];
    if (category && category !== 'ALL' && category !== 'All') {
      list = list.filter((l) => l.category?.toUpperCase() === category.toUpperCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) => l.title?.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getRentalListingById(id: string): any {
    return (this.data.rentals || []).find((l) => l._id === id);
  }

  public saveRentalListing(listing: any): any {
    if (!this.data.rentals) this.data.rentals = [];
    const item = {
      _id: listing._id || `listing_rent_${Date.now()}`,
      rating: 5.0,
      reviewsCount: 0,
      status: 'AVAILABLE',
      createdAt: new Date().toISOString(),
      ...listing,
    };
    this.data.rentals.unshift(item);
    this.save();
    return item;
  }

  // --- Community Buy Posts ---
  public getCommunityPosts(targetArea?: string): any[] {
    let list = this.data.communityPosts || [];
    if (targetArea) {
      const q = targetArea.toLowerCase();
      list = list.filter((p) => p.targetArea?.toLowerCase().includes(q));
    }
    return list;
  }

  public getCommunityPostById(id: string): any {
    return (this.data.communityPosts || []).find((p) => p._id === id);
  }

  public saveCommunityPost(post: any): any {
    if (!this.data.communityPosts) this.data.communityPosts = [];
    const item = {
      _id: post._id || `group_buy_${Date.now()}`,
      confirmedOrdersCount: 1,
      commentsCount: 0,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      ...post,
    };
    this.data.communityPosts.unshift(item);
    this.save();
    return item;
  }

  // --- OTP Verification ---
  public saveOtp(
    email: string,
    otp: string,
    metadata?: { fullName?: string; passwordHash?: string; type?: string }
  ): void {
    const normalized = email.toLowerCase().trim();
    if (!this.data.otps) this.data.otps = {};
    this.data.otps[normalized] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes validity
      ...metadata,
    };
    this.save();
  }

  public getOtp(
    email: string
  ): { otp: string; expiresAt: number; fullName?: string; passwordHash?: string; type?: string } | undefined {
    const normalized = email.toLowerCase().trim();
    if (!this.data.otps) return undefined;
    const record = this.data.otps[normalized];
    if (record && Date.now() > record.expiresAt) {
      delete this.data.otps[normalized];
      this.save();
      return undefined;
    }
    return record;
  }

  public verifyOtp(
    email: string,
    code: string
  ): { valid: boolean; metadata?: any; message?: string } {
    const normalized = email.toLowerCase().trim();
    const record = this.getOtp(normalized);
    if (!record) {
      return {
        valid: false,
        message: 'Verification code has expired or was not requested. Please request a new code.',
      };
    }
    if (record.otp !== code.trim()) {
      return {
        valid: false,
        message: 'Incorrect verification code. Please check and try again.',
      };
    }
    if (this.data.otps) {
      delete this.data.otps[normalized];
    }
    this.save();
    return { valid: true, metadata: record };
  }

  public removeOtp(email: string): void {
    const normalized = email.toLowerCase().trim();
    if (this.data.otps && this.data.otps[normalized]) {
      delete this.data.otps[normalized];
      this.save();
    }
  }
}

export const storageService = new StorageService();
