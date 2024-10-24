// pages/profile/profile.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './Profile.module.css';

interface User {
  id: string;
  username: string;
  avatar: string;
}



interface ProfileProps {
  username: string;
  currentUserID: string | null;
}

const Profile: React.FC<ProfileProps> = ({ username, currentUserID }) => {
  const [userData, setUserData] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
 
  const [isLoading, setIsLoading] = useState(true);


  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://blog.tourismofkashmir.com/api_profile.php?username=${username}&requesting_user_id=${currentUserID}`
      );
      const { user, posts, is_following, followers_count, following_count, followers, followings } = response.data;

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

  useEffect(() => {
    fetchUserData();
  }, [username, currentUserID]);

  if (isLoading) {
 
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
            <span className={styles.followCount} >{followersCount} Followers</span>
            <span >{followingCount} Following</span>
          </div>
        </div>
      </div>
      <div className={styles.buttonContainer}>
        {currentUserID ? (
          <button className={styles.followButton} onClick={isFollowing ? handleUnfollow : handleFollow}>
            {isFollowing ? 'Unfollow' : 'Follow'}
          </button>
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
    </>
  );
};

export default Profile;
