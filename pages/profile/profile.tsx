import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './Profile.module.css';
import FollowersFollowings from './FollowersFollowings';
import { useModal } from '../../context/ModalContext';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ClipLoader } from 'react-spinners';
import { useRouter } from 'next/router'; // Import useRouter


interface User {
  id: string;
  username: string;
  avatar: string;
}

interface Post {
  id: string;
  image: string;
  title: string;
  meta_description: string;
  read_time: string; // or number, depending on the API response
  category_slug: string; // Include category_slug
  post_slug: string; // Include post_slug
}

interface ProfileProps {
  username: string;
  currentUserID: string | null;
}

const Profile: React.FC<ProfileProps> = ({ username, currentUserID }) => {
  const router = useRouter(); // Initialize useRouter
  const [userData, setUserData] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showFollowersFollowings, setShowFollowersFollowings] = useState(false);
  const [followersFollowingsType, setFollowersFollowingsType] = useState<'followers' | 'followings'>('followers');
  const { isModalOpen, openModal, closeModal } = useModal();

  const [page, setPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true); // Track if more posts are available
  const [sortOption, setSortOption] = useState<'date' | 'views'>('date'); // Default sort option

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const userResponse = await axios.get(
        `https://nexnews.leaknews.net/blog/api_profile.php?username=${username}&requesting_user_id=${currentUserID}`
      );
      const { user, is_following } = userResponse.data;

      setUserData(user);
      setIsFollowing(is_following);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPosts = async (pageNumber: number) => {
    try {
      const postsResponse = await axios.get(
        `https://nexnews.leaknews.net/blog/get_user_posts.php?username=${username}&page=${pageNumber}&sortBy=${sortOption}`
      );
      const { posts } = postsResponse.data;

      if (posts.length === 0) {
        setHasMorePosts(false);
        return;
      }

      setUserPosts(prevPosts => [...prevPosts, ...posts]);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      alert('Failed to fetch user posts. Please try again later.');
    }
  };

  const fetchFollowerFollowingCounts = async () => {
    try {
      const response = await axios.get(
        `https://nexnews.leaknews.net/blog/api_profile.php?username=${username}&requesting_user_id=${currentUserID}`
      );
      const { followers_count, following_count } = response.data;
      setFollowersCount(parseInt(followers_count, 10)); // Convert to integer
      setFollowingCount(parseInt(following_count, 10)); // Convert to integer
    } catch (error) {
      console.error('Error fetching follower/following counts:', error);
    }
  };

  const handleFollow = async () => {
    if (!currentUserID || !userData) return;
    try {
      await axios.get(`https://nexnews.leaknews.net/blog/api_followandunfollow.php?follow=true&follower_id=${currentUserID}&followee_id=${userData.id}`);
      setIsFollowing(true);
      setFollowersCount(prevCount => prevCount + 1);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async () => {
    if (!currentUserID || !userData) return;
    try {
      await axios.get(`https://nexnews.leaknews.net/blog/api_followandunfollow.php?removefollower=true&follower_id=${currentUserID}&followee_id=${userData.id}`);
      setIsFollowing(false);
      setFollowersCount(prevCount => prevCount - 1);
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const handleFollowersClick = () => {
    setFollowersFollowingsType('followers');
    setShowFollowersFollowings(true);
    openModal();
  };

  const handleFollowingsClick = () => {
    setFollowersFollowingsType('followings');
    setShowFollowersFollowings(true);
    openModal();
  };

  const closeFollowersFollowings = () => {
    setShowFollowersFollowings(false);
    closeModal();
  };

  const refreshPosts = () => {
    setUserPosts([]);
    setPage(1);
    setHasMorePosts(true);
    fetchUserPosts(1);
  };

  useEffect(() => {
    fetchUserData();
    // fetchUserPosts(page); // Fetch initial posts
    fetchFollowerFollowingCounts();

    // Interval for follower/following counts refresh
    const countInterval = setInterval(() => {
      fetchFollowerFollowingCounts();
    }, 1000); // 10 seconds

    return () => {
      clearInterval(countInterval);
    };
  }, [username, currentUserID]);

  useEffect(() => {
    if (page > 1) { // Only fetch if page is greater than 1
      fetchUserPosts(page);
    }
  }, [page]);

  useEffect(() => {
    refreshPosts(); // Refresh posts when sortOption changes
  }, [sortOption]);

  // New useEffect to refresh on username change
  useEffect(() => {
    fetchUserData();
    fetchFollowerFollowingCounts();
    refreshPosts(); // Reset posts and fetch new ones
  }, [username]);

  const handleEditProfile = () => {
    router.push(`/edit-profile/${userData?.id}`); // Navigate to the edit profile page
  };

  const handlePostClick = (post: Post) => {
    router.push(`/${post.category_slug}/${post.post_slug}`);
  };


  const truncateText = (text: string, limit: number) => {
    return text.length > limit ? text.slice(0, limit) + '...' : text;
  };

  if (isLoading) {
    return (
      <div className={styles.skeletonContainer}>
        <div className={styles.avatarSkeleton}></div>
        <div className={styles.usernameSkeleton}></div>
        <div className={styles.followStatsSkeleton}></div>
        <div className={styles.buttonSkeleton}></div>
        <div className={styles.postsTitleSkeleton}></div>
        <div className={styles.postsGridSkeleton}>
          {[...Array(3)].map((_, index) => (
            <div key={index} className={styles.postSkeleton}></div>
          ))}
        </div>
      </div>
    );
  }

  if (!userData) {
    return <div>User not found.</div>;
  }

  return (
    <>
      <div className={styles.profileContainer} id='profileContainer'>
        <div className={styles.profileHeader}>
          <img src={userData.avatar} alt={userData.username} className={styles.avatar} />
          <div>
            <h1 className={styles.username}>{userData.username}</h1>
            <div className={styles.followStats}>
              <span className={styles.followCount} onClick={handleFollowersClick} style={{ cursor: 'pointer' }}>
                {followersCount} Followers
              </span>
              <span onClick={handleFollowingsClick} style={{ cursor: 'pointer' }}>
                {followingCount} Following
              </span>
            </div>
          </div>
        </div>
        <div className={styles.buttonContainer}>
          {currentUserID && userData.id !== currentUserID ? (
            <button className={styles.followButton} onClick={isFollowing ? handleUnfollow : handleFollow}>
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          ) : currentUserID && userData.id === currentUserID ? (
            <>
              <button className={styles.editButton} onClick={handleEditProfile}>
                Edit Profile
              </button>
              <div className={styles.loginPrompt}>You are viewing your own profile.</div>
            </>
          ) : (
            <div className={styles.loginPrompt}>Please log in to follow this user.</div>
          )}
        </div>

        <h2 className={styles.postsTitle}>{userData.username} Posts</h2>
        <div className={styles.sortOptions}>
          <span className={styles.SortTitle}>Sort by: </span>
          <div className={styles.tagsContainer}>
            {['date', 'views'].map(option => (
              <span
                key={option}
                className={`${styles.tag} ${sortOption === option ? styles.activeTag : ''}`}
                onClick={() => setSortOption(option as 'date' | 'views')}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)} {/* Capitalize the first letter */}
              </span>
            ))}
          </div>
        </div>

        <InfiniteScroll
          dataLength={userPosts.length}
          next={() => setPage(prevPage => prevPage + 1)} // Increment page number to fetch more posts
          hasMore={hasMorePosts}
          loader={<div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <ClipLoader color="#000" size={30} />
          </div>}
          endMessage={<p style={{ textAlign: 'center' }}>No more posts to display.</p>}
        >
          <div className={styles.postsContainer}>
            <div className={styles.postsGrid}>
              {userPosts.map(post => (
                <div key={post.id} className={styles.post} onClick={() => handlePostClick(post)}>
                  <div className={styles.imageContainerPr}>
                    <img src={post.image} alt={post.title} className={styles.postImage} />
                    <div className={styles.readTimePr}>{post.read_time} min read</div>
                  </div>
                  <div className={styles.postContent}>
                   <h3 className={styles.postTitle}>{truncateText(post.title, 100)}</h3> {/* Limit title to 30 characters */}
                    <p className={styles.postDescription}>{truncateText(post.meta_description, 125)}</p> {/* Limit description to 100 characters */}
                  
                  </div>
                </div>
              ))}
            </div>
          </div>
        </InfiniteScroll>
      </div>

      {showFollowersFollowings && isModalOpen && (
        <FollowersFollowings 
          username={userData.username} 
          type={followersFollowingsType} 
          currentUserId={currentUserID} 
          onClose={closeFollowersFollowings} 
        />
      )}
    </>
  );
};

export default Profile;
