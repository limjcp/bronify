"use client";
import { useEffect, useState, useRef } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";

interface Song {
  id: string;
  title: string;
  artist?: string;
  file_url: string;
  thumbnail_url?: string;
  play_count: number;
}

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [playLogSent, setPlayLogSent] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch songs initially
  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = () => {
    fetch("/api/songs")
      .then((res) => res.json())
      .then((data) => setSongs(data.songs))
      .catch((err) => console.error("Error fetching songs:", err));
  };

  // Record play count
  const recordPlay = async (songId: string) => {
    try {
      const response = await fetch("/api/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songId,
          duration: Math.floor(currentTime), // Send the current playback time
        }),
      });

      if (response.ok) {
        console.log("Play count updated successfully");
        // Refresh the song list to show updated play count
        fetchSongs();
      } else {
        console.error("Failed to update play count");
      }
    } catch (error) {
      console.error("Error recording play:", error);
    }
  };

  // Handle play event and set current song
  const handlePlay = (song: Song) => {
    // Reset the play log sent flag when selecting a new song
    if (currentSong?.id !== song.id) {
      setPlayLogSent(false);
    }

    setCurrentSong(song);

    // If clicking on the same song that was playing, just toggle play/pause
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
      if (isPlaying) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play();
      }
      return;
    }

    // Load and play the new song
    setIsPlaying(true);
  };

  // Handle when audio actually starts playing
  const handleAudioPlay = () => {
    setIsPlaying(true);

    // Only record the play once per song play session
    if (currentSong && !playLogSent) {
      recordPlay(currentSong.id);
      setPlayLogSent(true);
    }
  };

  // Format time in MM:SS format
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  // Handle audio element events
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;

      const timeUpdateHandler = () => {
        setCurrentTime(audio.currentTime);
      };

      const loadedMetadataHandler = () => {
        setDuration(audio.duration);
      };

      const endedHandler = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      // Add event listeners
      audio.addEventListener("timeupdate", timeUpdateHandler);
      audio.addEventListener("loadedmetadata", loadedMetadataHandler);
      audio.addEventListener("ended", endedHandler);

      // Set initial volume
      audio.volume = volume;

      // Clean up
      return () => {
        audio.removeEventListener("timeupdate", timeUpdateHandler);
        audio.removeEventListener("loadedmetadata", loadedMetadataHandler);
        audio.removeEventListener("ended", endedHandler);
      };
    }
  }, [currentSong]);

  // Effect to handle playing state
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  // Effect to handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  return (
    <div className="min-h-screen bg-[url('/lebron50k.webp')] bg-cover bg-center bg-fixed bg-black/60 bg-blend-overlay text-white p-4 md:p-8">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Bronify Leaderboard
        </h1>
        <p className="text-center text-gray-400 mt-2">
          By: Klawjo, Limbron, & Snoopx on YT
        </p>
      </header>

      {/* Current playing bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 z-10">
        <div className="max-w-7xl mx-auto">
          {currentSong ? (
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="h-12 w-12 bg-gray-800 rounded-md overflow-hidden flex-shrink-0">
                  {currentSong.thumbnail_url ? (
                    <img
                      src={currentSong.thumbnail_url}
                      alt={currentSong.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-purple-800 to-pink-800 flex items-center justify-center">
                      <span className="text-lg font-bold">
                        {currentSong.title.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-medium truncate">
                    {currentSong.title}
                  </h3>
                  <p className="text-xs text-gray-400 truncate">
                    {currentSong.artist || "Unknown Artist"}
                  </p>
                </div>
              </div>

              <div className="flex-grow flex flex-col w-full">
                <div className="flex items-center justify-center gap-4">
                  <button className="text-gray-400 hover:text-white">
                    <SkipBack size={20} />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="h-10 w-10 rounded-full bg-pink-600 flex items-center justify-center hover:bg-pink-700 transition"
                  >
                    {isPlaying ? (
                      <Pause size={20} />
                    ) : (
                      <Play size={20} className="ml-1" />
                    )}
                  </button>
                  <button className="text-gray-400 hover:text-white">
                    <SkipForward size={20} />
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full mt-2">
                  <span className="text-xs text-gray-400 w-10">
                    {formatTime(currentTime)}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 appearance-none bg-gray-700 rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-500"
                  />
                  <span className="text-xs text-gray-400 w-10">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={toggleMute}
                  className="text-gray-400 hover:text-white"
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 appearance-none bg-gray-700 rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-500"
                />
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              Select a song to play
            </div>
          )}
        </div>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={currentSong?.file_url}
        onPlay={handleAudioPlay}
        onPause={() => setIsPlaying(false)}
      />

      {/* Song list */}
      <div className="max-w-4xl mx-auto mb-24">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden shadow-xl">
          <div className="p-4 border-b border-gray-700 hidden md:grid grid-cols-12 text-sm font-medium text-gray-400">
            <div className="col-span-1">#</div>
            <div className="col-span-5">TITLE</div>
            <div className="col-span-4">ARTIST</div>
            <div className="col-span-2 text-right">PLAYS</div>
          </div>

          {songs.map((song, index) => (
            <div
              key={song.id}
              className={`p-3 md:grid grid-cols-12 items-center border-b border-gray-700/50 hover:bg-white/5 transition-colors flex flex-col md:flex-row gap-2 md:gap-0 ${
                currentSong?.id === song.id ? "bg-white/10" : ""
              }`}
              onClick={() => handlePlay(song)}
            >
              <div className="col-span-1 font-mono text-gray-400">
                {index + 1}
              </div>
              <div className="col-span-5 flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                  {song.thumbnail_url ? (
                    <img
                      src={song.thumbnail_url}
                      alt={song.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-purple-800 to-pink-800 flex items-center justify-center">
                      <span className="font-bold">{song.title.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium truncate">{song.title}</h3>
                </div>
              </div>
              <div className="col-span-4 text-gray-400 truncate">
                {song.artist || "Unknown Artist"}
              </div>
              <div className="col-span-2 text-right font-mono text-gray-400">
                {song.play_count.toLocaleString()}
              </div>
            </div>
          ))}

          {songs.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No songs available. Upload some tracks from the admin page!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
