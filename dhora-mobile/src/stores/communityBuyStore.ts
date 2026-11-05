import { create } from 'zustand';
import { api } from '../services/api';
import { CommunityBuyPost, CommunityBuyOrder, CommunityBuyComment } from '../types/communityBuy';

interface CommunityBuyState {
  posts: CommunityBuyPost[];
  activePost: CommunityBuyPost | null;
  activePostCreator: { fullName: string; locationArea: string; avatarUrl?: string } | null;
  activePostOrdersCount: number;
  comments: CommunityBuyComment[];
  myOrders: CommunityBuyOrder[];
  loading: boolean;
  commentsLoading: boolean;
  error: string | null;

  fetchFeed: (targetArea?: string) => Promise<void>;
  fetchPostDetails: (postId: string) => Promise<void>;
  createPost: (postData: {
    productName: string;
    productUrl?: string;
    productImageUrl: string;
    unitPrice: number;
    deliverySavingPerPerson?: number;
    targetArea: string;
    publicPickupLocation: string;
    pickupInstructions?: string;
    availableSizes: string[];
    availableColors: string[];
    durationMinutes: number;
    maxParticipants: number;
  }) => Promise<{ success: boolean; data?: CommunityBuyPost; message?: string }>;
  joinOrder: (
    postId: string,
    orderData: { size: string; color: string; quantity: number; contactPhone: string }
  ) => Promise<{ success: boolean; data?: any; message?: string }>;
  fetchComments: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string, parentCommentId?: string) => Promise<{ success: boolean; message?: string }>;
  likeComment: (commentId: string) => Promise<void>;
  fetchMyOrders: () => Promise<void>;
  verifyPickupCode: (pickupCode: string) => Promise<{ success: boolean; message?: string; data?: any }>;
}

export const useCommunityBuyStore = create<CommunityBuyState>((set, get) => ({
  posts: [],
  activePost: null,
  activePostCreator: null,
  activePostOrdersCount: 0,
  comments: [],
  myOrders: [],
  loading: false,
  commentsLoading: false,
  error: null,

  fetchFeed: async (targetArea) => {
    set({ loading: true, error: null });
    try {
      const url = targetArea ? `/community-buy?targetArea=${encodeURIComponent(targetArea)}` : '/community-buy';
      const response = await api.get(url);
      if (response.data.success) {
        set({ posts: response.data.data, loading: false });
      }
    } catch (err: any) {
      set({
        loading: false,
        error: err.response?.data?.message || 'Failed to fetch Community Buy feed.',
      });
    }
  },

  fetchPostDetails: async (postId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/community-buy/${postId}`);
      if (response.data.success) {
        const { post, creator, ordersCount } = response.data.data;
        set({
          activePost: post,
          activePostCreator: creator,
          activePostOrdersCount: ordersCount,
          loading: false,
        });
      }
    } catch (err: any) {
      set({
        loading: false,
        error: err.response?.data?.message || 'Failed to load group buy post.',
      });
    }
  },

  createPost: async (postData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/community-buy', postData);
      if (response.data.success && response.data.data) {
        const newPost = response.data.data;
        set((state) => ({
          posts: [newPost, ...state.posts.filter((p) => p._id !== newPost._id)],
          loading: false,
        }));
        try {
          await get().fetchFeed();
        } catch (e) {}
        return { success: true, data: newPost };
      }
      set({ loading: false });
      return { success: false, message: response.data.message || 'Failed to create group buy post.' };
    } catch (err: any) {
      set({ loading: false });
      const message = err.response?.data?.message || 'Failed to launch group order.';
      return { success: false, message };
    }
  },

  joinOrder: async (postId, orderData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/community-buy/${postId}/join`, orderData);
      set({ loading: false });
      if (response.data.success) {
        // Refresh active post and orders
        get().fetchPostDetails(postId);
        get().fetchMyOrders();
        return { success: true, data: response.data.data, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (err: any) {
      set({ loading: false });
      const message = err.response?.data?.message || 'Failed to join group buy order.';
      return { success: false, message };
    }
  },

  fetchComments: async (postId: string) => {
    set({ commentsLoading: true });
    try {
      const response = await api.get(`/community-buy/${postId}/comments`);
      if (response.data.success) {
        set({ comments: response.data.data, commentsLoading: false });
      }
    } catch (err) {
      set({ commentsLoading: false });
    }
  },

  addComment: async (postId, content, parentCommentId) => {
    try {
      const response = await api.post(`/community-buy/${postId}/comments`, {
        content,
        parentCommentId,
      });
      if (response.data.success) {
        const newC = response.data.data;
        set((state) => ({ comments: [...state.comments, newC] }));
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to post comment.';
      return { success: false, message };
    }
  },

  likeComment: async (commentId: string) => {
    try {
      const response = await api.post(`/community-buy/comments/${commentId}/like`);
      if (response.data.success) {
        const newLikes = response.data.likesCount;
        set((state) => ({
          comments: state.comments.map((c) =>
            c._id === commentId ? { ...c, likesCount: newLikes } : c
          ),
        }));
      }
    } catch (err) {
      console.log('Error liking comment:', err);
    }
  },

  fetchMyOrders: async () => {
    try {
      const response = await api.get('/community-buy/my-orders');
      if (response.data.success) {
        set({ myOrders: response.data.data });
      }
    } catch (err) {
      console.log('Error fetching group orders:', err);
    }
  },

  verifyPickupCode: async (pickupCode: string) => {
    try {
      const response = await api.post('/community-buy/verify-code', { pickupCode });
      if (response.data.success) {
        get().fetchMyOrders();
        return { success: true, message: response.data.message, data: response.data.data };
      }
      return { success: false, message: response.data.message };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Verification failed.';
      return { success: false, message };
    }
  },
}));
