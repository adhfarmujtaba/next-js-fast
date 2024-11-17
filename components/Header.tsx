import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import UserDropdown from './UserDropdown';
import Cookie from 'js-cookie'; // Import js-cookie for cookie management
import CONFIG from '../utils/config'; // Adjust the path as needed
import axios from 'axios'; // Import axios for HTTP requests
import './header.css';

interface HeaderProps {
  toggleMenu: () => void;
  isMenuOpen: boolean;
}

interface SiteInfo {
  site_title: string;
  // Add other properties based on your API response
}

const Header: React.FC<HeaderProps> = ({ toggleMenu, isMenuOpen }) => {
  const menuIconRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null); // Use the SiteInfo type

  const handleToggleMenu = () => toggleMenu();

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(prev => !prev);
  };


  useEffect(() => {
    const fetchSiteInfo = async () => {
      try {
        const response = await fetch(`${CONFIG.BASE_URL}/site_info_api.php`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        setSiteInfo(data); // Update the state with the fetched site info
      } catch (err) {
        if (err instanceof Error) {
          console.error("Error fetching site info:", err.message);
          console.error(err.message);
        } else {
          console.error('An unknown error occurred');
        }
      }
    };

    fetchSiteInfo(); // Call the fetch function
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show header on scroll up, hide on scroll down
      if (currentScrollY > 20) {
        setIsVisible(currentScrollY <= lastScrollY); // Show on scroll up
      } else {
        setIsVisible(true); // Always show if within 20px
      }

      setLastScrollY(currentScrollY);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]); // Run effect when scroll position changes


  useEffect(() => {
    // Check if the 'user' cookie exists
    const user = Cookie.get('user');
    
    if (user) {
      const parsedUser = JSON.parse(user);  // Parse the JSON string to an object
      setIsLoggedIn(true);
      setUsername(parsedUser.username); // Set username from the cookie

      // Fetch user profile data from the API using the username
      const fetchUserProfile = async () => {
        try {
          const response = await axios.get(`https://blog.tourismofkashmir.com/api_profile.php?username=${parsedUser.username}`);
          if (response.data && response.data.user) {
            const userProfile = response.data.user;
            setAvatarUrl(userProfile.avatar);  // Set avatar URL from the API response
          } else {
            setAvatarUrl(null);  // Reset if no user data is found
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setAvatarUrl(null); // Reset avatar if the API request fails
        }
      };

      fetchUserProfile(); // Call the function to fetch user profile data

    } else {
      setIsLoggedIn(false);  // If no user cookie, set logged-in state to false
      setAvatarUrl(null);    // Reset avatar URL to null
      setUsername(null);     // Reset username
    }
  }, []); // Only run this effect once on component mount


  useEffect(() => {
    if (typeof document !== 'undefined') {
      const menuIcon = document.querySelector('.mm') as HTMLElement | null;
      if (menuIcon) {
        menuIcon.style.display = isMenuOpen ? 'none' : 'block';
      } else {
        console.warn('Menu icon not found');
      }
    }
  }, [isMenuOpen]);

  const handleSearchClick = () => {
    router.push('/search');
  };

  const handleNotificationClick = () => {
    router.push('/notifications');
  };

  const skeletonStyle = {
    height: '20px', // Adjust height as needed
    backgroundColor: '#e0e0e0', // Light grey background
    borderRadius: '4px', // Rounded corners
    animation: 'pulse 1.5s infinite',
    '@keyframes pulse': {
      '0%': { backgroundColor: '#e0e0e0' },
      '50%': { backgroundColor: '#d0d0d0' }, // Slightly darker grey
      '100%': { backgroundColor: '#e0e0e0' },
    },
  };

  return (
    <header style={{ 
      top: isVisible ? '0' : '-80px', 
      position: lastScrollY <= 10 ? 'relative' : 'fixed',
      transition: 'top 0.5s ease-in-out',
      opacity: lastScrollY > 80 ? (isVisible ? 1 : 0.8) : 1 // Slightly transparent after 80px
    }} id='header'>
      <div className="custom-header">
        <div className="menu-and-logo">
          <div
            ref={menuIconRef}
            className={`menu-icon mm ${isMenuOpen ? 'change' : ''}`}
            onClick={handleToggleMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="logo">
          <Link href="/" className="logo-link">
    {siteInfo ? siteInfo.site_title : <div style={skeletonStyle}></div>}
  </Link>
          </div>
        </div>

        <div className="header-icons">
        {isLoggedIn && <span className="material-icons icon notification-icon" onClick={handleNotificationClick}>notifications</span>}
          <span className="material-icons icon search-icon" onClick={handleSearchClick} style={{ cursor: 'pointer' }}>
            search
          </span>
          {isLoggedIn && avatarUrl ? (
            <img src={avatarUrl} alt="User Avatar" className="user-avatar-login" onClick={toggleUserDropdown} style={{ cursor: 'pointer' }} />
          ) : (
            <span className="material-icons icon user-icon" onClick={toggleUserDropdown} style={{ cursor: 'pointer' }}>account_circle</span>
          )}
        </div>
        <p style={{ display: 'none' }}>{username}</p>
        {isUserDropdownOpen && <UserDropdown onClose={() => setIsUserDropdownOpen(false)} />}
      </div>
    </header>
  );
};

export default Header;
