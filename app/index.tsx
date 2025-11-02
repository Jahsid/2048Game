import Board from "@/components/Board";
import GameOverlay from "@/components/GameOverlay";
import Instructions from "@/components/Instructions";
import Title from "@/components/Title";
import { useAudio } from "@/hooks/useAudio";
import { useSwipe } from "@/hooks/useSwipe";
import {
  checkGameOver,
  checkWin,
  generateInitialGrid,
  moveGrid,
  type MoveDirection,
} from "@/logic/gameLogic";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// 🎵 Audio assets
import bgMusicFile from "../assets/audio/bg-music.mp3";
import gameOverSoundFile from "../assets/audio/gameover.mp3";
import moveSoundFile from "../assets/audio/move.mp3";
import winSoundFile from "../assets/audio/win.mp3";

export default function App() {
  const insets = useSafeAreaInsets();

  // 🎮 Game state
  const [grid, setGrid] = useState(generateInitialGrid());
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState<number[]>([]);
  const [win, setWin] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // 🎧 Sound hooks
  const bgMusic = useAudio(bgMusicFile, true);
  const moveSound = useAudio(moveSoundFile);
  const winSound = useAudio(winSoundFile);
  const gameOverSound = useAudio(gameOverSoundFile);

  // 🧠 Load saved scores
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("highScores");
      if (saved) setHighScores(JSON.parse(saved));
    })();
  }, []);

  // 💾 Save score after game end or win
  useEffect(() => {
    if (gameOver || win) {
      const updated = [...highScores, score].sort((a, b) => b - a).slice(0, 5);
      setHighScores(updated);
      AsyncStorage.setItem("highScores", JSON.stringify(updated));
    }
  }, [gameOver, win, score]);

  // 🕹️ Handle swipe/move
  const handleMove = useCallback(
    async (direction: MoveDirection) => {
      if (!gameStarted || win || gameOver) return;

      setGrid((prevGrid) => {
        const { newGrid, score: gained } = moveGrid(prevGrid, direction);

        // Play sound only if grid actually changed
        if (JSON.stringify(prevGrid) !== JSON.stringify(newGrid)) {
          moveSound.play();
        }

        const nextScore = score + gained;
        setScore(nextScore);

        if (checkWin(newGrid)) {
          setWin(true);
          winSound.play();
        } else if (checkGameOver(newGrid)) {
          setGameOver(true);
          gameOverSound.play();
        }

        return newGrid;
      });
    },
    [score, win, gameOver, gameStarted]
  );

  // 👆 Gesture listener
  const gesture = useSwipe(handleMove);

  // 🔁 Restart game
  const restartGame = async () => {
    setGrid(generateInitialGrid());
    setScore(0);
    setWin(false);
    setGameOver(false);
    setGameStarted(true);
    bgMusic.seekToStart();
    bgMusic.play();
  };

  // ⏹️ Go back to home/start
  const goToStartScreen = async () => {
    setGameStarted(false);
    setScore(0);
    setWin(false);
    setGameOver(false);
    bgMusic.pause();
    bgMusic.seekToStart();
  };

  // ---------- UI ----------

  if (!gameStarted) {
    return (
      <GestureDetector gesture={gesture}>
        <SafeAreaView style={[styles.container, { paddingTop: insets.top + 12 }]}>
          <Text style={styles.title}>🎮 2048 ⚡</Text>

          <TouchableOpacity style={styles.startButton} onPress={restartGame}>
            <Text style={styles.startText}>Start Game</Text>
          </TouchableOpacity>

          <Instructions />

          <Text style={styles.highTitle}>🏆 High Scores</Text>
          <FlatList
            data={highScores}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.scoreItem}>
                <Text style={styles.rank}>#{index + 1}</Text>
                <Text style={styles.score}>{item}</Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No scores yet. Play your first game!</Text>
            }
          />
        </SafeAreaView>
      </GestureDetector>
    );
  }

  if (gameOver) {
    return (
      <GestureDetector gesture={gesture}>
        <SafeAreaView style={[styles.container, { paddingTop: insets.top + 12 }]}>
          <Text style={[styles.title, { color: "red" }]}>Game Over 💀</Text>
          <Text style={styles.text}>Your Score: {score}</Text>

          <View style={styles.row}>
            <TouchableOpacity style={styles.button} onPress={restartGame}>
              <Text style={styles.btnText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#777" }]}
              onPress={goToStartScreen}
            >
              <Text style={styles.btnText}>Home</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.highTitle}>🏆 High Scores</Text>
          <FlatList
            data={highScores}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.scoreItem}>
                <Text style={styles.rank}>#{index + 1}</Text>
                <Text style={styles.score}>{item}</Text>
              </View>
            )}
          />
        </SafeAreaView>
      </GestureDetector>
    );
  }

  // 🧩 Main Game Screen
  return (
    <GestureDetector gesture={gesture}>
      <SafeAreaView style={[styles.container, { paddingTop: insets.top + 12 }]}>
        <Title score={score} onRestart={restartGame} />
        <Board grid={grid} />
        <GameOverlay win={win} gameOver={gameOver} onRestart={restartGame} />
        <Text style={styles.text}>Combine tiles to reach 2048!</Text>
      </SafeAreaView>
    </GestureDetector>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fce7f3",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#f59e0b",
  },
  startButton: {
    backgroundColor: "#d97706",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 20,
  },
  startText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  text: {
    color: "#374151",
    fontSize: 16,
    marginTop: 10,
  },
  highTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#6b21a8",
    marginTop: 30,
  },
  scoreItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#9333ea",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    width: 220,
  },
  rank: {
    color: "#fff",
    fontWeight: "bold",
  },
  score: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyText: {
    color: "#555",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#d97706",
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    marginVertical: 20,
  },
});

declare module "*.mp3";
declare module "*.wav";
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
