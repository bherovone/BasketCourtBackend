import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div className="w-64 bg-gray-800 text-white flex flex-col">
            <div className="p-4 text-2xl font-bold">Admin Panel</div>
            <nav className="flex-1">
                <ul>
                    <li className="p-4 hover:bg-gray-700">
                        <Link to="/dashboard" className="block">Dashboard</Link>
                    </li>
                    <li className="p-4 hover:bg-gray-700">
                        <Link to="/users" className="block">Users</Link>
                    </li>
                    <li className="p-4 hover:bg-gray-700">
                        <Link to="/courts" className="block">Courts</Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
}

export default Sidebar;
