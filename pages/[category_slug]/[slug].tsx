// pages/[category_slug]/[slug].tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Head from 'next/head';
import '../../app/post.css'; // Adjust the path as necessary

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

interface Props {
  initialPost: Post | null;
}

const PostPage: React.FC<Props> = ({ initialPost }) => {
  const router = useRouter();
  const { category_slug, slug } = router.query;

  useEffect(() => {
    if (!initialPost) {
      // Redirect to SSR page if the post is not found
      router.push(`/ssr/${category_slug}/${slug}`);
    }
  }, [initialPost, category_slug, slug]);

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
        <title>{initialPost ? initialPost.title : 'Loading...'}</title>
        <meta property="og:title" content={initialPost ? initialPost.title : 'Loading...'} />
        <meta property="og:description" content={initialPost ? initialPost.content.slice(0, 150) + '...' : 'Loading...'} />
        <meta property="og:image" content={initialPost ? initialPost.image : ''} />
        <meta property="og:url" content={initialPost ? `${domain}/ssr/${initialPost.category_slug}/${initialPost.slug}` : ''} />
      </Head>

      <div className="post-container">
        {!initialPost ? (
          <p>Post not found.</p>
        ) : (
          <>
            <img src={initialPost.image} alt={initialPost.title} className="post-image" />
            <div className="post-meta">
              <img src={`https://blog.tourismofkashmir.com/${initialPost.avatar}`} alt='Avatar' />
              <span>{initialPost.username} • {formatViews(initialPost.views)} views</span>
              <span> • {formatDate(initialPost.created_at)}</span>
              <span> • {initialPost.read_time} min read</span>
            </div>
            <h1 className="post-title">{initialPost.title}</h1>
            <div className="post-content" dangerouslySetInnerHTML={{ __html: initialPost.content }} />
          </>
        )}
      </div>
    </>
  );
};

// Static generation with fallback
export const getStaticPaths = async () => {
  const response = await axios.get('https://blog.tourismofkashmir.com/apis'); // Adjust this API call as necessary
  const posts: Post[] = response.data;

  const paths = posts.map(post => ({
    params: { category_slug: post.category_slug, slug: post.slug },
  }));

  return { paths, fallback: true }; // Enable fallback for new posts
};

export const getStaticProps = async (context: { params: { slug: string; category_slug: string; } }) => {
  const { slug } = context.params;

  try {
    const response = await axios.get(`https://blog.tourismofkashmir.com/apis?post_slug=${slug}`);
    const post = response.data;

    return {
      props: {
        initialPost: post || null,
      },
      revalidate: 60, // Revalidate every minute
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return {
      props: {
        initialPost: null,
      },
    };
  }
};

export default PostPage;
