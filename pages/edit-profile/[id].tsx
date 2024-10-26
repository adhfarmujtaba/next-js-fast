import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import styles from './Profile.module.css';
import { FaEdit } from 'react-icons/fa';

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
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userSession = localStorage.getItem('user');
    if (!userSession) {
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      if (userId) {
        try {
          const response = await axios.get(`https://blog.tourismofkashmir.com/api_update_profile.php?id=${userId}`);
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
      const response = await axios.post('https://blog.tourismofkashmir.com/api_update_profile.php', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 'success') {
        setMessage('Avatar updated successfully!');
        if (response.data.data && response.data.data.avatar) {
          setAvatar(response.data.data.avatar);
        }
        handleSessionClear(); // Clear session when avatar is updated
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
      const response = await axios.post('https://blog.tourismofkashmir.com/api_update_profile.php', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 'success') {
        setMessage('Profile updated successfully!');
      } else {
        setMessage(response.data.message);
      }
    } catch (err: unknown) {
      setMessage('Error updating profile: ' + (axios.isAxiosError(err) ? err.message : 'Unknown error'));
    }
  };

  const handleSessionClear = () => {
    setToastMessage("Session expired. Please log in again.");
    setShowToast(true);
    setTimeout(() => {
      localStorage.removeItem('user');
      router.push('/login');
    }, 2000); // Redirect after showing the toast
  };

  const closeToast = () => {
    setShowToast(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Edit Profile</h1>
      {message && <p className={styles.message}>{message}</p>}
      
      {showToast && (
        <div className={styles.toast}>
          <p>{toastMessage}</p>
          <button onClick={closeToast}>Close</button>
        </div>
      )}

      <div className={styles.avatarContainer}>
        <img className={styles.imgPreview} src={preview || `https://blog.tourismofkashmir.com/${avatar}`} alt="Avatar" />
        <div className={styles.editIconContainer}>
          <FaEdit className={styles.editIcon} onClick={() => document.getElementById('avatar-input')?.click()} />
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
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="username">Username:</label>
          {isEditingUsername ? (
            <>
              <input
                className={styles.inputText}
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <button className={styles.editButton} onClick={() => { handleUpdate(); setIsEditingUsername(false); }}>Save</button>
            </>
          ) : (
            <>
              <span>{username}</span>
              <button className={styles.editButton} onClick={() => setIsEditingUsername(true)}>Edit</button>
            </>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="name">Name:</label>
          {isEditingName ? (
            <>
              <input
                className={styles.inputText}
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <button className={styles.editButton} onClick={() => { handleUpdate(); setIsEditingName(false); }}>Save</button>
            </>
          ) : (
            <>
              <span>{name}</span>
              <button className={styles.editButton} onClick={() => setIsEditingName(true)}>Edit</button>
            </>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="email">Email:</label>
          {isEditingEmail ? (
            <>
              <input
                className={styles.inputText}
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button className={styles.editButton} onClick={() => { handleUpdate(); setIsEditingEmail(false); }}>Save</button>
            </>
          ) : (
            <>
              <span>{email}</span>
              <button className={styles.editButton} onClick={() => setIsEditingEmail(true)}>Edit</button>
            </>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="password">New Password:</label>
          {isEditingPassword ? (
            <>
              <input
                className={styles.inputText}
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
              />
              <button className={styles.editButton} onClick={() => { handleUpdate(); setIsEditingPassword(false); }}>Save</button>
            </>
          ) : (
            <>
              <span>******</span>
              <button className={styles.editButton} onClick={() => setIsEditingPassword(true)}>Edit</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
