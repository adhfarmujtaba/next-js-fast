import React from 'react';

const Loader = () => {
 
    return (
        <div className='skeleton-container'>
            {/* Simulated loop for skeleton loading */}
            {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className='card skeleton-card'>
                    <div className='skeleton-image'></div>
                    <div className='card-content'>
                        <div className='skeleton-title'></div>
                        <div className='skeleton-content'></div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div className='skeleton-avatar'></div> {/* Skeleton for avatar */}
                            <div className='skeleton-username'></div>
                            <div className='skeleton-date'></div> {/* Skeleton for date */}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};


export default Loader;
