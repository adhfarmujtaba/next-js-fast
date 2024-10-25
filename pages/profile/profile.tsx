// pages/profile/profile.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './Profile.module.css';
import FollowersFollowings from './FollowersFollowings';
import { useModal } from '../../context/ModalContext'; // Use named import


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
}

interface ProfileProps {
  username: string;
  currentUserID: string | null;
}

const Profile: React.FC<ProfileProps> = ({ username, currentUserID }) => {
  const [userData, setUserData] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showFollowersFollowings, setShowFollowersFollowings] = useState(false);
  const [followersFollowingsType, setFollowersFollowingsType] = useState<'followers' | 'followings'>('followers');
  const { isModalOpen, openModal, closeModal } = useModal();

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://blog.tourismofkashmir.com/api_profile.php?username=${username}&requesting_user_id=${currentUserID}`
      );
      const { user, posts, is_following, followers_count, following_count } = response.data;

      setUserData(user);
      setUserPosts(posts);
      setFollowersCount(followers_count);
      setFollowingCount(following_count);
      setIsFollowing(is_following);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUserID || !userData) return; 
    try {
      await axios.get(`https://blog.tourismofkashmir.com/api_followandunfollow.php?follow=true&follower_id=${currentUserID}&followee_id=${userData.id}`);
      setIsFollowing(true);
      setFollowersCount(prevCount => prevCount + 1);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async () => {
    if (!currentUserID || !userData) return; 
    try {
      await axios.get(`https://blog.tourismofkashmir.com/api_followandunfollow.php?removefollower=true&follower_id=${currentUserID}&followee_id=${userData.id}`);
      setIsFollowing(false);
      setFollowersCount(prevCount => prevCount - 1);
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const handleFollowersClick = async () => {
    setFollowersFollowingsType('followers');
    setShowFollowersFollowings(true);
    openModal();
    try {
      await axios.get('https://blog.tourismofkashmir.com/api_profile_model.php?isModelOpen=true');
    } catch (error) {
      console.error('Error updating isModelOpen to true:', error);
    }
  };
  
  const handleFollowingsClick = async () => {
    setFollowersFollowingsType('followings');
    setShowFollowersFollowings(true);
    openModal();
    try {
      await axios.get('https://blog.tourismofkashmir.com/api_profile_model.php?isModelOpen=true');
    } catch (error) {
      console.error('Error updating isModelOpen to true:', error);
    }
  };
  
  const closeFollowersFollowings = async () => {
    setShowFollowersFollowings(false);
    closeModal();

    try {
      await axios.get('https://blog.tourismofkashmir.com/api_profile_model.php?isModelOpen=false');
    } catch (error) {
      console.error('Error updating isModelOpen to false:', error);
    }
  };
  

  useEffect(() => {
    fetchUserData();

    // Cleanup function to set isModelOpen to false when leaving the page
    return () => {
      axios.get('https://blog.tourismofkashmir.com/api_profile_model.php?isModelOpen=false')
        .catch(error => console.error('Error updating isModelOpen on unmount:', error));
    };
  }, [username, currentUserID]);

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
  ) : currentUserID ? (
    <div className={styles.loginPrompt}>You are viewing your own profile.</div>
  ) : (
    <div className={styles.loginPrompt}>Please log in to follow this user.</div>
  )}
</div>

        <h2 className={styles.postsTitle}>{userData.username} Posts</h2>
        <div className={styles.postsGrid}>
          {userPosts.map(post => (
            <div key={post.id} className={styles.post}>
              <div className={styles.imageContainerPr}>
                <img src={post.image} alt={post.title} className={styles.postImage} />
                <div className={styles.readTimePr}>{post.read_time} min read</div>
              </div>
              <h3 className={styles.postTitle}>{post.title}</h3>
              <p className={styles.postDescription}>{post.meta_description}</p>
            </div>
          ))}
        </div>
      </div>

      {showFollowersFollowings && isModalOpen &&(
        <FollowersFollowings username={userData.username} type={followersFollowingsType} onClose={closeFollowersFollowings} />
      )}
    </>
  );
};

export default Profile;
