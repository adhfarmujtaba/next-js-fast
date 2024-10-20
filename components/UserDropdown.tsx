import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MdPerson, MdSettings, MdExitToApp, MdLogin } from 'react-icons/md'; 
import './UserDropdown.css';

interface User {
  username: string;
  // Add other properties if needed
}

interface UserDropdownProps {
  onClose: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ onClose }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Close dropdown on scroll
  useEffect(() => {
    const handleScroll = () => {
      onClose();
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [onClose]);

  return (
    <div className="user-dropdown">
      <ul>
        {user ? (
          <>
            <li>
              <Link href={`/profile/${user.username}`} onClick={onClose}>
                <MdPerson /> Profile
              </Link>
            </li>
            <li>
              <Link href="/settings" onClick={onClose}>
                <MdSettings /> Settings
              </Link>
            </li>
            <li>
              <Link href="/login" onClick={() => {
                localStorage.removeItem('user');
                setUser(null);
                onClose();
              }}>
                <MdExitToApp /> Logout
              </Link>
            </li>
          </>
        ) : (
          <li>
            <Link href="/login" onClick={onClose}>
              <MdLogin /> Login
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
};

export default UserDropdown;
