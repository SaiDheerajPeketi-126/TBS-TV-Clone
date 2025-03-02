import React from 'react';

function Footer() {
  return (
    <footer className="h-6 bg-gray-800 border-t border-gray-700 flex items-center justify-between px-4 text-xs text-gray-400">
      <div>© 2025 TradingClone</div>
      <div className="flex space-x-4">
        <a href="#" className="hover:text-gray-200">Terms</a>
        <a href="#" className="hover:text-gray-200">Privacy</a>
        <a href="#" className="hover:text-gray-200">Help</a>
      </div>
    </footer>
  );
}

export default Footer;