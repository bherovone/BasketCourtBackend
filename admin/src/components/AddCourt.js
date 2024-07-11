import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import Header from './Header';

const AddCourt = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const handleAddCourt = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/v1/court/addcourt', {
        name,
        location: { address, latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert('Court added successfully');
      // Clear input fields after successful submission
      setName('');
      setAddress('');
      setLatitude('');
      setLongitude('');
    } catch (error) {
      console.error(error);
      alert('Failed to add court');
    }
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 bg-gray-100">
          <div className="container mx-auto p-4 bg-white rounded shadow">
            <h2 className="text-2xl mb-4">Add Court</h2>
            <form onSubmit={handleAddCourt}>
            <div className="mb-4">
            
              <input
                type="text"
                placeholder="Court Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mb-2"
                required
              />
              <input
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mb-2"
                required
              />
              <input
                type="text"
                placeholder="Latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mb-2"
                required
              />
              <input
                type="text"
                placeholder="Longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mb-2"
                required
              />
            </div>
            <button
              
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Court
            </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddCourt;
