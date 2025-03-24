import jwt from 'jsonwebtoken';

const JWT_SECRET = 'booklendiverse_jwt_secret_key_2024';

const createToken = (userId: string): string => {
  return jwt.sign({ userId, id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

const verifyToken = async (token: string): Promise<{ userId: string, id: string } | null> => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, id: string };
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

export default {
  createToken,
  verifyToken
}; 