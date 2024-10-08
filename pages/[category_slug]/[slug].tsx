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
  category_name: string;
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  image: string;
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
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      if (category_slug && slug) {
        setLoading(true);
        try {
          const response = await axios.get(`https://blog.tourismofkashmir.com/apis?post_slug=${slug}`);
          const fetchedPost = response.data;
          setPost(fetchedPost);

          // Fetch related posts
          const relatedResponse = await axios.get(`https://blog.tourismofkashmir.com/related_api.php?related_posts=${fetchedPost.category_name}&exclude_post_id=${fetchedPost.id}`);
          setRelatedPosts(relatedResponse.data);
        } catch (error) {
          console.error('Error fetching post:', error);
          setPost(null);
        } finally {
          setLoading(false);
        }
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [category_slug, slug]);

  const formatViews = (views: number): string => {
    if (views >= 10000000) return Math.floor(views / 10000000) + 'cr';
    if (views >= 1000000) return Math.floor(views / 1000000) + 'M';
    if (views >= 100000) return Math.floor(views / 100000) + 'L';
    if (views >= 1000) return Math.floor(views / 1000) + 'k';
    return views.toString();
  };

  const truncateText = (text: string, limit: number) => {
    const words = text.split(' ');
    return words.length > limit ? `${words.slice(0, limit).join(' ')}...` : text;
  };

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
              width={800} 
              height={400} 
              className="post-image" 
              
            />
            <div className="post-meta">
              <img 
                src={`https://blog.tourismofkashmir.com/${post.avatar}`} 
                alt='Avatar' 
                width={40}
                height={40}
                className="avatar-image"
              />
              <span>{post.username} • {formatViews(post.views)} views</span>
              <span> • {formatDate(post.created_at)}</span>
              <span> • {post.read_time} min read</span>
            </div>
            <h1 className="post-title">{post.title}</h1>
            <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />

            {/* Related Posts Section */}
            {relatedPosts.length > 0 && (
              <div className="related-posts">
                <h2>Related Posts</h2>
                <ul>
                  {relatedPosts.map((relatedPost) => (
                    <li key={relatedPost.id}>
                      <a href={`/${post.category_slug}/${relatedPost.slug}`} className="related-post-link">
                        <div className="related-post-image-container">
                          <img 
                            src={relatedPost.image} 
                            alt={relatedPost.title} 
                          
                            className="related-post-image"
                        
                          />
                          <span className="read-time-overlay">{relatedPost.read_time} min read</span>
                        </div>
                        <span>{truncateText(relatedPost.title, 10)}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
