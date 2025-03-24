/**
 * Mock Prisma client for compatibility with existing code
 * In a production environment, you would use a real Prisma client
 */

// Create a simple mock of the PrismaClient
const PrismaClient = {
  // Add mock methods and properties as needed
  post: {
    findUnique: async () => ({}),
    findMany: async () => ([]),
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
  },
  comment: {
    findMany: async () => ([]),
    create: async () => ({}),
  },
  user: {
    findUnique: async () => ({}),
  },
  $connect: async () => {},
  $disconnect: async () => {},
};

// Export a singleton instance
const prisma = PrismaClient;
export default prisma; 