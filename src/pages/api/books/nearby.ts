import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/db';
import { Book } from '@/lib/models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const { lat, lng, radius = '5' } = req.query;

    // Validate coordinates
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const radiusInMiles = parseFloat(radius as string);

    // Convert miles to meters (1 mile = 1609.34 meters)
    const radiusInMeters = radiusInMiles * 1609.34;

    // Find books within the specified radius
    const books = await Book.find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radiusInMeters
        }
      }
    })
    .populate('owner', 'name email')
    .limit(50);

    // Calculate distance for each book
    const booksWithDistance = books.map(book => {
      const distance = calculateDistance(
        latitude,
        longitude,
        book.location.coordinates[1],
        book.location.coordinates[0]
      );
      return {
        ...book.toObject(),
        distance
      };
    });

    return res.status(200).json(booksWithDistance);
  } catch (error) {
    console.error('Error fetching nearby books:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Calculate distance between two points using the Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
} 