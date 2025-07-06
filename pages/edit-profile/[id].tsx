import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Cookie from 'js-cookie'; // Import js-cookie
import styles from './Profile.module.css';
import { FaEdit } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

const Profile = () => {
  const router = useRouter();
  const { id } = router.query;
  const userId = typeof id === 'string' ? id : null;

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const userSession = Cookie.get('user');
    
    if (!userSession) {
      // If no user cookie is found, redirect to login page
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      if (userId) {
        try {
          const response = await axios.get(`https://nexnews.leaknews.net/blog/api_update_profile.php?id=${userId}`);
          if (response.data.status === 'success') {
            setUsername(response.data.data.username);
            setName(response.data.data.name);
            setEmail(response.data.data.email);
            setAvatar(response.data.data.avatar);
          } else {
            setMessage(response.data.message);
          }
        } catch (err) {
          setMessage('Error fetching user data: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
      }
    };

    fetchUserData();
  }, [userId, router]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      
      await updateAvatar(selectedFile);
    }
  };

  const updateAvatar = async (selectedFile: File) => {
    if (userId === null) {
      setMessage('User ID is required.');
      return;
    }

    const formData = new FormData();
    formData.append('id', userId);
    formData.append('avatar', selectedFile);

    try {
      const response = await axios.post('https://nexnews.leaknews.net/blog/api_update_profile.php', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 'success') {
        setMessage('Avatar updated successfully!');
        if (response.data.data && response.data.data.avatar) {
          setAvatar(response.data.data.avatar);
          // Update the cookie with the new avatar URL
          const updatedUser = Cookie.get('user') ? JSON.parse(Cookie.get('user') as string) : {};
          updatedUser.avatar = response.data.data.avatar;
          Cookie.set('user', JSON.stringify(updatedUser), { expires: 7, secure: process.env.NODE_ENV === 'production' });
        }
      } else {
        setMessage(response.data.message);
      }
    } catch (err: unknown) {
      setMessage('Error updating avatar: ' + (axios.isAxiosError(err) ? err.message : 'Unknown error'));
    }
  };

  const handleUpdate = async () => {
    if (userId === null) {
      setMessage('User ID is required.');
      return;
    }

    const formData = new FormData();
    formData.append('id', userId);
    if (username) formData.append('username', username);
    if (name) formData.append('name', name);
    if (email) formData.append('email', email);
    if (password) formData.append('password', password);

    try {
      const response = await axios.post('https://nexnews.leaknews.net/blog/api_update_profile.php', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 'success') {
        toast.success('Profile updated successfully!'); // Show success toast

        // Update the cookie with the new profile data (username, name, email, etc.)
        const updatedUser = Cookie.get('user') ? JSON.parse(Cookie.get('user') as string) : {};
        if (username) updatedUser.username = username;
        if (name) updatedUser.name = name;
        if (email) updatedUser.email = email;
        Cookie.set('user', JSON.stringify(updatedUser), { expires: 7, secure: process.env.NODE_ENV === 'production' });
        
      } else {
        toast.error(response.data.message); // Show error toast
      }
    } catch (err: unknown) {
      toast.error('Error updating profile: ' + (axios.isAxiosError(err) ? err.message : 'Unknown error')); // Show error toast
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Edit Profile</h1>
      {message && <p className={styles.message}>{message}</p>}

      <div className={styles.avatarContainer}>
        <div className={styles.AvatarImageContainer}>
        <img className={styles.imgPreview} src={preview || `https://nexnews.leaknews.net/blog/${avatar}`} alt="Avatar" />
        <div className={styles.editIconContainer}>
          <FaEdit className={styles.editIcon} onClick={() => document.getElementById('avatar-input')?.click()} />
        </div>
        </div>
        <input
          id="avatar-input"
          className={styles.inputFile}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      <div className={styles.form}>
        {/* Username */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="username">Username:</label>
          <input
            className={styles.inputText}
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={handleUpdate}  // Trigger auto-save on blur
            required
          />
        </div>

        {/* Name */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="name">Name:</label>
          <input
            className={styles.inputText}
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleUpdate}  // Trigger auto-save on blur
            required
          />
        </div>

        {/* Email */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="email">Email:</label>
          <input
            className={styles.inputText}
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={handleUpdate}  // Trigger auto-save on blur
            required
          />
        </div>

        {/* Password */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="password">New Password:</label>
          <input
            className={styles.inputText}
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
            onBlur={handleUpdate}  // Trigger auto-save on blur
          />
        </div>
      </div>

      {/* Toastify Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}  // Toast will close after 5 seconds
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }} // Set z-index of toast container
      />
    </div>
  );
};

export default Profile;
