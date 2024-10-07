// pages/[category_slug]/[slug].tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Head from 'next/head';
import '../../app/post.css';

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
  const [loading, setLoading] = useState<boolean>(!initialPost);

  useEffect(() => {
    const fetchPost = async () => {
      if (category_slug && slug) {
        setLoading(true); // Start loading when fetching a new post
        try {
          const response = await axios.get(`https://blog.tourismofkashmir.com/apis?post_slug=${slug}`);
          setPost(response.data);
        } catch (error) {
          console.error('Error fetching post:', error);
          setPost(null); // Optionally handle error state
        } finally {
          setLoading(false); // Stop loading regardless of success or failure
        }
      }
    };

    // Only fetch post if the slug changes
    if (slug) {
      fetchPost();
    }
  }, [category_slug, slug]); // Removed `post` from dependencies to avoid unnecessary calls

  const formatDate = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const secondsDiff = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (secondsDiff < 60) return 'just now';
    if (secondsDiff < 3600) return `${Math.floor(secondsDiff / 60)} min ago`;
    if (secondsDiff < 86400) return `${Math.floor(secondsDiff / 3600)} hours ago`;
    if (secondsDiff < 2592000) return `${Math.floor(secondsDiff / 86400)} days ago`;
    if (secondsDiff < 31536000) return `${Math.floor(secondsDiff / 2592000)} months ago`;

    return `${Math.floor(secondsDiff / 31536000)} years ago`;
  };

  const domain = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <>
      <Head>
        <title>{post ? post.title : 'Loading...'}</title>
        <meta property="og:title" content={post ? post.title : 'Loading...'} />
        <meta property="og:description" content={post ? post.content.slice(0, 150) + '...' : 'Loading...'} />
        <meta property="og:image" content={post ? post.image : ''} />
        <meta property="og:url" content={post ? `${domain}/${category_slug}/${slug}` : ''} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post ? post.title : 'Loading...'} />
        <meta name="twitter:description" content={post ? post.content.slice(0, 150) + '...' : 'Loading...'} />
        <meta name="twitter:image" content={post ? post.image : ''} />
      </Head>

      <div className="post-container">
        {loading ? (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ backgroundColor: '#e0e0e0', marginBottom: '10px', borderRadius: '4px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', height: '30px', width: '80%' }} />
            <div style={{ backgroundColor: '#e0e0e0', marginBottom: '10px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', height: '200px', width: '100%' }} />
            {Array.from({ length: 10 }, (_, index) => (
              <div key={index} style={{ backgroundColor: '#e0e0e0', marginBottom: '10px', borderRadius: '4px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', height: '20px', width: '60%' }} />
            ))}
          </div>
        ) : !post ? (
          <p>Post not found.</p>
        ) : (
          <>
            <img 
              src={post.image} 
              alt={post.title} 
              className="post-image" 
            />
            <div className="post-meta">
              <img 
                src={`https://blog.tourismofkashmir.com/${post.avatar}`} 
                alt='Avatar' 
              />
              <span>{post.username} • {post.views} views</span>
              <span> • {formatDate(post.created_at)}</span>
              <span> • {post.read_time} min read</span>
            </div>
            <h1 className="post-title">{post.title}</h1>
            <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
          </>
        )}
      </div>
    </>
  );
};

export const getServerSideProps = async (context: { params: { slug: string; category_slug: string; } }) => {
  const { slug } = context.params;

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
