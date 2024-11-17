import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MdPerson, MdSettings, MdExitToApp, MdLogin } from 'react-icons/md'; 
import Cookie from 'js-cookie'; // Import js-cookie for cookie management
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
    // Retrieve the 'user' cookie
    const storedUser = Cookie.get('user');
    
    if (storedUser) {
      // Parse the cookie value (which is a JSON string) into a JavaScript object
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);  // If no cookie is found, set user state to null
    }
  }, []);  // Run once on mount, similar to componentDidMount


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

   const handleLogout = () => {
    // Remove user cookie
    Cookie.remove('user'); // This will delete the 'user' cookie

    // Optionally, reset other user-related state here
    setUser(null); // Reset the user state in React

    // Close any modal or do additional actions
    onClose();
  };

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
            <Link href="/login" onClick={handleLogout}>
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
