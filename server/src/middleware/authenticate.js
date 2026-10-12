import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import httpError from '../utils/httpError.js';

const authenticate = asyncHandler(async (request, _response, next) => {
  const authorization = request.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw httpError(401, 'Authentication required');
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw httpError(401, 'Session expired or invalid');
  }

  const user = await User.findById(payload.sub).select('_id name email');
  if (!user) {
    throw httpError(401, 'Account not found');
  }

  request.user = user;
  next();
});

export default authenticate;