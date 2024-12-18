// components/ProfileHeader.tsx
import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/router';

const ProfileHeader: React.FC = () => {
  const router = useRouter();
  
  // Check if the current route is the edit profile page
  const isEditProfilePage = router.pathname.startsWith('/edit-profile/');

  return (
    <header id='profile-header'>
      <div className="notification-header" id='notification-header'>
        <ArrowBackIcon
          style={{ cursor: 'pointer', marginRight: '15px' }}
          onClick={() => router.back()}
        />
        <div className="notification-logo" style={{ display: 'flex', alignItems: 'center' }}>
          <p className='notifications-title' style={{ fontSize: '20px', fontWeight: 'bold' }}>
            {isEditProfilePage ? 'Edit Profile' : 'Profile'}
          </p>
        </div>
      </div>
    </header>
  );
};

export default ProfileHeader;
