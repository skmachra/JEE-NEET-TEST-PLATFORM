import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-blue-600 text-white py-4">
            <div className="container mx-auto text-center">
                <p className="text-sm mb-2">© {new Date().getFullYear()} JEE-NEET TEST. All rights reserved.</p>
                <div className="mt-2">
                    <Link to="/terms" className="text-gray-200 hover:text-gray-100 mx-2 transition duration-200">Terms of Service</Link>
                    <Link to="/privacy" className="text-gray-200 hover:text-gray-100 mx-2 transition duration-200">Privacy Policy</Link>
                </div>
                <div className="mt-4 flex justify-center space-x-4">
                    <a href="https://www.instagram.com/sk_machra" target="_blank" rel="noopener noreferrer">
                        <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" className="w-6 h-6"/>
                    </a>
                    <a href="https://x.com/sk_machra" target="_blank" rel="noopener noreferrer">
                        <img src="https://cdn-icons-png.flaticon.com/512/5968/5968830.png" alt="Twitter" className="w-6 h-6"/>
                    </a>
                    <a href="https://www.linkedin.com/in/sunil-kumar-89920b286" target="_blank" rel="noopener noreferrer">
                        <img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" alt="LinkedIn" className="w-6 h-6"/>
                    </a>
                    <a href="https://github.com/skmachra" target="_blank" rel="noopener noreferrer">
                        <img src="https://cdn-icons-png.flaticon.com/512/25/25657.png" alt="GitHub" className="w-6 h-6"/>
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
