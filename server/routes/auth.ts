import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { memoryStore, IUserDocument } from '../db';
import { authMiddleware, generateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Helper to generate a unique Node ID e.g. GC-9042-881E
function generateNodeId(): string {
  const chars = '0123456789ABCDEF';
  let p1 = '';
  let p2 = '';
  for (let i = 0; i < 4; i++) {
    p1 += chars[Math.floor(Math.random() * chars.length)];
    p2 += chars[Math.floor(Math.random() * chars.length)];
  }
  return `GC-${p1}-${p2}`;
}

// 1. REGISTER
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, username, email, password, confirmPassword, profilePicture, publicKey } = req.body;

    // Field Validations
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      res.status(400).json({ success: false, message: 'Full name must be at least 2 characters.' });
      return;
    }

    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      res.status(400).json({ success: false, message: 'Username must be at least 3 characters.' });
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!usernameRegex.test(cleanUsername)) {
      res.status(400).json({
        success: false,
        message: 'Username can only contain alphanumeric characters, underscores, dashes, and dots.',
      });
      return;
    }

    if (!email || typeof email !== 'string') {
      res.status(400).json({ success: false, message: 'Email address is required.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Password confirmation does not match.' });
      return;
    }

    // Check duplicate username or email
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (isMongoConnected) {
      const existingUser = await User.findOne({
        $or: [{ username: cleanUsername }, { email: cleanEmail }],
      });

      if (existingUser) {
        if (existingUser.username === cleanUsername) {
          res.status(400).json({ success: false, message: 'This username is already taken. Please pick another.' });
          return;
        }
        if (existingUser.email === cleanEmail) {
          res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
          return;
        }
      }
    } else {
      for (const existing of memoryStore.users.values()) {
        if (existing.username === cleanUsername) {
          res.status(400).json({ success: false, message: 'This username is already taken. Please pick another.' });
          return;
        }
        if (existing.email === cleanEmail) {
          res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
          return;
        }
      }
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = generateNodeId();
    const finalPublicKey = publicKey || `FP:${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    let savedUser: IUserDocument;

    if (isMongoConnected) {
      const newUser = new User({
        _id: userId,
        fullName: fullName.trim(),
        username: cleanUsername,
        email: cleanEmail,
        passwordHash,
        profilePicture: profilePicture || '',
        publicKey: finalPublicKey,
        isActive: true,
      });
      await newUser.save();
      savedUser = {
        _id: newUser._id.toString(),
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        passwordHash: newUser.passwordHash,
        profilePicture: newUser.profilePicture,
        publicKey: newUser.publicKey,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
        lastSeen: newUser.lastSeen,
        isActive: newUser.isActive,
      };
    } else {
      savedUser = {
        _id: userId,
        fullName: fullName.trim(),
        username: cleanUsername,
        email: cleanEmail,
        passwordHash,
        profilePicture: profilePicture || '',
        publicKey: finalPublicKey,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSeen: new Date(),
        isActive: true,
      };
      memoryStore.users.set(userId, savedUser);
    }

    // Generate JWT
    const token = generateToken({
      userId: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: savedUser._id,
        fullName: savedUser.fullName,
        username: savedUser.username,
        email: savedUser.email,
        profilePicture: savedUser.profilePicture,
        publicKey: savedUser.publicKey,
        createdAt: savedUser.createdAt,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration. Please try again.' });
  }
});

// 2. LOGIN
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      res.status(400).json({ success: false, message: 'Please provide both username/email and password.' });
      return;
    }

    const cleanIdentifier = String(identifier).trim().toLowerCase();
    const isMongoConnected = mongoose.connection.readyState === 1;

    let userDoc: IUserDocument | null = null;

    if (isMongoConnected) {
      const found = await User.findOne({
        $or: [{ username: cleanIdentifier }, { email: cleanIdentifier }],
      });
      if (found) {
        userDoc = {
          _id: found._id.toString(),
          fullName: found.fullName,
          username: found.username,
          email: found.email,
          passwordHash: found.passwordHash,
          profilePicture: found.profilePicture,
          publicKey: found.publicKey,
          createdAt: found.createdAt,
          updatedAt: found.updatedAt,
          lastSeen: found.lastSeen,
          isActive: found.isActive,
        };
      }
    } else {
      for (const u of memoryStore.users.values()) {
        if (u.username === cleanIdentifier || u.email === cleanIdentifier) {
          userDoc = u;
          break;
        }
      }
    }

    if (!userDoc) {
      res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
      return;
    }

    // Compare bcrypt password
    const isMatch = await bcrypt.compare(password, userDoc.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
      return;
    }

    // Update last seen
    userDoc.lastSeen = new Date();
    if (isMongoConnected) {
      await User.findByIdAndUpdate(userDoc._id, { lastSeen: userDoc.lastSeen });
    }

    // Generate JWT
    const token = generateToken({
      userId: userDoc._id,
      username: userDoc.username,
      email: userDoc.email,
    });

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: userDoc._id,
        fullName: userDoc.fullName,
        username: userDoc.username,
        email: userDoc.email,
        profilePicture: userDoc.profilePicture,
        publicKey: userDoc.publicKey,
        createdAt: userDoc.createdAt,
        lastSeen: userDoc.lastSeen,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login. Please try again.' });
  }
});

// 3. LOGOUT
router.post('/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

// 4. GET AUTHENTICATED USER (ME)
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const isMongoConnected = mongoose.connection.readyState === 1;

    let userDoc: IUserDocument | null = null;
    if (isMongoConnected) {
      const found = await User.findById(userId).select('-passwordHash');
      if (found) {
        userDoc = found;
      }
    } else {
      userDoc = memoryStore.users.get(userId) || null;
    }

    if (!userDoc) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: userDoc._id,
        fullName: userDoc.fullName,
        username: userDoc.username,
        email: userDoc.email,
        profilePicture: userDoc.profilePicture,
        publicKey: userDoc.publicKey,
        createdAt: userDoc.createdAt,
        lastSeen: userDoc.lastSeen,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving user profile.' });
  }
});

// 5. FORGOT PASSWORD
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      res.status(400).json({ success: false, message: 'Please enter your username or registered email.' });
      return;
    }

    const clean = String(identifier).trim().toLowerCase();
    let found = false;

    if (mongoose.connection.readyState === 1) {
      const u = await User.findOne({ $or: [{ username: clean }, { email: clean }] });
      found = !!u;
    } else {
      for (const u of memoryStore.users.values()) {
        if (u.username === clean || u.email === clean) {
          found = true;
          break;
        }
      }
    }

    // Always respond with success to prevent user enumeration
    res.json({
      success: true,
      message: 'If an account exists with that identifier, password reset instructions have been dispatched.',
      mockTempToken: found ? 'RESET_TOKEN_' + Math.random().toString(36).substring(2, 10).toUpperCase() : null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to process reset request.' });
  }
});

export default router;
