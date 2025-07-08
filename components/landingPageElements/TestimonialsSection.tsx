import React from 'react';
export const TestimonialsSection = ({ content }: { content: string }) => (
  <section className="py-8 px-8 bg-white dark:bg-gray-900 rounded-lg shadow mb-4">
    <h2 className="text-2xl font-bold mb-2 text-blue-600 dark:text-blue-300">Testimonials</h2>
    <blockquote className="italic text-gray-700 dark:text-gray-200 border-l-4 border-blue-400 pl-4">{content}</blockquote>
  </section>
);
