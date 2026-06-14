import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './components/ui/button';
import AuthScreen from './components/AuthScreen';
import closedChest from './assets/treasure_closed.png';
import keyIcon from './assets/key.png';
import treasureChest from './assets/treasure_opened.png';
import skeletonChest from './assets/treasure_opened_skeleton.png';
import chestOpenSound from './audios/chest_open.mp3';
import evilLaughSound from './audios/chest_open_with_evil_laugh.mp3';
import { api, clearToken, getToken } from './lib/api';
import type { User, GameResult } from './types/auth';

interface Box {
  id: number;
  isOpen: boolean;
  hasTreasure: boolean;
}

export default function App() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Restore session from localStorage without a server ping.
  // Token expiry is decoded locally; the server enforces it on actual API calls.
  useEffect(() => {
    const token = getToken();
    const storedUser = localStorage.getItem('treasure_user');
    if (token && storedUser) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expired = payload.exp && payload.exp * 1000 < Date.now();
        if (!expired) {
          setUser(JSON.parse(storedUser));
        } else {
          clearToken();
          localStorage.removeItem('treasure_user');
        }
      } catch {
        clearToken();
        localStorage.removeItem('treasure_user');
      }
    }
    setAuthChecked(true);
  }, []);

  const initializeGame = () => {
    const treasureBoxIndex = Math.floor(Math.random() * 3);
    const newBoxes: Box[] = Array.from({ length: 3 }, (_, index) => ({
      id: index,
      isOpen: false,
      hasTreasure: index === treasureBoxIndex,
    }));
    setBoxes(newBoxes);
    setScore(0);
    setGameEnded(false);
  };

  useEffect(() => {
    if (user || isGuest) initializeGame();
  }, [user, isGuest]);

  const openBox = (boxId: number) => {
    if (gameEnded) return;
    const target = boxes.find(b => b.id === boxId);
    if (!target || target.isOpen) return;
    new Audio(target.hasTreasure ? chestOpenSound : evilLaughSound).play();

    setBoxes(prevBoxes => {
      const updatedBoxes = prevBoxes.map(box => {
        if (box.id === boxId && !box.isOpen) {
          const newScore = box.hasTreasure ? score + 150 : score - 50;
          setScore(newScore);
          return { ...box, isOpen: true };
        }
        return box;
      });

      const treasureFound = updatedBoxes.some(box => box.isOpen && box.hasTreasure);
      const allOpened = updatedBoxes.every(box => box.isOpen);
      if (treasureFound || allOpened) {
        setGameEnded(true);
      }

      return updatedBoxes;
    });
  };

  const resetGame = () => initializeGame();

  const handleSignOut = () => {
    clearToken();
    localStorage.removeItem('treasure_user');
    setUser(null);
    setIsGuest(false);
    setBoxes([]);
  };

  const handleAuth = (authedUser: User) => {
    localStorage.setItem('treasure_user', JSON.stringify(authedUser));
    setUser(authedUser);
    setIsGuest(false);
  };

  // Save score when game ends and user is signed in.
  // score is final here — openBox guards against changes after gameEnded is true.
  useEffect(() => {
    if (!gameEnded || !user) return;
    const result: GameResult = score > 0 ? 'win' : score === 0 ? 'tie' : 'loss';
    api.saveScore(score, result).catch(() => {});
  }, [gameEnded, score, user]);

  if (!authChecked) return null;

  if (!user && !isGuest) {
    return <AuthScreen onAuth={handleAuth} onGuest={() => setIsGuest(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">
      {/* Header with user info */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {user ? (
          <>
            <span className="text-amber-800 text-sm">Hi, <strong>{user.username}</strong></span>
            <Button
              variant="outline"
              size="sm"
              className="border-amber-400 text-amber-700 hover:bg-amber-100"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <span className="text-xs bg-amber-200 text-amber-700 px-2 py-1 rounded-full">Guest</span>
            <Button
              variant="outline"
              size="sm"
              className="border-amber-400 text-amber-700 hover:bg-amber-100"
              onClick={handleSignOut}
            >
              Sign In
            </Button>
          </>
        )}
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl mb-4 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
        <p className="text-amber-800 mb-4">
          Click on the treasure chests to discover what's inside!
        </p>
        <p className="text-amber-700 text-sm">
          💰 Treasure: +$150 | 💀 Skeleton: -$50
        </p>
      </div>

      <div className="mb-8 flex items-center gap-4">
        <div className="text-2xl text-center p-4 bg-amber-200/80 backdrop-blur-sm rounded-lg shadow-lg border-2 border-amber-400">
          <span className="text-amber-900">Current Score: </span>
          <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${score}
          </span>
        </div>
        {gameEnded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className={`text-2xl font-bold px-5 py-3 rounded-lg border-2 ${
              score > 0
                ? 'bg-green-100 text-green-700 border-green-400'
                : score === 0
                ? 'bg-yellow-100 text-yellow-700 border-yellow-400'
                : 'bg-red-100 text-red-700 border-red-400'
            }`}
          >
            {score > 0 ? 'WIN' : score === 0 ? 'TIE' : 'LOSS'}
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {boxes.map((box) => (
          <motion.div
            key={box.id}
            className="flex flex-col items-center"
            style={{ cursor: box.isOpen ? 'default' : `url(${keyIcon}) 8 8, pointer` }}
            whileHover={{ scale: box.isOpen ? 1 : 1.05 }}
            whileTap={{ scale: box.isOpen ? 1 : 0.95 }}
            onClick={() => openBox(box.id)}
          >
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{
                rotateY: box.isOpen ? 180 : 0,
                scale: box.isOpen ? 1.1 : 1,
              }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="relative"
            >
              <img
                src={box.isOpen
                  ? (box.hasTreasure ? treasureChest : skeletonChest)
                  : closedChest}
                alt={box.isOpen
                  ? (box.hasTreasure ? 'Treasure!' : 'Skeleton!')
                  : 'Treasure Chest'}
                className="w-48 h-48 object-contain drop-shadow-lg"
              />
              {box.isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                >
                  {box.hasTreasure ? (
                    <div className="text-2xl animate-bounce">✨💰✨</div>
                  ) : (
                    <div className="text-2xl animate-pulse">💀👻💀</div>
                  )}
                </motion.div>
              )}
            </motion.div>

            <div className="mt-4 text-center">
              {box.isOpen ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className={`text-lg p-2 rounded-lg ${
                    box.hasTreasure
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {box.hasTreasure ? '+$150' : '-$50'}
                </motion.div>
              ) : (
                <div className="text-amber-700 p-2">Click to open!</div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {gameEnded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-4 p-6 bg-amber-200/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-amber-400">
            <h2 className="text-2xl mb-2 text-amber-900">Game Over!</h2>
            <p className="text-lg text-amber-800">
              Final Score:{' '}
              <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${score}
              </span>
            </p>
            <p className="text-sm text-amber-600 mt-2">
              {boxes.some(box => box.isOpen && box.hasTreasure)
                ? 'Treasure found! Well done, treasure hunter! 🎉'
                : 'No treasure found this time! Better luck next time! 💀'}
            </p>
            {user && (
              <p className="text-xs text-amber-500 mt-1">Score saved to your account.</p>
            )}
          </div>

          <Button
            onClick={resetGame}
            className="text-lg px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white"
          >
            Play Again
          </Button>
        </motion.div>
      )}
    </div>
  );
}
