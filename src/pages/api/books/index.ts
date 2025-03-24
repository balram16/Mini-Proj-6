import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    const { db } = await connectToDatabase();

    switch (method) {
      case 'GET': {
        console.log('GET request received');
        // Handle fetching books
        const { search, genre: genreFilter } = req.query;
        console.log('Query params:', { search, genreFilter });
        
        let query: any = {};

        // Add search filter if provided
        if (search && search !== '') {
          query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { author: { $regex: search, $options: 'i' } }
          ];
        }

        // Add genre filter if provided and not 'All'
        if (genreFilter && genreFilter !== 'All') {
          const genreValue = Array.isArray(genreFilter) ? genreFilter[0] : genreFilter;
          query.genre = genreValue.toLowerCase();
        }

        console.log('MongoDB query:', JSON.stringify(query, null, 2));

        try {
          // First get all books without any filtering
          const allBooks = await db.collection('books').find({}).toArray();
          console.log('Total books in collection:', allBooks.length);
          
          if (allBooks.length === 0) {
            console.log('No books found in collection');
            return res.status(200).json([]);
          }

          // Now get books with filters and seller information
          const books = await db.collection('books')
            .find(query)
            .toArray();

          console.log('Books found after filtering:', books.length);
          
          if (books.length > 0) {
            console.log('Sample book:', JSON.stringify(books[0], null, 2));
          }

          // Transform the data to ensure proper format
          const transformedBooks = books.map((book: any) => ({
            _id: book._id.toString(),
            title: book.title,
            author: book.author,
            description: book.description || '',
            price: book.price,
            condition: book.condition,
            genre: book.genre,
            coverImage: book.coverImage,
            location: book.location,
            seller: {
              _id: book.seller.toString(),
              name: 'Seller Name' // We'll fix this in the next step
            },
            createdAt: book.createdAt || new Date().toISOString()
          }));

          console.log('Transformed books:', transformedBooks.length);
          return res.status(200).json(transformedBooks);
        } catch (error) {
          console.error('Error fetching books:', error);
          return res.status(500).json({ error: 'Failed to fetch books' });
        }
      }

      case 'POST': {
        // Handle creating a new book
        const { title, author, description, price, condition, genre, coverImage, location, seller } = req.body;

        console.log('Received book data:', { title, author, price, genre, location, seller });

        // Validate required fields with detailed error messages
        const missingFields = [];
        if (!title) missingFields.push('title');
        if (!author) missingFields.push('author');
        if (!price) missingFields.push('price');
        if (!genre) missingFields.push('genre');
        if (!coverImage) missingFields.push('coverImage');
        if (!location) missingFields.push('location');
        if (!seller) missingFields.push('seller');

        if (missingFields.length > 0) {
          console.log('Missing required fields:', missingFields);
          return res.status(400).json({ 
            error: 'Missing required fields',
            missingFields 
          });
        }

        // Validate price is a number
        const numericPrice = Number(price);
        if (isNaN(numericPrice) || numericPrice < 0) {
          return res.status(400).json({ 
            error: 'Invalid price',
            details: 'Price must be a positive number'
          });
        }

        const newBook = {
          title,
          author,
          description: description || '',
          price: numericPrice,
          condition: condition || 'Good',
          genre: genre.toLowerCase(),
          coverImage,
          location,
          seller: new ObjectId(seller),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        console.log('Inserting new book:', JSON.stringify(newBook, null, 2));

        try {
          const result = await db.collection('books').insertOne(newBook);
          console.log('Book inserted successfully:', result.insertedId);

          // Update user's listedBooks array
          const userUpdate = await db.collection('users').updateOne(
            { _id: new ObjectId(seller) },
            { $push: { listedBooks: result.insertedId } }
          );
          console.log('User updated:', userUpdate.modifiedCount > 0);

          // Return the complete book data
          const createdBook = {
            _id: result.insertedId,
            ...newBook,
            seller: {
              _id: seller,
              name: 'Seller Name' // We'll fix this in the next step
            }
          };

          return res.status(201).json(createdBook);
        } catch (error) {
          console.error('Error inserting book:', error);
          return res.status(500).json({ 
            error: 'Failed to insert book',
            details: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error in books API:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 