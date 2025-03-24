import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ForumPost, ForumComment } from '@/lib/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, ThumbsUp, Tag, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

async function getPost(postId: string) {
  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      book: true,
      comments: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  });

  if (!post) {
    notFound();
  }

  return post;
}

export default async function PostPage({ params }: { params: { postId: string } }) {
  const [post, session] = await Promise.all([
    getPost(params.postId),
    getServerSession(authOptions)
  ]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-10">
        <div className="max-w-4xl mx-auto px-6">
          {/* Post Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold mb-4">{post.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.author.image || ''} />
                  <AvatarFallback>{post.author.name?.[0]}</AvatarFallback>
                </Avatar>
                <span>{post.author.name}</span>
              </div>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {post.comments.length} comments
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" />
                {post.likes} likes
              </span>
            </div>
          </div>

          {/* Post Content */}
          <Card className="p-6 mb-8">
            <div className="prose max-w-none">
              {post.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
            {post.tags.length > 0 && (
              <div className="flex gap-2 mt-6 pt-6 border-t">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Card>

          {/* Comments Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold">Comments</h2>
            
            {/* New Comment Form */}
            {session?.user ? (
              <form className="space-y-4" action="/api/forum/[postId]/comments" method="POST">
                <Textarea
                  name="content"
                  placeholder="Add a comment..."
                  rows={3}
                  required
                />
                <Button type="submit">Post Comment</Button>
              </form>
            ) : (
              <p className="text-gray-600">
                Please sign in to post comments.
              </p>
            )}

            {/* Comments List */}
            <div className="space-y-6">
              {post.comments.map(comment => (
                <Card key={comment.id} className="p-4">
                  <div className="flex gap-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.image || ''} />
                      <AvatarFallback>{comment.author.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{comment.author.name}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        {comment.content.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-2 last:mb-0">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          {comment.likes} likes
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 