import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router'; // Import useRouter
import DeleteIcon from '@mui/icons-material/Delete'; // Import Material-UI delete icon
import { toast } from 'react-toastify'; // Import toast for success/error notifications
import 'react-toastify/dist/ReactToastify.css'; // Import toast styling
import '../app/Bookmark.css'; // Link to the custom CSS file

const Bookmark = () => {
  const [currentUserID, setCurrentUserID] = useState<number | null>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Initialize the router

  // Fetch logged-in user from localStorage
  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setCurrentUserID(foundUser.id); // Set current user ID from localStorage
    } else {
       router.push('/login');
      setError('User is not logged in.');
      setLoading(false);
    }
  }, []);

  // Fetch bookmarks when currentUserID is available
  useEffect(() => {
    if (currentUserID !== null) {
      const fetchBookmarks = async () => {
        try {
          const response = await axios.get('https://blog.tourismofkashmir.com/bookmark_view_api.php', {
            params: { user_id: currentUserID }, // Fetch bookmarks for the logged-in user
          });
          setBookmarks(response.data);
          setLoading(false);
        } catch (err) {
          setError('Failed to fetch bookmarks.');
          setLoading(false);
        }
      };

      fetchBookmarks();
    }
  }, [currentUserID]);

  // Delete bookmark function using DELETE request
  const handleDelete = async (bookmarkID: string) => {
    if (!currentUserID) {
      toast.error('User not logged in.');
      return;
    }

    try {
      // Perform the DELETE request to remove the bookmark
      const response = await axios.delete(`https://blog.tourismofkashmir.com/bookmark_view_api.php`, {
        params: {
          user_id: currentUserID,
          post_id: bookmarkID, // The ID of the bookmark to delete
        },
      });

      // Check the response for success
      if (response.data.success) {
        setBookmarks((prevBookmarks) => prevBookmarks.filter((b) => b.id !== bookmarkID));
        toast.success('Bookmark deleted successfully.');
      } else {
        toast.error('Failed to delete the bookmark.');
      }
    } catch (err) {
      console.error('Error deleting bookmark:', err);
      toast.error('Error deleting the bookmark.');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  const handleBookmarkClick = (categorySlug: string, slug: string) => {
    router.push(`/${categorySlug}/${slug}`); // Navigate to the bookmark's detail page
  };
  

  return (
    <div className="bookmarkMain">
      <div className="bookmark-container">
        <h1>Your Bookmarks</h1>
        {bookmarks.length === 0 ? (
          <div className="no-bookmarks">No bookmarks available.</div>
        ) : (
          <div className="bookmark-list">
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="bookmark-item" 
              onClick={() => handleBookmarkClick(bookmark.category_slug, bookmark.slug)} // Handle click to navigate

                 >
                <img src={bookmark.full_image_url} alt={bookmark.title} className="bookmark-image" />
                <div className="bookmark-info">
                  <h2 className="bookmark-title">{bookmark.title}</h2>
                </div>
                <DeleteIcon
                  onClick={(e) => {
                    e.stopPropagation(); // Stop the click event from propagating to the parent
                    handleDelete(bookmark.id); // Call the handleDelete function
                  }}
                  className="delete-icon"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmark;
