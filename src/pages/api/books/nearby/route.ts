import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const radius = Number(searchParams.get('radius')) || 10;
    const lat = Number(searchParams.get('lat'));
    const lng = Number(searchParams.get('lng'));

    // If no location provided, return all books
    if (isNaN(lat) || isNaN(lng)) {
      const books = await prisma.book.findMany({
        where: {
          isAvailable: true,
          location: {
            not: null,
          },
        },
        select: {
          id: true,
          title: true,
          location: true,
        },
      });
      return NextResponse.json(books);
    }

    // Get all books with locations
    const books = await prisma.book.findMany({
      where: {
        isAvailable: true,
        location: {
          not: null,
        },
      },
      select: {
        id: true,
        title: true,
        location: true,
      },
    });

    // Calculate distances and filter by radius
    const booksWithDistance = books
      .map(book => ({
        ...book,
        distance: calculateDistance(
          lat,
          lng,
          book.location.lat,
          book.location.lng
        ),
      }))
      .filter(book => book.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return NextResponse.json(booksWithDistance);
  } catch (error) {
    console.error('Error fetching nearby books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nearby books' },
      { status: 500 }
    );
  }
} 