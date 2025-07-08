import React from 'react';
export const FeaturesSection = ({ content }: { content: string }) => (
  <section className="py-8 px-8 bg-gray-50 dark:bg-gray-800 rounded-lg shadow mb-4">
    <h2 className="text-2xl font-bold mb-2 text-blue-600 dark:text-blue-300">Features</h2>
    <ul className="list-disc list-inside text-gray-700 dark:text-gray-200">
      {content.split('\n').map((f, i) => <li key={i}>{f}</li>)}
    </ul>
  </section>
);
