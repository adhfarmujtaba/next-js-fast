import { useEffect, useState, useCallback } from 'react';

const usePullToRefresh = (
  fetchData: () => Promise<void>,
  setPullDistance: (distance: number) => void,
  setIsLoading: (loading: boolean) => void,
  menuOpen: boolean,
  isPostPage: boolean,
  isLoginPage: boolean,
  isSearchPage: boolean
) => {
  const [isPulling, setIsPulling] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startX, setStartX] = useState(0);
  const [currentPullDistance, setCurrentPullDistance] = useState(0);
  const pullScale = 0.5; // Adjusted for smoother pull
  const threshold = 69; 
  const maxPullDistance = 70; // Increased for a more pronounced effect

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0 && !menuOpen) {
      setStartY(e.touches[0].clientY);
      setStartX(e.touches[0].clientX);
    }
  }, [menuOpen]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (startY !== 0 && !menuOpen) {
      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;

      const deltaY = currentY - startY;
      const deltaX = currentX - startX;

      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        const pullDistance = Math.min(Math.max(0, deltaY * pullScale), maxPullDistance);
        
        if (pullDistance > 0) {
          setIsPulling(true);
          setCurrentPullDistance(pullDistance);
          setPullDistance(pullDistance);
          e.preventDefault();
        }
      }
    }
  }, [startY, startX, pullScale, setPullDistance, menuOpen]);

  const handleTouchEnd = useCallback(async () => {
    if (isPulling && currentPullDistance > threshold) {
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }

      setIsLoading(true);

      if (!isPostPage && !isLoginPage && !isSearchPage) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        window.location.reload();
      } else {
        await fetchData();
      }
    }

    // Reset states
    setPullDistance(0);
    setIsPulling(false);
    setCurrentPullDistance(0);
    setIsLoading(false);
  }, [isPulling, fetchData, setPullDistance, currentPullDistance, threshold, setIsLoading, isPostPage, isLoginPage, isSearchPage]);

  useEffect(() => {
    const preventDefaultScroll = (e: TouchEvent) => {
      if (isPulling) {
        e.preventDefault();
      }
    };

    const handleTouchStartBind = (e: TouchEvent) => handleTouchStart(e);
    const handleTouchMoveBind = (e: TouchEvent) => handleTouchMove(e);
    const handleTouchEndBind = () => handleTouchEnd();

    if (typeof window !== 'undefined') {
      window.addEventListener('touchstart', handleTouchStartBind);
      window.addEventListener('touchmove', handleTouchMoveBind, { passive: false });
      window.addEventListener('touchend', handleTouchEndBind);
      window.addEventListener('touchmove', preventDefaultScroll, { passive: false });

      return () => {
        window.removeEventListener('touchstart', handleTouchStartBind);
        window.removeEventListener('touchmove', handleTouchMoveBind);
        window.removeEventListener('touchend', handleTouchEndBind);
        window.removeEventListener('touchmove', preventDefaultScroll);
      };
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, isPulling]);

  return { isPulling, currentPullDistance };
};

export default usePullToRefresh;  