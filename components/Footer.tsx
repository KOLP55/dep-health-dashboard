
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-12">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} متجر التطبيقات. جميع الحقوق محفوظة.</p>
        <p className="text-sm mt-1">
          تم إنشاؤه بحب باستخدام React و Tailwind CSS.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
