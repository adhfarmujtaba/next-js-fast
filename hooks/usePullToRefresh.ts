import { useEffect, useState, useCallback } from 'react';

const usePullToRefresh = (
  fetchData: () => Promise<void>,
  setPullDistance: (distance: number) => void,
  setIsLoading: (loading: boolean) => void,
  menuOpen: boolean // Accept the menuOpen state
) => {
  const [isPulling, setIsPulling] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startX, setStartX] = useState(0);
  const [currentPullDistance, setCurrentPullDistance] = useState(0);
  const pullScale = 5.0;
  const threshold = 60;
  const maxPullDistance = 70;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0 && !menuOpen) {
      setStartY(e.touches[0].clientY);
      setStartX(e.touches[0].clientX);
    } else {
      setStartY(0); // Reset if not at top or if menu is open
    }
  }, [menuOpen]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (startY !== 0 && !menuOpen) {
      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;

      // Determine the movement direction
      const deltaY = currentY - startY;
      const deltaX = currentX - startX;

      // Only allow pulling if the movement is primarily vertical
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        const pullDistance = Math.max(0, deltaY * pullScale);
        const cappedPullDistance = Math.min(pullDistance, maxPullDistance);

        if (cappedPullDistance > 0) {
          setIsPulling(true);
          setCurrentPullDistance(cappedPullDistance);
          setPullDistance(cappedPullDistance);
          e.preventDefault(); // Prevent default behavior during move
        }
      }
    }
  }, [startY, startX, pullScale, setPullDistance, menuOpen]);

  const handleTouchEnd = useCallback(async () => {
    if (isPulling) {
      setIsLoading(true);
      
      if (currentPullDistance > threshold) {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate loading
        window.location.reload();
      } else {
        await fetchData(); // Trigger data fetch
      }

      // Reset states and visual pull distance
      setPullDistance(0);
      setIsPulling(false);
      setCurrentPullDistance(0);
      setIsLoading(false);
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
