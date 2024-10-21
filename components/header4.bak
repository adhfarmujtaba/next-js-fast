import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/router';
import UserDropdown from './UserDropdown';
import './header.css';

interface HeaderProps {
  toggleMenu: () => void;
  isMenuOpen: boolean;
}

interface Category {
  name: string;
  slug: string;
}

const Header: React.FC<HeaderProps> = ({ toggleMenu, isMenuOpen }) => {
  const menuIconRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  const handleToggleMenu = () => toggleMenu();

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(prev => !prev);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://blog.tourismofkashmir.com/apis?categories&order_index=asc&header_menu_is_included=TRUE');
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY <= lastScrollY);
      setIsAtTop(currentScrollY === 0);
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

  const handleCategoryClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const handleSearchClick = () => {
    router.push('/search');
};

  return (
    <>
      <header style={{ 
        top: isVisible ? '0' : '-80px', 
        position: isAtTop ? 'relative' : 'fixed',
        transition: 'top 0.3s, position 0.3s'
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

      <div className="category-tags">
        <Link href="/" className={`category-tag ${router.asPath === '/' ? 'active' : ''}`} onClick={handleCategoryClick}>All</Link>
        {categories.map((category) => {
          const isActive = router.asPath === `/${category.slug}`;
          return (
            <Link 
              key={category.slug} 
              href={`/${category.slug}`} 
              className={`category-tag ${isActive ? 'active' : ''}`} 
              onClick={handleCategoryClick}
            >
              {category.name}
            </Link>
          );
        })}
      </div>
    </>
  );
};

export default Header;
