// pages/[category_slug]/[slug].tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

interface Post {
  id: string;
  title: string;
  content: string;
  image: string;
  category_slug: string;
  slug: string;
  avatar: string;
  username: string;
  views: number;
  created_at: string;
  read_time: string;
}

interface Props {
  initialPost: Post | null;
}

const PostPage: React.FC<Props> = ({ initialPost }) => {
  const router = useRouter();
  const { category_slug, slug } = router.query;
  const [post, setPost] = useState<Post | null>(initialPost);
  const [loading, setLoading] = useState<boolean>(true); // Start with loading true

  useEffect(() => {
    const fetchPost = async () => {
      if (!post && category_slug && slug) {
        try {
          const response = await axios.get(`https://blog.tourismofkashmir.com/apis?post_slug=${slug}`);
          setPost(response.data);
        } catch (error) {
          console.error('Error fetching post:', error);
        } finally {
          setLoading(false); // Set loading false after fetching
        }
      } else {
        setLoading(false); // If post is already available, stop loading
      }
    };
    fetchPost();
  }, [post, category_slug, slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB'); // Format to DD/MM/YYYY
  };

  // Skeleton loading representation
  const Skeleton = () => (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ backgroundColor: '#e0e0e0', height: '30px', width: '80%', marginBottom: '10px' }} />
      <div style={{ backgroundColor: '#e0e0e0', height: '200px', width: '100%', marginBottom: '10px' }} />
      <div style={{ backgroundColor: '#e0e0e0', height: '20px', width: '60%', marginBottom: '10px' }} />
      <div style={{ backgroundColor: '#e0e0e0', height: '20px', width: '50%', marginBottom: '10px' }} />
    </div>
  );

  return (
    <div>
      {loading ? (
        <Skeleton />
      ) : !post ? (
        <p>Post not found.</p>
      ) : (
        <>
          <h1>{post.title}</h1>
          <img 
            src={post.image} 
            alt={post.title} 
            style={{ width: '100%', height: 'auto' }} 
          />
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
          <div>
            <img 
              src={`https://blog.tourismofkashmir.com/${post.avatar}`} 
              alt='Avatar' 
              style={{ width: '30px', height: '30px', borderRadius: '50%' }} 
            />
            <span>{post.username} • {post.views} views</span>
            <span> • {formatDate(post.created_at)}</span>
            <span> • {post.read_time} min read</span>
          </div>
        </>
      )}
    </div>
  );
};

export const getServerSideProps = async (context: { params: { slug: string; category_slug: string; } }) => {
  const { slug, category_slug } = context.params;

  try {
    const response = await axios.get(`https://blog.tourismofkashmir.com/apis?post_slug=${slug}`);
    const post = response.data;

    return {
      props: {
        initialPost: post || null,
      },
    };
  } catch (error) {
    console.error('Error fetching post on server:', error);
    return {
      props: {
        initialPost: null,
      },
    };
  }
};

export default PostPage;
