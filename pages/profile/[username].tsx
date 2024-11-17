// pages/profile/[username].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Profile from './profile';
import Cookie from 'js-cookie'; // Import js-cookie
import styles from './Profile.module.css';


const UserProfilePage = () => {
  const router = useRouter();
  const { username } = router.query;
  const [currentUserID, setCurrentUserID] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedInUser = Cookie.get('user'); // Fetch the 'user' cookie
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setCurrentUserID(foundUser.id); // Assuming the user object contains an `id` property
    }
    setLoading(false); // Set loading to false after checking for user
  }, []);


  if (loading) {
    return <div style={{marginTop: '59px'}}><div className={styles.skeletonContainer}>
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
  </div></div>;
  }

  // Ensure username is a string
  if (typeof username !== 'string') {
    return <div>Error: Invalid username.</div>;
  }

  return <Profile username={username} currentUserID={currentUserID} />;
};

export default UserProfilePage;
