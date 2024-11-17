import { AppProps } from 'next/app';
import { AnimatePresence, motion } from 'framer-motion';
import Header from '../components/Header';
import SideMenu from '../components/sideMenu';
import usePullToRefresh from '../hooks/usePullToRefresh';
import CategoryTags from '../components/CategoryTags'; // Import the new component
import NotificationHeader  from '../components/notifications-header';
import LoginHeader from '../components/login-header';
import ProfileHeader from '../components/profile-header';
import { ModalProvider, useModal } from '../context/ModalContext';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS file for toast notifications
import '../app/globals.css';

const pageTransition = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -40 },
};

// const ModalStatusLogger: React.FC = () => {
//   const { isModalOpen } = useModal();

//   useEffect(() => {
//     console.log('Is Modal Open:', isModalOpen);
//   }, [isModalOpen]);

//   return null; 
// };

const ModelMyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <ModalProvider>
      <MyApp Component={Component} pageProps={pageProps} />
    </ModalProvider>
  );
};

const MyApp = ({ Component, pageProps }: { Component: React.ComponentType; pageProps: Record<string, unknown> }) => {

  const [pullDistance, setPullDistance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false); // Start as false
  const { isModalOpen } = useModal(); // Move useModal here

  const router = useRouter();

  const fetchNewData = async () => {
    console.log("Fetching new data...");
    console.log("Data fetched");
  };

  const isPostPage = router.pathname.includes('/[category_slug]/[slug]');
  const isLoginPage = router.pathname === '/login';
  const isSearchPage = router.pathname === '/search';
  const isNotifications = router.pathname === '/notifications';
  const isProfilePage = router.pathname.startsWith('/profile'); // Use startsWith for dynamic routes
  const isEditProfilePage = router.pathname === '/edit-profile/[id]';
  

  const { isPulling, currentPullDistance } = usePullToRefresh(
    fetchNewData,
    setPullDistance,
    setIsLoading,
    menuOpen,
    isPostPage,
    isLoginPage,
    isSearchPage,
    isModalOpen
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


  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      console.log('Online');
    };

    const handleOffline = () => {
      setIsOffline(true);
      console.log('Offline');
    };
    setIsOffline(!navigator.onLine); // Check on initial load

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  console.log('Current Pull Distance:', currentPullDistance);

  const handleToggleMenu = () => {
    setMenuOpen((prev) => !prev);
    // Optionally show/hide overlay here if needed
  };

  return (
    <AnimatePresence mode="wait">
      <SideMenu isMenuOpen={menuOpen} handleToggleMenu={toggleMenu} />

      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat+Alternates:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Pacifico&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>


      {isOffline ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          textAlign: 'center',
          padding: '20px',
          boxSizing: 'border-box',
          position: 'absolute',
          width: '100%',
          top: 0,
          left: 0,
          zIndex: 1000,
        }}>
          <div>
            <span className="material-icons" style={{ fontSize: '48px' }}>
              signal_wifi_off
            </span>
            <h2 style={{ margin: '10px 0' }}>No Internet Connection</h2>
            <p>Please check your internet connection and try again.</p>
          </div>
        </div>
      ) : (

      <div className={`main ${menuOpen ? 'menu-open' : ''}`} id='main'>
        <ToastContainer />
        <div className={`overlay`} onClick={handleToggleMenu}></div>
        { (isProfilePage || isEditProfilePage) && <ProfileHeader /> }
        { isNotifications && <NotificationHeader /> }
       { isLoginPage && <LoginHeader  /> }
        {!isLoginPage && !isPostPage && !isSearchPage &&!isNotifications && !isProfilePage && !isEditProfilePage &&<Header toggleMenu={toggleMenu} isMenuOpen={menuOpen} />}

        {isPulling && !isLoading && !isPostPage && !isSearchPage && !isLoginPage && (
          
  <div style={{
    position: 'absolute',
    top: `${Math.max(10, currentPullDistance)}px`, // Conditional top value // Sets top based on currentPullDistance, ensuring it doesn't go below 0
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent for better visibility
    borderRadius: '4px', // Soft edges
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
    zIndex: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center', // Centers content horizontally
    opacity: 1, // Ensure initial visibility
    transition: 'top 0.3s ease-in-out, opacity 0.3s ease-in-out', // Smooth transition effect
  }}>
    <span className="material-icons" style={{ marginRight: '8px', fontSize: '15px' }}>
      {currentPullDistance > 50 ? 'arrow_upward' : 'arrow_downward'}
    </span>
    <span>{currentPullDistance > 50 ? 'Release to refresh...' : 'Pull to refresh...'}</span>
  </div>
)}


        {isLoading && !isPostPage  && !isLoginPage && !isSearchPage && !isModalOpen && (
          <div style={{
            position: 'absolute',
            top: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent for better visibility
            borderRadius: '4px', // Soft edges
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
            zIndex: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center', // Centers content horizontally
            opacity: 1, // Ensure initial visibility
            transition: 'top 0.3s ease-in-out, opacity 0.3s ease-in-out', // Smooth transition effect
          }}>
            <span className="loading-dots" style={{ display: 'flex', alignItems: 'center' }}>
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
              {/* <span style={{ marginLeft: '2px', fontSize: '15px' }}>Loading...</span> */}
            </span>
          </div>
        )}

        {/* Conditional rendering based on the current route */}
        {isSearchPage || isLoginPage ? (
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
          <div style={!isPostPage && !isSearchPage && !isLoginPage && !isModalOpen ? {
            transform: `translateY(${pullDistance}px)`,
            transition: 'transform 0.3s ease-in-out',
            willChange: 'transform',
            position: 'relative',
          } : { position: 'relative' }}
          
          >
              {!isLoginPage && !isPostPage && !isSearchPage &&!isNotifications && !isProfilePage && !isEditProfilePage &&<CategoryTags />}
            <Component {...pageProps} />
          </div>
        )}
      </div>
      )}
    </AnimatePresence>
  );
};

export default ModelMyApp;