// pages/login.tsx

import { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import CONFIG from '../utils/config'; // Adjust the path as needed
import { FaUser, FaLock, FaSignInAlt, FaArrowLeft } from 'react-icons/fa';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Back arrow icon
import Link from 'next/link';
import { useRouter } from 'next/router';
import '../app/LoginPage.css'; // Import the CSS file directly

const LoginPage = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post(`${CONFIG.BASE_URL}/apilogin.php`, { username, password });
            
            if (response.data && response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                toast.success(`Login successful! Welcome ${response.data.user.name}!`, {
                    position: "top-center",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    className: 'custom-toast-success' // Custom class for styling
                });
                
                setTimeout(() => router.push('/'), 2000);
            } else {
                toast.error('Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            toast.error('An error occurred during login. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='login'>  
        <div className="login-page">
            <div className="login-form">
                <div className="logo">
                <Link href="/"  className='logo-link-login'>Leak News</Link>
                </div>
                <div className="welcome-text"><h1>Welcome Back!</h1></div>
            
                <form onSubmit={handleLogin}>
                    <div className="items">
                        <div className="input">
                            <FaUser  className='input-i' />
                            <input
                                id="username"
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="items">
                        <div className="input">
                            <FaLock className='input-i' />
                            <input
                                id="password"
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-signin">
                        <button type="submit" className="btn" disabled={isLoading}>
                            {isLoading ? 'Loading...' : <><FaSignInAlt /> Login</>}
                        </button>
                    </div>
                </form>
                <div className="forgot-password">
                    <Link href="/forgot-password">
                        <FaArrowLeft /> Forgot Password?
                    </Link>
                </div>
            </div>
        </div>
        </div>
    );
};

export default LoginPage;
