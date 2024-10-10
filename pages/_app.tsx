import { AppProps } from 'next/app';
import { AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import usePullToRefresh from '../hooks/usePullToRefresh';
import { useState } from 'react';
import Head from 'next/head';
import '../app/globals.css';

const MyApp = ({ Component, pageProps }: AppProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchNewData = async () => {
    console.log("Fetching new data...");
    // Simulate data fetching
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Data fetched");
  };

  const { isPulling, currentPullDistance } = usePullToRefresh(
    fetchNewData,
    setPullDistance,
    setIsLoading,
    menuOpen // Pass the menuOpen state
  );

  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };

  return (
    <AnimatePresence mode="wait">
      <Head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      </Head>
      <div style={{ overflow: 'hidden', position: 'relative' }}>
        <Header toggleMenu={toggleMenu} isMenuOpen={menuOpen} />

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
            <span className="material-icons" style={{ marginRight: '8px', fontSize:'15px' }}>
              {currentPullDistance > 50 ? 'arrow_downward' : 'arrow_upward'}
            </span>
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
            <span className="loading-dots" style={{ display: 'flex', alignItems: 'center' }}>
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
              <span style={{ marginLeft: '2px', fontSize:'15px' }}>Loading...</span>
            </span>
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
