'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Search, Filter, Plus, Heart, MessageCircle } from 'lucide-react';
import { useUser } from '@/lib/contexts/UserContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

const ForumPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const { user } = useUser();
  const queryClient = useQueryClient();

  const categories = [
    'all',
    'general',
    'book-reviews',
    'reading-groups',
    'book-swaps',
    'recommendations',
    'events'
  ];

  // Fetch forum posts
  const { data, isLoading, error } = useQuery({
    queryKey: ['forum-posts', searchQuery, selectedCategory, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory !== 'all') params.append('tag', selectedCategory);

      const response = await fetch(`/api/forum?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch forum posts');
      }
      return response.json();
    }
  });

  // Create new post mutation
  const createPostMutation = useMutation({
    mutationFn: async (newPost: { title: string; content: string; tags: string[] }) => {
      const response = await fetch('/api/forum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPost),
      });
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      toast.success('Post created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create post');
      console.error('Error creating post:', error);
    },
  });

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
  };

  // Handle new post creation
  const handleNewPost = () => {
    if (!user) {
      toast.error('Please login to create a post');
      return;
    }
    // TODO: Implement new post modal/form
    toast.info('New post feature coming soon!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-serif font-bold mb-4">Community Forum</h1>
              <p className="text-gray-600">Connect with fellow book lovers</p>
            </div>
            <Button onClick={handleNewPost} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </form>

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedCategory(category);
                    setPage(1); // Reset to first page when changing category
                  }}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Forum Posts */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">Failed to load forum posts. Please try again.</p>
            </div>
          ) : data?.posts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No forum posts found.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {data?.posts.map((post) => (
                  <Link href={`/forum/${post._id}`} key={post._id}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>Posted by {post.author.name}</span>
                              <span>•</span>
                              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              <span>{post.likes.length}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              <span>{post.comments.length}</span>
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 line-clamp-3">{post.content}</p>
                        <div className="flex gap-2 mt-4">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {data?.pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                    disabled={page === data.pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForumPage; 