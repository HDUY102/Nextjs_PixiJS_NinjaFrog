import GameCanvas from './components/GameCanvas';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white font-sans">
      <h1 className="text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Advanced Game Architecture
      </h1>
      
      <GameCanvas />

      <div className="mt-2 p-6 bg-gray-800 rounded-xl border border-gray-700 max-w-lg">
        <h2 className="text-xl font-semibold mb-4 text-green-400">Controls</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <kbd className="px-2 py-1 bg-gray-700 rounded border border-gray-600">A</kbd>
            <kbd className="px-2 py-1 bg-gray-700 rounded border border-gray-600">D</kbd>
            <span>Di chuyển</span>
          </div>
          <div className="flex items-center space-x-2">
            <kbd className="px-2 py-1 bg-gray-700 rounded border border-gray-600">Space</kbd>
            <span>Nhảy</span>
          </div>
        </div>
        <p className="mt-4 text-gray-400 italic text-xs">
          *Sử dụng Generics, Component Pattern & Factory Pattern.
        </p>
      </div>
    </div>
  );
}