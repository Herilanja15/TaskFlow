import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import httpError from '../utils/httpError.js';

function createSession(user) {
  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  };
}

export const register = asyncHandler(async (request, response) => {
  const name = typeof request.body.name === 'string' ? request.body.name.trim() : '';
  const email = typeof request.body.email === 'string' ? request.body.email.trim().toLowerCase() : '';
  const password = request.body.password;

  if (!name || name.length > 80 || !email || !/^\S+@\S+\.\S+$/.test(email)) {
    throw httpError(400, 'Enter a valid name and email address');
  }
  if (
    typeof password !== 'string' ||
    password.length < 8 ||
    Buffer.byteLength(password, 'utf8') > 72
  ) {
    throw httpError(400, 'Password must contain 8 to 72 bytes');
  }

  if (await User.exists({ email })) {
    throw httpError(409, 'An account with this email already exists');
  }

  const user = await User.create({ name, email, password });
  response.status(201).json(createSession(user));
});

export const login = asyncHandler(async (request, response) => {
  const email = typeof request.body.email === 'string' ? request.body.email.trim().toLowerCase() : '';
  const password = request.body.password;

  if (!email || typeof password !== 'string') {
    throw httpError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw httpError(401, 'Email or password is incorrect');
  }

  response.json(createSession(user));
});

export const currentUser = (request, response) => {
  response.json({
    user: {
      id: request.user.id,
      name: request.user.name,
      email: request.user.email,
    },
  });
};

export const updateCurrentUser = asyncHandler(async (request, response) => {
  const user = await User.findById(request.user._id).select('+password');
  if (!user) throw httpError(404, 'Account not found');

  const { name, email, currentPassword, password } = request.body;
  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 80) {
      throw httpError(400, 'Name must be between 1 and 80 characters');
    }
    user.name = name.trim();
  }
  if (email !== undefined) {
    if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      throw httpError(400, 'Enter a valid email address');
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail, _id: { $ne: user._id } })) {
      throw httpError(409, 'An account with this email already exists');
    }
    user.email = normalizedEmail;
  }
  if (password !== undefined) {
    if (
      typeof password !== 'string' ||
      password.length < 8 ||
      Buffer.byteLength(password, 'utf8') > 72
    ) {
      throw httpError(400, 'New password must contain 8 to 72 bytes');
    }
    if (typeof currentPassword !== 'string' || !(await user.comparePassword(currentPassword))) {
      throw httpError(401, 'Current password is incorrect');
    }
    user.password = password;
  }

  await user.save();
  response.json({
    user: { id: user.id, name: user.name, email: user.email },
  });
});