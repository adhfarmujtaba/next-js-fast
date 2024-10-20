import { AppProps } from 'next/app';
import { AnimatePresence, motion } from 'framer-motion';
import Header from '../components/Header';
import SideMenu from '../components/sideMenu';
import usePullToRefresh from '../hooks/usePullToRefresh';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ToastContainer } from 'react-toastify';
import '../app/globals.css';

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const MyApp = ({ Component, pageProps }: AppProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const fetchNewData = async () => {
    console.log("Fetching new data...");
    console.log("Data fetched");
  };

  const isPostPage = router.pathname.includes('/[category_slug]/[slug]');
  const isLoginPage = router.pathname === '/login';
  const isSearchPage = router.pathname === '/search';

  const { isPulling, currentPullDistance } = usePullToRefresh(
    fetchNewData,
    setPullDistance,
    setIsLoading,
    menuOpen,
    isPostPage,
    isLoginPage,
    isSearchPage
  );

  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };

  useEffect(() => {
    if (isPostPage && isLoginPage && isSearchPage) {
      setPullDistance(0);
      setIsLoading(false);
    }
  }, [isPostPage]);

  return (
    <AnimatePresence mode="wait">
      <SideMenu isMenuOpen={menuOpen} handleToggleMenu={toggleMenu} />

      <Head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <div className={`main ${menuOpen ? 'menu-open' : ''}`} style={{ height: '100vh' }}>
        <ToastContainer />
        <div className={`overlay`}></div>

        {!isLoginPage && !isPostPage && !isSearchPage && <Header toggleMenu={toggleMenu} isMenuOpen={menuOpen} />}

        {isPulling && !isLoading && !isPostPage && !isSearchPage &&  !isLoginPage &&(
          <div style={{
            position: 'absolute',
            top: '120px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            transition: 'opacity 0.3s',
          }}>
            <span className="material-icons" style={{ marginRight: '8px', fontSize: '15px' }}>
              {currentPullDistance > 50 ? 'arrow_downward' : 'arrow_upward'}
            </span>
            <span>{currentPullDistance > 50 ? 'Release to refresh...' : 'Pull to refresh...'}</span>
          </div>
        )}

        {isLoading && !isPostPage  && !isLoginPage && !isSearchPage && (
          <div style={{
            position: 'absolute',
            top: '120px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            transition: 'opacity 0.3s',
          }}>
            <span className="loading-dots" style={{ display: 'flex', alignItems: 'center' }}>
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
              <span style={{ marginLeft: '2px', fontSize: '15px' }}>Loading...</span>
            </span>
          </div>
        )}

        {/* Conditional rendering based on the current route */}
        {isSearchPage   ? (
          <motion.div
            key={router.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
            style={ {
              transform: `translateY(${pullDistance}px)`,
              transition: 'transform 0.3s ease-in-out',
              willChange: 'transform',
              position: 'relative',
          } }
          >
            <Component {...pageProps} />
          </motion.div>
        ) : (
          <div style={!isPostPage ? {
            transform: `translateY(${pullDistance}px)`,
            transition: 'transform 0.3s ease-in-out',
            willChange: 'transform',
            position: 'relative',
          } : { position: 'relative' }}
          
          >
            <Component {...pageProps} />
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};

export default MyApp;
