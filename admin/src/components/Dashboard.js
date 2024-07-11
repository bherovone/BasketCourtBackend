import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { jwtDecode } from 'jwt-decode';

function Dashboard() {
    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log('Token in localStorage:', token);
        if (token) {
            const decoded = jwtDecode(token);
            console.log('Decoded token:', decoded);
        }
    }, []);

    return (
        <div className="min-h-screen flex">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 p-6 bg-gray-100">
                    <h2 className="text-3xl mb-4">Welcome to the Admin Dashboard</h2>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;
