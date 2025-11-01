import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  checkGameOver,
  checkWin,
  generateInitialGrid,
  moveGrid,
} from "./logic/gameLogic";

import Board from "./components/Board";
import GameOverlay from "./components/GameOverlay";
import Instructions from "./components/Instructions";
import Title from "./components/Title";
import { useSwipe } from "./hooks/useSwipe";

// 🎵 Import sound files (place them in assets/audio)
const bgMusicFile = require("./assets/audio/bg-music.mp3");
const moveSoundFile = require("./assets/audio/move.mp3");
const winSoundFile = require("./assets/audio/win.mp3");
const gameOverSoundFile = require("./assets/audio/gameover.mp3");

export default function App() {
  const [grid, setGrid] = useState(generateInitialGrid());
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState<number[]>([]);
  const [win, setWin] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // 🎧 Sound refs
  const bgMusicRef = useRef<Audio.Sound | null>(null);
  const moveSoundRef = useRef<Audio.Sound | null>(null);
  const winSoundRef = useRef<Audio.Sound | null>(null);
  const gameOverSoundRef = useRef<Audio.Sound | null>(null);

  // 🧠 Load sounds and scores
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("highScores");
      if (saved) setHighScores(JSON.parse(saved));

      // Load all sounds
      bgMusicRef.current = new Audio.Sound();
      await bgMusicRef.current.loadAsync(bgMusicFile);
      bgMusicRef.current.setIsLoopingAsync(true);

      moveSoundRef.current = new Audio.Sound();
      await moveSoundRef.current.loadAsync(moveSoundFile);

      winSoundRef.current = new Audio.Sound();
      await winSoundRef.current.loadAsync(winSoundFile);

      gameOverSoundRef.current = new Audio.Sound();
      await gameOverSoundRef.current.loadAsync(gameOverSoundFile);
    })();

    return () => {
      // cleanup
      Object.values({
        bg: bgMusicRef,
        move: moveSoundRef,
        win: winSoundRef,
        over: gameOverSoundRef,
      }).forEach(async (ref) => {
        if (ref.current) await ref.current.unloadAsync();
      });
    };
  }, []);

  useEffect(() => {
    if (gameOver || win) {
      const updated = [...highScores, score].sort((a, b) => b - a).slice(0, 5);
      setHighScores(updated);
      AsyncStorage.setItem("highScores", JSON.stringify(updated));
    }
  }, [gameOver, win]);

  const handleMove = useCallback(
    async (direction: string) => {
      if (!gameStarted || win || gameOver) return;

      setGrid((prevGrid) => {
        const { newGrid, score: gained } = moveGrid(prevGrid, direction);

        if (JSON.stringify(prevGrid) !== JSON.stringify(newGrid)) {
          moveSoundRef.current?.replayAsync().catch(() => {});
        }

        const nextScore = score + gained;
        setScore(nextScore);

        if (checkWin(newGrid)) {
          setWin(true);
          winSoundRef.current?.replayAsync().catch(() => {});
        } else if (checkGameOver(newGrid)) {
          setGameOver(true);
          gameOverSoundRef.current?.replayAsync().catch(() => {});
        }

        return newGrid;
      });
    },
    [score, win, gameOver, gameStarted]
  );

  // 👆 Replace keyboard with swipe (hook listens to gestures)
  useSwipe(handleMove);

  const restartGame = async () => {
    setGrid(generateInitialGrid());
    setScore(0);
    setWin(false);
    setGameOver(false);
    setGameStarted(true);
    await bgMusicRef.current?.replayAsync().catch(() => {});
  };

  const goToStartScreen = async () => {
    setGameStarted(false);
    setScore(0);
    setWin(false);
    setGameOver(false);
    await bgMusicRef.current?.stopAsync().catch(() => {});
  };

  // ---------- UI ----------
  if (!gameStarted) {
    return (
      <SafeAreaView style={styles.container}>
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
    );
  }

  if (gameOver) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={[styles.title, { color: "red" }]}>Game Over 💀</Text>
        <Text style={styles.text}>Your Score: {score}</Text>

        <View style={styles.row}>
          <TouchableOpacity style={styles.button} onPress={restartGame}>
            <Text style={styles.btnText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: "#777" }]} onPress={goToStartScreen}>
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
    );
  }

  // Game screen
  return (
    <SafeAreaView style={styles.container}>
      <Title score={score} onRestart={restartGame} />
      <Board grid={grid} />
      <GameOverlay win={win} gameOver={gameOver} onRestart={restartGame} />
      <Text style={styles.text}>Combine tiles to reach 2048!</Text>
    </SafeAreaView>
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
