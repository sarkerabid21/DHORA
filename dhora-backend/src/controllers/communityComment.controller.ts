import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { CommunityBuyComment } from '../models/communityBuyComment.model';
import { CommunityBuyPost } from '../models/communityBuyPost.model';
import { UserProfile } from '../models/userProfile.model';

export const getPostComments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { postId } = req.params;

    const comments = await CommunityBuyComment.find({
      postId,
      isDeleted: false,
    })
      .populate('authorId', 'email')
      .sort({ createdAt: 1 });

    // Fetch user profiles for author display names and avatars
    const authorIds = Array.from(new Set(comments.map((c) => c.authorId?._id?.toString() || c.authorId?.toString())));
    const profiles = await UserProfile.find({ userId: { $in: authorIds } });
    const profileMap = new Map<string, { fullName: string; avatarUrl?: string }>();
    profiles.forEach((p) => {
      profileMap.set(p.userId.toString(), {
        fullName: p.fullName || 'Fashionista',
        avatarUrl: p.avatarUrl,
      });
    });

    const enrichedComments = comments.map((c: any) => {
      const uId = c.authorId?._id ? c.authorId._id.toString() : c.authorId?.toString();
      const prof = profileMap.get(uId) || { fullName: 'Community Member' };
      return {
        _id: c._id,
        postId: c.postId,
        authorId: uId,
        authorName: prof.fullName,
        authorAvatar: prof.avatarUrl,
        parentCommentId: c.parentCommentId,
        content: c.content,
        likesCount: c.likesCount,
        isCreatorReply: c.isCreatorReply,
        createdAt: c.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedComments.length,
      data: enrichedComments,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching comments.',
    });
  }
};

export const addPostComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const authorId = req.user?.userId;
    const { postId } = req.params;
    const { content, parentCommentId } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({
        success: false,
        message: 'Comment content cannot be empty.',
      });
      return;
    }

    const post = await CommunityBuyPost.findById(postId);
    if (!post) {
      res.status(404).json({ success: false, message: 'Group order post not found.' });
      return;
    }

    const isCreatorReply = post.creatorId.toString() === authorId;

    const newComment = await CommunityBuyComment.create({
      postId,
      authorId,
      parentCommentId: parentCommentId || null,
      content: content.trim(),
      likesCount: 0,
      isCreatorReply,
    });

    // Increment post comment counter
    post.commentsCount = (post.commentsCount || 0) + 1;
    await post.save();

    const authorProfile = await UserProfile.findOne({ userId: authorId });

    res.status(201).json({
      success: true,
      message: 'Comment posted. (Reminder: Comments ask questions or discuss; to place an order, use Join Order).',
      data: {
        _id: newComment._id,
        postId: newComment.postId,
        authorId,
        authorName: authorProfile?.fullName || 'Community Member',
        authorAvatar: authorProfile?.avatarUrl,
        parentCommentId: newComment.parentCommentId,
        content: newComment.content,
        likesCount: newComment.likesCount,
        isCreatorReply: newComment.isCreatorReply,
        createdAt: newComment.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error posting comment.',
    });
  }
};

export const likeComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { commentId } = req.params;
    const comment = await CommunityBuyComment.findByIdAndUpdate(
      commentId,
      { $inc: { likesCount: 1 } },
      { new: true }
    );

    if (!comment) {
      res.status(404).json({ success: false, message: 'Comment not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      likesCount: comment.likesCount,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error liking comment.',
    });
  }
};

export const deleteComment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { commentId } = req.params;

    const comment = await CommunityBuyComment.findById(commentId);
    if (!comment) {
      res.status(404).json({ success: false, message: 'Comment not found.' });
      return;
    }

    const post = await CommunityBuyPost.findById(comment.postId);
    const isPostCreator = post && post.creatorId.toString() === userId;
    const isCommentAuthor = comment.authorId.toString() === userId;

    if (!isCommentAuthor && !isPostCreator) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this comment.',
      });
      return;
    }

    comment.isDeleted = true;
    await comment.save();

    if (post && post.commentsCount > 0) {
      post.commentsCount -= 1;
      await post.save();
    }

    res.status(200).json({
      success: true,
      message: 'Comment deleted.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting comment.',
    });
  }
};
