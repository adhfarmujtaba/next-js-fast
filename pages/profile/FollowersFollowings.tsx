import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import styles from './FollowersFollowings.module.css';
import { useRouter } from 'next/router';

interface User {
  username: string;
  name: string | null;
  avatar: string;
  id: string; // User ID for follow/unfollow actions
  isFollowing?: boolean; // Optional property for follow status
}

interface FollowersFollowingsProps {
  username: string;
  type: 'followers' | 'followings'; // Type can be either 'followers' or 'followings'
  currentUserId: string | null; // Current user ID to manage follow/unfollow actions
  onClose: () => void; // Callback to close the modal
}

const FollowersFollowings: React.FC<FollowersFollowingsProps> = ({
  username,
  type,
  currentUserId,
  onClose,
}) => {
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
      const response = await axios.get(`https://nexnews.leaknews.net/blog/api_followers_followings.php?username=${username}&type=${type}&page=${page}&currentUserId=${currentUserId}`);

      const usersData = response.data.users || [];
      console.log('API Response:', response.data); // Log the complete response
      console.log('Fetched users data:', usersData);

      if (Array.isArray(usersData)) {
        const enrichedUsers = usersData.map(user => ({
          username: user.username,
          name: user.name || null,
          avatar: user.avatar,
          id: user.id, // Ensure this is being set correctly
          isFollowing: user.isFollowing === "1" // Convert to boolean
        }));
        setUsers(prev => [...prev, ...enrichedUsers]); // Append new users
        setHasMore(enrichedUsers.length > 0); // Check if more users exist
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
  }, [username, type, page, currentUserId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

    // Manage scroll behavior for #main
    useEffect(() => {
      const mainElement = document.getElementById('main');
      if (mainElement) {
        mainElement.style.overflow = 'hidden'; // Disable scroll on #main
      }
  
      return () => {
        if (mainElement) {
          mainElement.style.overflow = ''; // Re-enable scroll on #main
        }
      };
    }, []); // Empty dependency array to run only on mount and unmount
  

  const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !isLoading) {
      setPage(prevPage => prevPage + 1); // Load more users
    }
  };

  const handleFollow = async (userId: string) => {
    if (!currentUserId) return; // Ensure the user is logged in
    try {
      console.log(`Following user ID: ${userId}`);
      const response = await axios.get(`https://nexnews.leaknews.net/blog/api_followandunfollow.php?follow=true&follower_id=${currentUserId}&followee_id=${userId}`);
      console.log('Follow response:', response.data);
      setUsers(prev => prev.map(user => user.id === userId ? { ...user, isFollowing: true } : user)); // Update local state
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async (userId: string) => {
    if (!currentUserId) return; // Ensure the user is logged in
    try {
      console.log(`Unfollowing user ID: ${userId}`);
      const response = await axios.get(`https://nexnews.leaknews.net/blog/api_followandunfollow.php?removefollower=true&follower_id=${currentUserId}&followee_id=${userId}`);
      console.log('Unfollow response:', response.data);
      setUsers(prev => prev.map(user => user.id === userId ? { ...user, isFollowing: false } : user)); // Update local state
    } catch (error) {
      console.error('Error unfollowing user:', error);
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
          <h2>{type === 'followers' ? 'Followers' : 'Following'}</h2>
          <span className={styles.closeButton} onClick={onClose}><CloseIcon /></span>
        </div>
        <ul className={styles.userList} onScroll={handleScroll}>
  {users.map(user => (
    <li key={user.id} className={styles.userItem}  onClick={() => {
      router.push(`/profile/${user.username}`);
      onClose(); // Close the modal after navigating
    }}>
      <img src={user.avatar} alt={user.username} className={styles.userAvatar} />
      <div className={styles.userInfo}>
        <h3>{user.name || 'Unknown User'}</h3>
        <p>@{user.username}</p>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
  {currentUserId && (
    user.isFollowing ? (
      <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent navigation
        handleUnfollow(user.id);
      }}
        className={styles.unfollowButton}
        style={{
          padding: '6px 12px', // Smaller padding
          cursor: 'pointer',
          backgroundColor: '#e53935', // Unfollow color (blue)
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          fontSize: '12px', // Smaller font size
          fontWeight: '600',
          transition: 'background-color 0.3s, transform 0.2s',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#c62828'; // Darker red
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#e53935'; // Original color
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        Unfollow
      </button>
    ) : (
      <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent navigation
        handleFollow(user.id);
      }}
       
        className={styles.followButton}
        style={{
          padding: '6px 12px', // Smaller padding
          cursor: 'pointer',
          backgroundColor: '#1E88E5', // Blue color
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          fontSize: '12px', // Smaller font size
          fontWeight: '600',
          transition: 'background-color 0.3s, transform 0.2s',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#1976D2'; // Darker blue
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#1E88E5'; // Original color
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        Follow
      </button>
    )
  )}
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
