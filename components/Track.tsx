import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import { createTheme, ThemeProvider, Tooltip } from '@mui/material';
import Image from 'next/image';
import { Dispatch, useEffect, useRef, useState } from 'react';
import styles from '../styles/components/Track.module.scss';

type Props = {
  currAudio?: HTMLAudioElement;
  setCurrAudio: Dispatch<HTMLAudioElement>;
  session: any;
  track: any;
};

export default function Track(props: Props) {
  const { currAudio, setCurrAudio, session, track } = props;
  const { name, id, artists, album, external_urls, preview_url } = track;

  const [saved, setSaved] = useState(false);
  const [playing, setPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  // stop playing on pause or end
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    function stopPlaying() {
      setPlaying(false);
    }
    audio.addEventListener('pause', stopPlaying);
    audio.addEventListener('ended', stopPlaying);
    return () => {
      audio.removeEventListener('pause', stopPlaying);
      audio.removeEventListener('ended', stopPlaying);
    }
  }, [audioRef])

  const theme = createTheme({
    typography: {
      fontFamily: "'Clash Grotesk', sans-serif"
    }
  });

  // toggles track play state
  function togglePlay() {
    if (playing) {
      setPlaying(false);
      audioRef.current?.pause();
    } else {
      if (currAudio) currAudio.pause();
      setPlaying(true);
      audioRef.current?.play();
      if (audioRef.current) setCurrAudio(audioRef.current);
    }
  }

  // saves given track to library
  async function saveTrack(id: string) {
    setSaved(true);
    const response = await fetch(`/api/savetrack?id=${encodeURIComponent(id)}`);
    // handle api error
    if (response.status !== 200) {
      window.alert(`Something went wrong saving track: ${response.status} ${response.statusText}`);
    }
  };

  if (!external_urls || !artists || !album) return null;

  const url = external_urls['spotify'];

  return (
    <div className={styles.container}>
      <a href={url} target="_blank" rel="noopener noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={album.images[0].url} alt="" />
        <div className={styles.details}>
          <h1>{name}</h1>
          <p>{artists.map((artist: any) => artist.name).join(', ')}</p>
          <p>{album.name}</p>
        </div>
        <span className={styles.flexfill} />
      </a>
      <audio
        ref={audioRef}
        src={preview_url} controls hidden
      />
      <button
        onClick={togglePlay}
        className={session ? styles.play : `${styles.play} ${styles.lonely}`}
      >
        {
          !playing ?
            <Image
              src="/icons/play.svg"
              width="96"
              height="96"
              alt="play.svg"
            /> :
            <Image
              src="/icons/pause.svg"
              width="96"
              height="96"
              alt="pause.svg"
            />
        }
      </button>
      <ThemeProvider theme={theme}>
        <div className={styles.save}>
          {
            session &&
            <>
              {
                !saved ?
                  <Tooltip title="Save to Spotify" arrow placement="top">
                    <button onClick={() => saveTrack(id)}>
                      <AddIcon fontSize="large" />
                    </button>
                  </Tooltip> :
                  <Tooltip title="Saved!" arrow placement="top">
                    <div>
                      <CheckIcon fontSize="large" />
                    </div>
                  </Tooltip>
              }
            </>
          }
        </div>
      </ThemeProvider>
    </div>
  );
}
