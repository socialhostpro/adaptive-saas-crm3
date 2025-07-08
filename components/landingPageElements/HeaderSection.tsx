import React from 'react';
export const HeaderSection = ({ content }: { content: string }) => (
  <header className="py-6 px-8 bg-gradient-to-r from-blue-600 to-blue-400 text-white text-2xl font-bold rounded-t-lg shadow">
    {content}
  </header>
);
