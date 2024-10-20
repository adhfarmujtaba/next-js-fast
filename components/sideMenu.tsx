import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaHome, FaInfoCircle, FaEnvelope, FaBookmark } from 'react-icons/fa'; // Import icons

interface SideMenuProps {
  isMenuOpen: boolean;
  handleToggleMenu: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isMenuOpen, handleToggleMenu }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  function showOverlay() {
    const overlay = document.querySelector('.overlay') as HTMLElement;
    if (overlay) {
      overlay.style.display = 'block'; // Show the overlay
    }
  }
  
  function hideOverlay() {
    const overlay = document.querySelector('.overlay') as HTMLElement;
    if (overlay) {
      overlay.style.display = 'none'; // Hide the overlay
    }
  }
  

  useEffect(() => {
    if (typeof document !== 'undefined') {
    }  
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      showOverlay();
    //   const handleClickOutside = (event: MouseEvent | TouchEvent) => {
    //     const target = event instanceof MouseEvent ? event.target : (event as TouchEvent).target;

    //     if (menuRef.current && !menuRef.current.contains(target as Node)) {
    //       handleToggleMenu();
    //     }
    //   };

    //   document.addEventListener('mousedown', handleClickOutside);
    //   document.addEventListener('touchstart', handleClickOutside);

    //   return () => {
    //     document.removeEventListener('mousedown', handleClickOutside);
    //     document.removeEventListener('touchstart', handleClickOutside);
    //     document.body.style.overflow = 'auto'; // Re-enable scrolling
    //   };
    } else {
      document.body.style.overflow = 'auto'; // Re-enable scrolling
      hideOverlay();
    }
  }, [isMenuOpen, handleToggleMenu]);

  return (
    <div ref={menuRef} className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
      <div className="menu-header">
        <h5>Menu</h5>
        <div
              
              className={`mm-icon ${isMenuOpen ? 'change' : ''}`}
              onClick={handleToggleMenu}
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
      </div>
      <div className="menu-body">
        <ul>
          <li><Link href="/" onClick={handleToggleMenu}><FaHome /> Home</Link></li>
          <li><Link href="/about" onClick={handleToggleMenu}><FaInfoCircle /> About</Link></li>
          <li><Link href="/contact" onClick={handleToggleMenu}><FaEnvelope /> Contact</Link></li>
          <li><Link href="/bookmark" onClick={handleToggleMenu}><FaBookmark /> Bookmark</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default SideMenu;
