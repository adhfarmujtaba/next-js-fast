import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import styles from './FollowersFollowings.module.css';
import { useRouter } from 'next/router';

interface User {
  username: string;
  name: string | null;
  avatar: string;
}

interface FollowersFollowingsProps {
  username: string;
  type: 'followers' | 'followings'; // Type can be either 'followers' or 'followings'
  onClose: () => void; // Callback to close the modal
}

const FollowersFollowings: React.FC<FollowersFollowingsProps> = ({ username, type, onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1); // Track the current page
  const [hasMore, setHasMore] = useState(true); // Track if there are more users to load
  const router = useRouter();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null); // Reset error state on new fetch
    try {
      console.log(`Fetching ${type} for user: ${username}, page: ${page}`);
      const response = await axios.get(`https://blog.tourismofkashmir.com/api_followers_followings.php?username=${username}&type=${type}&page=${page}`);

      console.log('API Response:', response.data); // Log the complete response

      const usersData = response.data.users || []; // Adjusted key based on response
      console.log(`${type} data extracted:`, usersData); // Log extracted user data

      if (Array.isArray(usersData)) {
        setUsers(prev => [...prev, ...usersData]); // Append new users
        setHasMore(usersData.length > 0); // Check if more users exist
      } else {
        console.error('Unexpected response format:', usersData);
        setError('Unexpected response format');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
      console.log('Loading finished');
    }
  }, [username, type, page]);

  // Load users on mount and when page changes
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Disable scroll on .main when modal is open
  useEffect(() => {
    const mainElement = document.querySelector('.main') as HTMLElement;
    if (mainElement) {
      mainElement.style.overflow = 'hidden';
    }

    // Cleanup function to restore scroll
    return () => {
      if (mainElement) {
        mainElement.style.overflow = 'unset';
      }
    };
  }, []);

  // Infinite scroll logic
  const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !isLoading) {
      setPage(prevPage => prevPage + 1); // Load more users
    }
  };

  if (isLoading && page === 1) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.modalwrapper}>
    <div className={styles.modal}>
      <div className={styles.modalHead}>
      <h2>{type === 'followers' ? 'Followers' : 'Following'} 
      </h2>
      <span className={styles.closeButton} onClick={onClose}> <CloseIcon /></span>
      </div>
      <ul className={styles.userList} onScroll={handleScroll}>
        {users.map(user => (
          <li key={user.username} className={styles.userItem} onClick={() => {
            router.push(`/profile/${user.username}`);
            onClose(); // Close the modal after navigating
          }}>
            <img src={user.avatar} alt={user.username} className={styles.userAvatar} />
            <div className={styles.userInfo}>
              <h3>{user.name || 'Unknown User'}</h3>
              <p>@{user.username}</p>
            </div>
          </li>
        ))}
        {isLoading && <div className={styles.loading}>Loading more...</div>}
      </ul>
    </div>
    </div>
  );
};

export default FollowersFollowings;
