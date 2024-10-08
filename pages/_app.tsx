import { AppProps } from 'next/app';
import { AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import usePullToRefresh from '../hooks/usePullToRefresh';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import '../app/globals.css';

const MyApp = ({ Component, pageProps, router }: AppProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true); // Track initial load

  const fetchNewData = async () => {
    console.log("Fetching new data...");
    // Replace this with your actual fetch logic if needed
    console.log("Data fetched");
  };

  const { isPulling, currentPullDistance } = usePullToRefresh(fetchNewData, setPullDistance, setIsLoading);

  useEffect(() => {
    // Set initialLoad to false after the first render
    setInitialLoad(false);
  }, []);

  const isIndexPage = router.route === '/'; // Check if the current route is the index page

  return (
    <AnimatePresence mode="wait">
      <div style={{ overflow: 'hidden', position: 'relative' }}>
        <Header />

        {isPulling && !isLoading && (
          <div style={{
            position: 'absolute',
            top: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            transition: 'opacity 0.3s',
          }}>
            <FontAwesomeIcon icon={faSync} spin style={{ marginRight: '8px' }} />
            <span>{currentPullDistance > 50 ? 'Release to refresh...' : 'Pull to refresh...'}</span>
          </div>
        )}

        {isLoading && (
          <div style={{
            position: 'absolute',
            top: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            transition: 'opacity 0.3s',
          }}>
            <FontAwesomeIcon icon={faSync} spin style={{ marginRight: '8px' }} />
            <span>Loading...</span>
          </div>
        )}

        <div
          style={{
            transform: `translateY(${pullDistance}px)`,
            transition: 'transform 0.3s ease-in-out',
            willChange: 'transform',
            position: 'relative',
          }}
        >
          <Component {...pageProps} />
        </div>
      </div>
    </AnimatePresence>
  );
};

export default MyApp;
