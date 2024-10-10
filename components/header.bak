import React, { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBell, faUser } from '@fortawesome/free-solid-svg-icons';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(prevState => !prevState);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button className={`${styles.hamburger} ${isMenuOpen ? styles.open : ''}`} onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
          <Link href="/" className={styles.logo}>
            My App
          </Link>
          <div className={styles.icons}>
            <button className={styles.iconButton}>
              <FontAwesomeIcon icon={faSearch} />
            </button>
            <button className={styles.iconButton}>
              <FontAwesomeIcon icon={faBell} />
            </button>
            <button className={styles.iconButton}>
              <FontAwesomeIcon icon={faUser} />
            </button>
          </div>
        </div>
      </header>

      <div className={`${styles.sideMenu} ${isMenuOpen ? styles.sideMenuOpen : ''}`}>
        <nav className={styles.navbar}>
          <ul>
            <li><Link href="/" className={styles.link} onClick={closeMenu}>Home</Link></li>
            <li><Link href="/trending" className={styles.link} onClick={closeMenu}>Trending</Link></li>
            <li><Link href="/subscriptions" className={styles.link} onClick={closeMenu}>Subscriptions</Link></li>
            <li><Link href="/library" className={styles.link} onClick={closeMenu}>Library</Link></li>
            <li><Link href="/history" className={styles.link} onClick={closeMenu}>History</Link></li>
            <li><Link href="/settings" className={styles.link} onClick={closeMenu}>Settings</Link></li>
          </ul>
        </nav>
      </div>

      {isMenuOpen && <div className={`${styles.menuOverlay} ${styles.overlayVisible}`} onClick={closeMenu}></div>}
    </>
  );
};

export default Header;
