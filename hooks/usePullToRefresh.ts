import { useEffect, useState, useCallback } from 'react';

const usePullToRefresh = (
  fetchData: () => Promise<void>,
  setPullDistance: (distance: number) => void,
  setIsLoading: (loading: boolean) => void // Add loading state
) => {
  const [isPulling, setIsPulling] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentPullDistance, setCurrentPullDistance] = useState(0);
  const pullScale = 2.4; // Adjust for sensitivity
  const threshold = 50; // Distance to trigger refresh
  const maxPullDistance = 100; // Maximum distance to pull down

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    } else {
      setStartY(0); // Reset if not at top
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (startY !== 0) { // Only proceed if we started a pull
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

  const handleTouchEnd = useCallback(async (e: TouchEvent) => {
    if (isPulling) {
      setIsLoading(true); // Set loading state
      
      if (currentPullDistance > threshold) {
        // Wait for 1 second before reloading the page
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        window.location.reload();
      } else {
        // Trigger data fetch if not enough distance
        await fetchData();
      }

      // Reset visual pull distance
      setPullDistance(0);
      setIsPulling(false);
      setCurrentPullDistance(0); // Reset pull distance

      setIsLoading(false); // Reset loading state
    }
  }, [isPulling, fetchData, setPullDistance, currentPullDistance, threshold, setIsLoading]);

  useEffect(() => {
    const handleTouchStartBind = (e: TouchEvent) => handleTouchStart(e);
    const handleTouchMoveBind = (e: TouchEvent) => handleTouchMove(e);
    const handleTouchEndBind = (e: TouchEvent) => handleTouchEnd(e);

    if (typeof window !== 'undefined') {
      window.addEventListener('touchstart', handleTouchStartBind);
      window.addEventListener('touchmove', handleTouchMoveBind, { passive: false });
      window.addEventListener('touchend', handleTouchEndBind);

      return () => {
        window.removeEventListener('touchstart', handleTouchStartBind);
        window.removeEventListener('touchmove', handleTouchMoveBind);
        window.removeEventListener('touchend', handleTouchEndBind);
      };
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { isPulling, currentPullDistance };
};

export default usePullToRefresh;
