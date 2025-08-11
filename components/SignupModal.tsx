import React, { useState } from 'react';
import Modal from './Modal';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignup: (username: string, email: string) => void;
  onSwitchToLogin: () => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose, onSignup, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("كلمتا المرور غير متطابقتين!");
      return;
    }
    // Simulate signup
    if (username && email) {
        onSignup(username, email);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إنشاء حساب جديد">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="signup-username" className="block text-sm font-medium text-gray-300 mb-1">اسم المستخدم</label>
          <input
            type="text"
            id="signup-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="اسم المستخدم"
          />
        </div>
        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-gray-300 mb-1">البريد الإلكتروني</label>
          <input
            type="email"
            id="signup-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label htmlFor="signup-password"className="block text-sm font-medium text-gray-300 mb-1">كلمة المرور</label>
          <input
            type="password"
            id="signup-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="********"
          />
        </div>
         <div>
          <label htmlFor="confirm-password"className="block text-sm font-medium text-gray-300 mb-1">تأكيد كلمة المرور</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="********"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-cyan-500 text-white hover:bg-cyan-600 font-bold py-2.5 px-4 rounded-lg transition-colors duration-300"
        >
          إنشاء حساب
        </button>
        <p className="text-center text-sm text-gray-400">
          لديك حساب بالفعل؟{' '}
          <button type="button" onClick={onSwitchToLogin} className="font-semibold text-cyan-400 hover:underline">
            سجل الدخول
          </button>
        </p>
      </form>
    </Modal>
  );
};

export default SignupModal;