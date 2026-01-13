import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Account = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [account, setAccount] = useState({ username: '', email: '' });
  const [regForm, setRegForm] = useState({ username: '', email: '', password: '' });
  const [editForm, setEditForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      api.get('/account').then(res => setAccount(res.data)).catch(() => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      });
    }
  }, [isLoggedIn]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', regForm);
      localStorage.setItem('token', res.data.access_token);
      setIsLoggedIn(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/account', {}, { params: editForm });
      if (editForm.email) setAccount({ ...account, email: editForm.email });
      setEditForm({ email: '', password: '' });
      setError('');
    } catch (err) {
      setError('Update failed');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleRegister}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  value={regForm.username}
                  onChange={e => setRegForm({ ...regForm, username: e.target.value })}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={regForm.email}
                  onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={regForm.password}
                  onChange={e => setRegForm({ ...regForm, password: e.target.value })}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  required
                />
              </div>
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Register
              </button>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Sign in
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Your Account
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          <div>
            <p className="text-sm font-medium text-gray-700">Username: {account.username}</p>
            <p className="text-sm font-medium text-gray-700">Email: {account.email}</p>
          </div>
          <form className="space-y-6" onSubmit={handleEdit}>
            <div>
              <input
                type="email"
                placeholder="New Email"
                value={editForm.email}
                onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="New Password"
                value={editForm.password}
                onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Update Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Account;