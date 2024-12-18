import React, { useEffect, useState, useRef } from 'react';
import CONFIG from '../utils/config'; // Adjust the path as needed
import { useRouter } from 'next/router'; // Import useRouter
import Cookie from 'js-cookie'; // Import js-cookie
import '../app/notifications.css';

interface Notification {
  id: string;
  message: string;
  is_read: string;
  url: string;
  fromUsername?: string;   // Optional username field
  fromAvatar?: string;     // Optional avatar field
}

const Notifications: React.FC = () => {
  const router = useRouter(); // Initialize the router
  const [userId, setUserId] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNum, setPageNum] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Check if the 'user' cookie exists
    const loggedInUser = Cookie.get('user'); // Get the 'user' cookie

    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setUserId(foundUser.id); // Set user ID from the cookie
    } else {
      // If no user cookie is found, redirect to login page
      router.push('/login');
    }
  }, [router]); // Re-run when the router changes

  useEffect(() => {
    if (userId !== null) {
      fetchNotifications(pageNum); // Pass the current page number instead
    } else {

      console.warn("User ID is still not set.");
    }
  }, [userId, pageNum]);
  


  const fetchNotifications = async (page: number) => {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/apinotification.php?get_notifications&user_id=${userId}&page=${page}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
    console.log(data);
      // Check if data is an array
      if (!Array.isArray(data)) {
        console.warn('Expected an array but received:', data);
        setHasMore(false);
        return; // Exit the function
      }

      if (data.length === 0) {
        setHasMore(false); // No more notifications to load
      } else {
        setNotifications((prev) => [...prev, ...data]);
        setHasMore(true); // More notifications are available
        
        // Automatically mark notifications as read
        await markNotificationsAsRead();
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error fetching notifications:", err.message);
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      await fetch(`${CONFIG.BASE_URL}/apinotification.php?update_all_notifications=1&user_id=${userId}`, {
        method: 'GET',
      });
    } catch (error) {
      console.error('Error updating notifications:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`${CONFIG.BASE_URL}/apinotification.php?delete_notification=true&user_id=${userId}&notification_id=${notificationId}`, {
        method: 'GET',
      });
  
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  useEffect(() => {
    fetchNotifications(pageNum);
  }, [pageNum]);

  useEffect(() => {
    const lastNotificationElement = document.getElementById('load-more');
    if (loading || !hasMore || !lastNotificationElement) return;

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setPageNum((prev) => prev + 1);
      }
    });

    if (lastNotificationElement) {
      observer.current.observe(lastNotificationElement);
    }

    return () => {
      if (observer.current && lastNotificationElement) {
        observer.current.unobserve(lastNotificationElement);
      }
    };
  }, [loading, hasMore]);

  const handleNotificationClick = (url: string) => {
    router.push(`/${url}`);
  };

  if (loading && notifications.length === 0) return <div className="loading" style={{marginTop: '85px'}}>Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="notifications-container">
      <ul className="notifications-list">
        {notifications.map(notification => (
          <li key={notification.id} className={`notification-item ${notification.is_read === "0" ? 'unread' : ''}`}  onClick={() => handleNotificationClick(notification.url)}>
              {notification.fromAvatar && (
                <img src={notification.fromAvatar} alt={`${notification.fromUsername}'s avatar`} className="notification-avatar" />
              )}
              <span className="notification-message">
                {notification.fromUsername ? <strong>{notification.fromUsername}</strong> : null}
                {notification.fromUsername ? `: ${notification.message}` : notification.message}
              </span>
              <button className="delete-button"  onClick={(event) => {
    event.stopPropagation(); // Prevent the click event from bubbling up to the Link
    deleteNotification(notification.id);
  }}>Delete</button>
            </li>
        ))}
      </ul>
      {loading && <div className="loading">Loading more...</div>}
      {!hasMore && notifications.length > 0 && <div className="no-more-notifications">-----------No more notifications-----------</div>}
      <div id="load-more" style={{ height: '20px' }}></div>
    </div>
  );
};

export default Notifications;
