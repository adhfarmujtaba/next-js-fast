import { NextPage } from 'next';
import Link from 'next/link';

const Custom404: NextPage = () => {
    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh', 
            textAlign: 'center', 
            backgroundColor: '#f9f9f9'
        }}>
            <h1 style={{ fontSize: '48px', color: '#333' }}>404</h1>
            <h2 style={{ fontSize: '24px', color: '#555' }}>Page Not Found</h2>
            <p style={{ fontSize: '16px', color: '#777' }}>
                Sorry, the page you are looking for does not exist.
            </p>
            <Link href="/">
                <a style={{ 
                    marginTop: '20px', 
                    padding: '10px 20px', 
                    backgroundColor: '#0070f3', 
                    color: '#fff', 
                    borderRadius: '5px', 
                    textDecoration: 'none' 
                }}>
                    Go back to Home
                </a>
            </Link>
        </div>
    );
};

export default Custom404;
