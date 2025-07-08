import React from 'react';
export const HeroSection = ({ content }: { content: string }) => (
  <section className="py-12 px-8 bg-white dark:bg-gray-900 text-center rounded-lg shadow mb-4">
    <h1 className="text-4xl font-extrabold mb-4 text-blue-700 dark:text-blue-300">{content}</h1>
    <p className="text-lg text-gray-600 dark:text-gray-300">A modern solution for your business needs.</p>
  </section>
);
