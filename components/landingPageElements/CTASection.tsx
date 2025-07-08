import React from 'react';
export const CTASection = ({ content }: { content: string }) => (
  <section className="py-8 px-8 bg-blue-600 rounded-lg shadow mb-4 text-center">
    <button className="px-8 py-4 bg-white text-blue-600 font-bold text-xl rounded-full shadow hover:bg-blue-50 transition">{content}</button>
  </section>
);
