import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { memoryStore, getDatabaseStatus } from '../db';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// 1. UPDATE PROFILE
router.put('/profile', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { fullName, profilePicture, publicKey } = req.body;

    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const updated = await User.findByIdAndUpdate(
        userId,
        {
          ...(fullName ? { fullName: String(fullName).trim() } : {}),
          ...(profilePicture !== undefined ? { profilePicture: String(profilePicture) } : {}),
          ...(publicKey ? { publicKey: String(publicKey) } : {}),
          updatedAt: new Date(),
        },
        { new: true }
      ).select('-passwordHash');

      if (!updated) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      res.json({ success: true, message: 'Profile updated successfully.', user: updated });
      return;
    }

    // Memory store fallback
    const user = memoryStore.users.get(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (fullName) user.fullName = String(fullName).trim();
    if (profilePicture !== undefined) user.profilePicture = String(profilePicture);
    if (publicKey) user.publicKey = String(publicKey);
    user.updatedAt = new Date();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        publicKey: user.publicKey,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

// 2. GET USER BY ID
router.get('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const targetId = req.params.id;
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const user = await User.findById(targetId).select('-passwordHash');
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }
      res.json({ success: true, user });
      return;
    }

    const memUser = memoryStore.users.get(targetId);
    if (!memUser) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: memUser._id,
        fullName: memUser.fullName,
        username: memUser.username,
        profilePicture: memUser.profilePicture,
        publicKey: memUser.publicKey,
        lastSeen: memUser.lastSeen,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving user.' });
  }
});

// 3. GET SYSTEM / MONGODB STATUS
router.get('/system/status', (_req: Request, res: Response) => {
  const status = getDatabaseStatus();
  res.json({
    success: true,
    platform: 'Global Connect Backend API',
    database: status,
    timestamp: new Date(),
  });
});

export default router;
