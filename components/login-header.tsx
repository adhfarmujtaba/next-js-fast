// components/loginheader.tsx
import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/router';
import '../app/LoginPage.css'

const LoginHeader: React.FC = () => {
  const router = useRouter();

  return (
    <header className='main-login-h'>
        <div className="login-header">
      
        <ArrowBackIcon
    style={{ cursor: 'pointer', marginRight: '5px' }}
    onClick={() => router.back()}
  />
      
      <div className="login-logo-h" style={{ display: 'flex', alignItems: 'center' }}>
          <p className='logo-title-h' style={{ fontSize: '20px', fontWeight: 'bold' }}>
            Login
          </p>
        </div>
    </div>
     </header> 
  );
};

export default LoginHeader;
