import { useEffect, useState, useCallback } from 'react';

const usePullToRefresh = (
  fetchData: () => Promise<void>,
  setPullDistance: (distance: number) => void,
  setIsLoading: (loading: boolean) => void
) => {
  const [isPulling, setIsPulling] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentPullDistance, setCurrentPullDistance] = useState(0);
  const pullScale = 5.0; // Increased for better responsiveness
  const threshold = 60; // Increased to reduce false triggers
  const maxPullDistance = 70; // Increased for a larger pull range

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    } else {
      setStartY(0); // Reset if not at top
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (startY !== 0) {
      const currentY = e.touches[0].clientY;
      const pullDistance = Math.max(0, (currentY - startY) * pullScale);
      const cappedPullDistance = Math.min(pullDistance, maxPullDistance);

      if (cappedPullDistance > 0) {
        setIsPulling(true);
        setCurrentPullDistance(cappedPullDistance);
        setPullDistance(cappedPullDistance);
        e.preventDefault(); // Prevent default behavior during move
      }
    }
  }, [startY, pullScale, setPullDistance]);

  const handleTouchEnd = useCallback(async () => {
    if (isPulling) {
      setIsLoading(true); // Set loading state
      
      if (currentPullDistance > threshold) {
        await new Promise(resolve => setTimeout(resolve, 500)); // 0.5 second delay
        window.location.reload();
      } else {
        await fetchData(); // Trigger data fetch
      }

      // Reset states and visual pull distance
      setPullDistance(0);
      setIsPulling(false);
      setCurrentPullDistance(0);
      setIsLoading(false); // Reset loading state
    }
  }, [isPulling, fetchData, setPullDistance, currentPullDistance, threshold, setIsLoading]);

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
