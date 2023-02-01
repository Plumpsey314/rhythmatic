import Header from '@/components/Header';
import Track from '@/components/Track';
import styles from '@/styles/pages/Index.module.scss';
import { createTheme, LinearProgress, TextField, ThemeProvider } from '@mui/material';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';

export default function Home() {
  const { data: session } = useSession();

  const [text, setText] = useState("");
  const [tracks, setTracks] = useState<any[]>();
  const [loading, setLoading] = useState<string | null>(null);

  const theme = createTheme({
    typography: {
      fontFamily: 'Outfit, sans-serif'
    }
  });

  // gets data for given tracks
  async function getTracks(data: string[]) {
    setLoading('Retrieving Spotify data for songs...');
    const tracksData = [];
    for (const piece of data) {
      const [song, artist] = piece.split('\n');
      const response = await fetch(`/api/searchtrack?song=${encodeURIComponent(song)}&artist=${encodeURIComponent(artist)}}`)
      const json = await response.json();
      if (!json?.tracks?.items[0]) continue;
      tracksData.push(json.tracks.items[0]);
    }
    console.log(tracksData);
    setTracks(tracksData as any);
    setLoading(null);
  }

  // generates songs from chatgpt
  async function generateSongs() {
    // check spotify login
    if (!session) {
      window.alert('Please log in with Spotify first.');
      return;
    }

    // update loading state
    if (loading) return;
    setLoading('Sending your preferences to ChatGPT...')

    // return if no text
    if (!text || !text.trim()) return;

    // make request to chatgpt
    const response = await fetch("/api/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text })
    });

    // clear text
    setText('');

    // parse json data
    const data = await response.json();
    if (response.status !== 200) {
      setLoading(null);
      throw data.error || new Error(`Request failed with status ${response.status}`);
    }

    console.log(data.result);

    // parse raw result
    let raw = data.result;
    const bracketIndex = raw.indexOf('[');
    if (bracketIndex === -1) {
      setLoading(null);
      throw 'invalid result';
    }
    raw = raw.substring(bracketIndex);
    console.log(raw);

    // parse song array
    let songArray: string[];
    try {
      songArray = JSON.parse(raw);
    } catch (e) {
      setLoading(null);
      throw `Something went wrong parsing the result: ${e}`
    }

    // get tracks from song data
    console.log(songArray);
    getTracks(songArray);
  }

  return (
    <div className={styles.container}>
      <Header session={session} />
      <div className={styles.content}>
        {
          loading &&
          <div className={styles.loading}>
            <p>{loading}</p>
            <LinearProgress />
          </div>
        }
        {
          tracks &&
          <div className={styles.reset}>
            <button onClick={() => {
              setTracks(undefined);
            }}>
              Want to try again? Reset
            </button>
          </div>
        }
        {
          (!loading && !tracks) &&
          <div className={styles.form}>
            <h1>
              <Image
                className={styles.logo}
                src="/img/logo.png"
                width="48"
                height="48"
                alt="logo.png"
              />
              Finetune
            </h1>
            <p>Finetune&trade; combines Spotify and ChatGPT to give you the very best music recommendations! Try it below:</p>
            <form onSubmit={e => {
              e.preventDefault();
              generateSongs();
            }}>
              <ThemeProvider theme={theme}>
                <TextField
                  type="text"
                  placeholder="Describe your ideal music..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                  multiline
                  sx={{ width: '400px' }}
                  required
                />
              </ThemeProvider>
              <button>Find music for me!</button>
            </form>
          </div>
        }
        {
          (!loading && tracks) &&
          <div className={styles.tracks}>
            {
              tracks.map((track, i) =>
                <Track session={session} {...track} key={i} />
              )
            }
          </div>
        }
      </div>
      <p className={styles.copyright}>
        &copy; {new Date().getFullYear()} Prodigy Development
      </p>
    </div>
  );
}
