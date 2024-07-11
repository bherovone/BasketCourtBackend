import React from 'react';
import LogoutButton from './LogoutButton';

const Header = () => {
    return (
        <header className="bg-white shadow p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">Basket Ball Court</h1>
            <LogoutButton />
        </header>
    );
}

export default Header;
