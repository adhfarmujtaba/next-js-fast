import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import UserDropdown from './UserDropdown';
import './header.css';

interface HeaderProps {
  toggleMenu: () => void;
  isMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleMenu, isMenuOpen }) => {
  const menuIconRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleToggleMenu = () => toggleMenu();

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(prev => !prev);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 80) {
        setIsVisible(currentScrollY <= lastScrollY); // Show on scroll up
      } else {
        setIsVisible(true); // Always show if within 80px
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const updateUserState = () => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      setIsLoggedIn(true);
      setAvatarUrl(parsedUser.avatar);
    } else {
      setIsLoggedIn(false);
      setAvatarUrl(null);
    }
  };

  useEffect(() => {
    updateUserState(); // Set initial state

    // Listen for storage changes
    window.addEventListener('storage', updateUserState);
    
    return () => {
      window.removeEventListener('storage', updateUserState);
    };
  }, []);

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

  return (
    <header style={{ 
      top: isVisible ? '0' : '-80px', 
      position: lastScrollY <= 80 ? 'relative' : 'fixed',
      transition: 'top 0.3s ease-in-out',
      opacity: lastScrollY > 80 ? (isVisible ? 1 : 0.8) : 1 // Slightly transparent after 80px
    }}>
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
            <Link href="/" className="logo-link">Leak News</Link>
          </div>
        </div>

        <div className="header-icons">
          <span className="material-icons icon notification-icon">notifications</span>
          <span className="material-icons icon search-icon" onClick={handleSearchClick} style={{ cursor: 'pointer' }}>
            search
          </span>
          {isLoggedIn && avatarUrl ? (
            <img src={avatarUrl} alt="User Avatar" className="user-avatar-login" onClick={toggleUserDropdown} style={{ cursor: 'pointer' }} />
          ) : (
            <span className="material-icons icon user-icon" onClick={toggleUserDropdown} style={{ cursor: 'pointer' }}>account_circle</span>
          )}
        </div>
        {isUserDropdownOpen && <UserDropdown onClose={() => setIsUserDropdownOpen(false)} />}
      </div>
    </header>
  );
};

export default Header;
