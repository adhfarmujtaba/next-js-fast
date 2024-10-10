import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/router';
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
  const menuRef = useRef<HTMLDivElement>(null);
  const menuIconRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  const handleToggleMenu = () => toggleMenu();

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
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';

      const handleClickOutside = (event: MouseEvent | TouchEvent) => {
        const target = event instanceof MouseEvent ? event.target : (event as TouchEvent).target;

        if (
          menuRef.current && !menuRef.current.contains(target as Node) &&
          menuIconRef.current && !menuIconRef.current.contains(target as Node)
        ) {
          toggleMenu();
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

      if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setIsAtTop(currentScrollY === 0);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const handleCategoryClick = (event: React.MouseEvent) => {
    event.stopPropagation();
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

      <div className="category-tags">
        <Link href="/" className={`category-tag ${router.asPath === '/' ? 'active' : ''}`} onClick={handleCategoryClick}>All</Link>
        {categories.map((category) => {
          const isActive = router.asPath === `/${category.slug}`;
          console.log(`Checking ${category.slug}: ${isActive}`); // Debug log
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
