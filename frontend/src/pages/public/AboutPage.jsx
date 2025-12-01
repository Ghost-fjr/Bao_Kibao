import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to home page since About content is now on Landing page
        navigate('/', { replace: true });
    }, [navigate]);

    return null;
};

export default AboutPage;
