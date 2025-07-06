import React, { useState, useRef, useEffect } from 'react';


interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  isVisitorMode?: boolean;
  playlistLength?: number;
  currentIndex?: number;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  audioUrl, 
  title, 
  onNext, 
  onPrevious,
  isVisitorMode,
  playlistLength,
  currentIndex
}) => {
  // Set default values for optional props
  const _title = title ?? 'Audio Track';
  const _isVisitorMode = isVisitorMode ?? false;
  const _playlistLength = playlistLength ?? 0;
  const _currentIndex = currentIndex ?? 0;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Memoize event handlers to avoid stale closures and unnecessary re-registrations
  const handleLoadedMetadata = React.useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  }, []);

  const handleTimeUpdate = React.useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleEnded = React.useCallback(() => {
    if (!isLooping) {
      setIsPlaying(false);
      if (onNext) {
        onNext();
      }
    }
    // If looping, the audio will continue automatically
  }, [isLooping, onNext]);

  const handleError = React.useCallback((e: any) => {
    console.error('Audio error:', e);
    setIsLoading(false);
    window.alert('Playback Error: Unable to play this audio file. Please check the file format and try again.');
  }, []);

  const handleCanPlay = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  // Animation values for visual effects (not used in web version)
  // (Removed unused animation code for web compatibility)

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const audio = audioRef.current;
    if (!audio) return;

    setIsLoading(true);

    audio.crossOrigin = 'anonymous';
    audio.preload = 'metadata';
    audio.loop = isLooping;
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    audio.pause();
    audio.currentTime = 0;

    // Only call load if src is set
    if (audio.src) {
      audio.load();
    }

    return () => {
      if (audio) {
        audio.pause();
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('canplay', handleCanPlay);
      }
    };
  // Only reset player state when audioUrl changes, not when isLooping changes
  }, [audioUrl, handleLoadedMetadata, handleTimeUpdate, handleEnded, handleError, handleCanPlay]);

  // Separate effect to update the loop property when isLooping changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  const togglePlayPause = React.useCallback(async () => {
    if (!audioRef.current) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        await audioRef.current.play();
        setIsPlaying(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Play error:', error);
      setIsLoading(false);
      window.alert('Playback Error: Unable to play audio. Please try again.');
    }
  }, [isPlaying, setIsLoading, isLooping]);

  const toggleLoop = () => {
    setIsLooping(prev => {
      if (audioRef.current) {
        audioRef.current.loop = !prev;
      }
      return !prev;
    });
  };

  const resetPlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
      setIsLooping(false);
      // Ensure the audio element's loop property is updated immediately
      audioRef.current.loop = false;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage for progress bar
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Add a hidden audio element to the DOM for playback control
  // This is required for React to manage the audio element lifecycle properly
  // and to avoid creating new Audio objects outside the DOM tree.
  const audioElement = (
    <audio
      key={audioUrl}
      ref={audioRef}
      src={audioUrl}
      style={{ display: 'none' }}
    />
  );

  if (_isVisitorMode) {
    return (
      <>
        {audioElement}
        <div className="visitor-container" style={{ padding: 24, background: '#222', borderRadius: 12, color: 'white', maxWidth: 400, margin: '0 auto' }}>
          <div className="visitor-title" style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>{_title}</div>
          <div className="track-info" style={{ fontSize: 13, marginBottom: 12 }}>
            Track {_currentIndex + 1} of {_playlistLength}
          </div>
          <div className="compact-controls" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: 12 }}>
            {onPrevious && (
              <button onClick={onPrevious} style={{ background: 'none', border: 'none', color: 'white', fontSize: 16, cursor: 'pointer' }}>&lt;&lt;</button>
            )}
            <button 
              onClick={togglePlayPause} 
              style={{ background: '#ff4757', border: 'none', borderRadius: '50%', width: 36, height: 36, color: 'white', fontSize: 20, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1 }}
              disabled={isLoading}
            >
              {isLoading ? '...' : (isPlaying ? '❚❚' : '►')}
            </button>
            {onNext && (
              <button onClick={onNext} style={{ background: 'none', border: 'none', color: 'white', fontSize: 16, cursor: 'pointer' }}>&gt;&gt;</button>
            )}
            <button 
              onClick={toggleLoop} 
              style={{ background: isLooping ? '#ff4757' : 'none', border: 'none', color: isLooping ? 'white' : '#aaa', fontSize: 16, cursor: 'pointer', borderRadius: 4, padding: '0 6px' }}
            >
              &#128257;
            </button>
            <button onClick={resetPlayer} style={{ background: 'none', border: 'none', color: 'white', fontSize: 16, cursor: 'pointer' }}>■</button>
          </div>
          <div className="compact-progress-container" style={{ marginBottom: 0 }}>
            <div className="compact-progress-bar" style={{ background: '#444', borderRadius: 4, height: 6, width: '100%', marginBottom: 4, overflow: 'hidden' }}>
              <div className="progress-fill" style={{ background: '#ff4757', height: '100%', width: `${progress}%`, transition: 'width 0.2s' }} />
            </div>
            <div className="time-container" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {audioElement}
      <div className="audio-player-container" style={{ padding: 24, background: '#222', borderRadius: 12, color: 'white', maxWidth: 500, margin: '0 auto' }}>
        <div className="title" style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 4 }}>{title}</div>
        <div className="url" style={{ fontSize: 12, color: '#aaa', marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{audioUrl}</div>
        <div className="controls" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 16 }}>
          {onPrevious && (
            <button onClick={onPrevious} style={{ background: 'none', border: 'none', color: 'white', fontSize: 18, cursor: 'pointer' }}>&lt;&lt;</button>
          )}
          <button 
            onClick={togglePlayPause} 
            style={{ background: '#ff4757', border: 'none', borderRadius: '50%', width: 40, height: 40, color: 'white', fontSize: 22, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1 }}
            disabled={isLoading}
          >
            {isLoading ? '...' : (isPlaying ? '❚❚' : '►')}
          </button>
          {onNext && (
            <button onClick={onNext} style={{ background: 'none', border: 'none', color: 'white', fontSize: 18, cursor: 'pointer' }}>&gt;&gt;</button>
          )}
          <button 
            onClick={toggleLoop} 
            style={{ background: isLooping ? '#ff4757' : 'transparent', border: 'none', color: isLooping ? 'white' : '#aaa', fontSize: 18, cursor: 'pointer', borderRadius: 4, padding: '0 8px' }}
          >
            &#128257;
          </button>
          <button onClick={resetPlayer} style={{ background: 'none', border: 'none', color: 'white', fontSize: 18, cursor: 'pointer' }}>■</button>
        </div>
        <div className="progress-container" style={{ marginBottom: 0 }}>
          <div className="progress-bar" style={{ background: '#444', borderRadius: 4, height: 8, width: '100%', marginBottom: 4, overflow: 'hidden' }}>
            <div className="progress-fill" style={{ background: '#ff4757', height: '100%', width: `${progress}%`, transition: 'width 0.2s' }} />
          </div>
          <div className="time-container" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default AudioPlayer;
