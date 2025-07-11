import './index.css';

console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('All Vite env:', import.meta.env);

function App() {
  return (
    <div>
      <h1>Vite Env Test</h1>
      <p>Check the browser console for environment variable output.</p>
    </div>
  );
}

export default App;
