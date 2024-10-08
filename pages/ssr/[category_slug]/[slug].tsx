// pages/ssr/[category_slug]/[slug].tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Head from 'next/head';
import '../../../app/post.css'; // Adjust the path as necessary

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
  category_slug: string; // Added category_slug
}

const SSRPostPage: React.FC<{ initialPost: Post | null }> = ({ initialPost }) => {
  const router = useRouter();
  const { category_slug, slug } = router.query;
  const [post, setPost] = useState<Post | null>(initialPost);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      if (post) {
        try {
          const relatedResponse = await axios.get(`https://blog.tourismofkashmir.com/related_api.php?related_posts=${post.category_name}&exclude_post_id=${post.id}`);
          setRelatedPosts(relatedResponse.data);
        } catch (error) {
          console.error('Error fetching related posts:', error);
        }
      }
    };

    fetchRelatedPosts();
  }, [post]);

  const formatViews = (views: number): string => {
    if (views >= 10000000) return Math.floor(views / 10000000) + 'cr';
    if (views >= 1000000) return Math.floor(views / 1000000) + 'M';
    if (views >= 100000) return Math.floor(views / 100000) + 'L';
    if (views >= 1000) return Math.floor(views / 1000) + 'k';
    return views.toString();
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
        <link rel="canonical" href={`${domain}/ssr/${category_slug}/${slug}`} />
        <meta property="og:title" content={post ? post.title : 'Loading...'} />
        <meta property="og:description" content={post ? post.content.slice(0, 150) + '...' : 'Loading...'} />
        <meta property="og:image" content={post ? post.image : ''} />
        <meta property="og:url" content={post ? `${domain}/ssr/${post.category_slug}/${post.slug}` : ''} />
      </Head>

      <div className="post-container">
        {!post ? (
          <p>Post not found.</p>
        ) : (
          <>
            <img src={post.image} alt={post.title} className="post-image" />
            <div className="post-meta">
              <img src={`https://blog.tourismofkashmir.com/${post.avatar}`} alt='Avatar' />
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
                      <a href={`/ssr/${relatedPost.category_slug}/${relatedPost.slug}`} className="related-post-link">
                        <img src={relatedPost.image} alt={relatedPost.title} className="related-post-image" />
                        <span>{relatedPost.title}</span>
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

// Server-side rendering
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

export default SSRPostPage;
