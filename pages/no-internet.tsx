import { NextPage } from 'next';
import { Box, Typography, Button } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';

const NoInternet: NextPage = () => {
    return (
        <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            height="100vh" 
            textAlign="center" 
            bgcolor="#f9f9f9"
        >
            <WifiOffIcon style={{ fontSize: '100px', color: '#ff5722' }} />
            <Typography variant="h4" component="h1" color="#333" gutterBottom>
                No Internet Connection
            </Typography>
            <Typography variant="body1" color="#555" gutterBottom>
                It seems you are not connected to the internet. Please check your connection.
            </Typography>
            <Button 
                variant="contained" 
                color="primary" 
                onClick={() => window.location.reload()}
            >
                Retry
            </Button>
        </Box>
    );
};

export default NoInternet;
