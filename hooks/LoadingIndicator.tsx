// components/LoadingIndicator.tsx
import React from 'react';

const LoadingIndicator = ({ message }: { message: string }) => (
  <div style={{ textAlign: 'center', padding: '10px' }}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      style={{ width: '24px', height: '24px', animation: 'spin 1s linear infinite' }}
    >
      <circle cx="12" cy="12" r="10" stroke="gray" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 12H10m0 0l2-2m-2 2l2 2" />
    </svg>
    <p>{message}</p>
  </div>
);

export default LoadingIndicator;
