import React from 'react';
export const FooterSection = ({ content }: { content: string }) => (
  <footer className="py-4 px-8 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-center rounded-b-lg shadow mt-4">
    {content}
  </footer>
);
