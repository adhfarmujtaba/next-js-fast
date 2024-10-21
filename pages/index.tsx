import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { ClipLoader } from 'react-spinners';
import InfiniteScroll from 'react-infinite-scroll-component';
import CONFIG from '../utils/config'; // Adjust the path as needed
import '../app/index.css';

interface Post {
  id: string;
  title: string;
  meta_description: string;
  image: string;
  category_slug: string;
  slug: string;
  avatar: string;
  username: string;
  views: number;
  created_at: string;
  read_time: string;
}

interface SiteInfo {
  site_title: string;
  site_description: string;
  site_url: string;
  logo_url: string;
}

const truncateText = (text: string, limit: number) => {
  const words = text.split(' ');
  return words.length > limit ? `${words.slice(0, limit).join(' ')}...` : text;
};

const formatViews = (views: number): string => {
  if (views >= 10000000) return Math.floor(views / 10000000) + 'cr';
  if (views >= 1000000) return Math.floor(views / 1000000) + 'M';
  if (views >= 100000) return Math.floor(views / 100000) + 'L';
  if (views >= 1000) return Math.floor(views / 1000) + 'k';
  return views.toString();
};

const formatDate = (date: string): string => {
  const currentDate = new Date();
  const postDate = new Date(date);
  const timeDifference = currentDate.getTime() - postDate.getTime();
  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return seconds + ' sec ago';
  if (minutes < 60) return minutes + ' mins ago';
  if (hours < 24) return hours + ' hours ago';
  if (days < 7) return days + ' days ago';
  if (days < 30) return Math.floor(days / 7) + ' weeks ago';
  if (days < 365) return Math.floor(days / 30) + ' months ago';
  return Math.floor(days / 365) + ' years ago';
};

const SkeletonLoader = () => {
  return (
    // <div className="skeleton-card" style={{ marginBottom: '20px', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', padding: '10px' }}>
    //   <div style={{ width: '100%', height: '180px', backgroundColor: '#e0e0e0' }} />
    //   <h2 style={{ height: '20px', backgroundColor: '#e0e0e0', margin: '10px 0' }} />
    //   <p style={{ height: '16px', backgroundColor: '#e0e0e0', margin: '10px 0' }} />
    //   <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px 10px' }}>
    //     <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#e0e0e0', marginRight: '5px' }} />
    //     <span style={{ height: '16px', backgroundColor: '#e0e0e0' }} />
    //   </div>
    // </div>

    <div className='skeleton-container'>
    {Array.from({ length: 10 }).map((_, index) => (
      <div key={index} className='card skeleton-card'>
        <div className='skeleton-image'></div>
        <div className='card-content'>
          <div className='skeleton-title'></div>
          <div className='skeleton-content'></div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className='skeleton-avatar'></div>
            <div className='skeleton-username'></div>
            <div className='skeleton-date'></div>
          </div>
        </div>
      </div>
    ))}
  </div>
  );
};

interface Props {
  siteInfo: SiteInfo;
}

const Home: React.FC<Props> = ({ siteInfo }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  useEffect(() => {
    const fetchPosts = async (page: number) => {
      setLoading(true);
      try {
        const response = await fetch(`${CONFIG.BASE_URL}/apis?posts&page=${page}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        if (Array.isArray(data)) {
          if (data.length === 0) {
            setHasMore(false);
          } else {
            setPosts(prevPosts => [...prevPosts, ...data]);
          }
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error('Fetching posts failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts(pageNumber);
  }, [pageNumber]);

  const fetchMorePosts = () => {
    if (!loading && hasMore) {
      setPageNumber(prev => prev + 1);
    }
  };

  return (
    <div className="news-list">
      <Head>
        <title>{siteInfo.site_title || 'Leak News'}</title>
        <meta name="description" content={siteInfo.site_description || 'Latest news and stories.'} />
        <meta property="og:title" content={siteInfo.site_title || 'Leak News'} />
        <meta property="og:description" content={siteInfo.site_description || 'Latest news and stories.'} />
        <meta property="og:url" content={siteInfo.site_url || 'https://leaknews.net'} />
        <meta property="og:image" content={siteInfo.logo_url || 'https://blog.tourismofkashmir.com/site/logo.png'} />
        <meta property="og:type" content="website" />
        <link rel="icon" href={siteInfo.logo_url || 'https://blog.tourismofkashmir.com/site/logo.png'} />
      </Head>

      <InfiniteScroll
        dataLength={posts.length}
        next={fetchMorePosts}
        hasMore={hasMore}
        loader={<div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <ClipLoader color="#000" loading={loading} size={30} />
    </div>}
        endMessage={<p style={{ textAlign: 'center' }}>No more posts to load.</p>}
      >
        {loading && posts.length === 0 ? (
          Array.from({ length: 5 }).map((_, index) => <SkeletonLoader key={index} />)
        ) : posts.length === 0 ? (
          <p>No posts available.</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className="card">
              <Link href={`/${post.category_slug}/${post.slug}`} className="news-item-link">
                <div className="image-container" style={{ position: 'relative' }}>
                  <img
                    src={post.image}
                    alt={post.title}
                    className="news-item-image"
                    style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'white', padding: '5px', borderRadius: '5px', fontSize: '0.8rem' }}>
                    {post.read_time} min read
                  </div>
                </div>
                <div className='card-content'>
                  <h2>{truncateText(post.title, 20)}</h2>
                  <p>{truncateText(post.meta_description, 28)}</p>
                </div>
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <Link href={`/profile/${post.username}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                  <img src={`${CONFIG.BASE_URL}/${post.avatar}`} alt='Avatar' className='avatar' style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '5px' }} />
                  <span className='username'>{post.username}</span>
                </Link>
                <span className='views'> • {formatViews(post.views)} views</span>
                <span className='date'> • {formatDate(post.created_at)}</span>
              </div>
            </div>
          ))
        )}
      </InfiniteScroll>
    </div>
  );
};

export const getServerSideProps = async () => {
  try {
    const response = await fetch('${CONFIG.BASE_URL}/site_info_api.php');
    if (!response.ok) throw new Error('Network response was not ok');
    const siteInfo = await response.json();

    return {
      props: {
        siteInfo,
      },
    };
  } catch (error) {
    console.error('Fetching site info failed:', error);
    return {
      props: {
        siteInfo: {
          site_title: 'Leak News',
          site_description: 'Latest news and stories.',
          site_url: 'https://leaknews.net',
          logo_url: 'https://blog.tourismofkashmir.com/site/logo.png',
        },
      },
    };
  }
};

export default Home;
