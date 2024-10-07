import { AppProps } from 'next/app';
import { AnimatePresence, motion } from 'framer-motion';
import Header from '../components/Header';
import usePullToRefresh from '../hooks/usePullToRefresh';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import '../app/globals.css';

const MyApp = ({ Component, pageProps, router }: AppProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  
  const fetchNewData = async () => {
    console.log("Fetching new data...");
    // Remove the delay for faster loading
    // await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate network delay
    // You can replace this with your actual fetch logic if needed
    console.log("Data fetched");
  };

  const { isPulling, currentPullDistance } = usePullToRefresh(fetchNewData, setPullDistance, setIsLoading);

  return (
    <AnimatePresence mode="wait">
      <div style={{ overflow: 'hidden', position: 'relative' }}>
        <Header />
        
        {isPulling && !isLoading && (
          <div style={{
            position: 'absolute',
            top: '60px', // Adjust based on your header height
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
            top: '60px', // Adjust based on your header height
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

        <motion.div
          key={router.route}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: pullDistance }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            transform: `translateY(${pullDistance}px)`,
            transition: 'transform 0.3s ease-in-out',
            willChange: 'transform',
            position: 'relative',
          }}
        >
          <Component {...pageProps} />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MyApp;
