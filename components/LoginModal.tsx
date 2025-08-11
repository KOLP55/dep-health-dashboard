import React, { useState } from 'react';
import Modal from './Modal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, email: string) => void;
  onSwitchToSignup: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd validate and send this to a server.
    // For this demo, we'll just simulate a login.
    if (email) {
      onLogin(email.split('@')[0], email); // Use part of email as username
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تسجيل الدخول">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">البريد الإلكتروني</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">كلمة المرور</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="********"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-cyan-500 text-white hover:bg-cyan-600 font-bold py-2.5 px-4 rounded-lg transition-colors duration-300"
        >
          دخول
        </button>
        <p className="text-center text-sm text-gray-400">
          ليس لديك حساب؟{' '}
          <button type="button" onClick={onSwitchToSignup} className="font-semibold text-cyan-400 hover:underline">
            أنشئ حساباً جديداً
          </button>
        </p>
      </form>
    </Modal>
  );
};

export default LoginModal;