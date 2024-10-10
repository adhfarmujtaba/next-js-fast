import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import './header.css'; // Import CSS file

interface HeaderProps {
  toggleMenu: () => void;
  isMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleMenu, isMenuOpen }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const menuIconRef = useRef<HTMLDivElement>(null);
  
  // State to manage header visibility and position
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true); // New state for top position

  const handleToggleMenu = () => toggleMenu();

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';

      const handleClickOutside = (event: MouseEvent | TouchEvent) => {
        const target = event instanceof MouseEvent ? event.target : (event as TouchEvent).target;

        if (
          menuRef.current && !menuRef.current.contains(target as Node) &&
          menuIconRef.current && !menuIconRef.current.contains(target as Node)
        ) {
          toggleMenu(); // Close the menu
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
        document.body.style.overflow = 'auto';
      };
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMenuOpen, toggleMenu]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Check if scrolling down or up
      if (currentScrollY > lastScrollY) {
        setIsVisible(false); // Scrolling down
      } else {
        setIsVisible(true); // Scrolling up
      }

      // Check if at the top of the page
      setIsAtTop(currentScrollY === 0);

      setLastScrollY(currentScrollY); // Update last scroll position
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <header style={{ 
      top: isVisible ? '0' : '-80px', 
      position: isAtTop ? 'relative' : 'fixed',
      transition: 'top 0.3s, position 0.3s'
    }}>
      <div className="custom-header">
        <div className="menu-and-logo">
          <div
            ref={menuIconRef}
            className={`menu-icon ${isMenuOpen ? 'change' : ''}`}
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
          <span className="material-icons icon search-icon">search</span>
          <span className="material-icons icon user-icon">account_circle</span>
        </div>

        <div ref={menuRef} className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
          <ul>
            <li><Link href="/" onClick={handleToggleMenu}>Home</Link></li>
            <li><Link href="/about" onClick={handleToggleMenu}>About</Link></li>
            <li><Link href="/contact" onClick={handleToggleMenu}>Contact</Link></li>
            <li><Link href="/bookmark" onClick={handleToggleMenu}>Bookmark</Link></li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
