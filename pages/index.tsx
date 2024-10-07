// pages/index.tsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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

interface Props {
  initialPosts: Post[] | null;
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

const Home: React.FC<Props> = ({ initialPosts }) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts || []);
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(2);

  useEffect(() => {
    if (initialPosts) setLoading(false);
  }, [initialPosts]);

  const fetchPosts = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`https://blog.tourismofkashmir.com/apis?posts&page=${page}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      if (Array.isArray(data)) {
        setPosts(prevPosts => [...prevPosts, ...data]);
      } else {
        console.error('Expected data to be an array, but got:', data);
      }
    } catch (error) {
      console.error('Fetching posts failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    fetchPosts(pageNumber);
    setPageNumber(prev => prev + 1);
  };

  return (
    <div className="news-list">
      {loading ? (
        Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="skeleton-card" style={{ marginBottom: '20px', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', padding: '10px' }}>
            <div style={{ width: '100%', height: '180px', backgroundColor: '#e0e0e0' }} />
            <h2 style={{ height: '20px', backgroundColor: '#e0e0e0', margin: '10px 0' }} />
            <p style={{ height: '16px', backgroundColor: '#e0e0e0', margin: '10px 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px 10px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#e0e0e0', marginRight: '5px' }} />
              <span style={{ height: '16px', backgroundColor: '#e0e0e0' }} />
            </div>
          </div>
        ))
      ) : (
        posts.length === 0 ? (
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
                  <h2>{truncateText(post.title, 10)}</h2>
                  <p>{truncateText(post.meta_description, 20)}</p>
                </div>
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <Link href={`/profile/${post.username}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                  <div style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                    <img src={`https://blog.tourismofkashmir.com/${post.avatar}`} alt='Avatar' className='avatar' style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '5px' }} />
                    <span className='username'>{post.username}</span>
                  </div>
                </Link>
                <span className='views'> • {formatViews(post.views)} views</span>
                <span className='date'> • {formatDate(post.created_at)}</span>
              </div>
            </div>
          ))
        )
      )}
      <button onClick={loadMore} style={{ marginTop: '20px' }} disabled={loading}>
        {loading ? 'Loading...' : 'Load More'}
      </button>
    </div>
  );
};

export async function getServerSideProps() {
  const res = await fetch(`https://blog.tourismofkashmir.com/apis?posts&page=1`);
  if (!res.ok) {
    return { props: { initialPosts: null } };
  }
  const initialPosts: Post[] = await res.json();
  return {
    props: { initialPosts },
  };
}

export default Home;
