import GameBoard from './components/GameBoard';

export default function App() {
  return (
    <main className="min-h-screen bg-indigo-100 dark:bg-indigo-950 transition-colors duration-300 flex items-center justify-center p-safe">
      <GameBoard />
    </main>
  );
}
