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

  // gets tracks from spotify with given url
  async function getTracks(url: string) {
    const response = await fetch(`/api/searchtrack?url=${encodeURIComponent(url)}`);
    // handle api error
    if (response.status !== 200) {
      window.alert(`Something went wrong searching tracks: ${response.status} ${response.statusText}`);
      setLoading(null);
      return;
    }
    const data = await response.json();
    const items = data?.tracks?.items;
    console.log(items);
    if (!items?.length) {
      window.alert('Spotify found no tracks. Please try a different prompt.');
      setLoading(null);
      return;
    }
    setTracks(items);
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
    if (!text || !text.trim()) {
      window.alert('Please enter some text.');
      return;
    }

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

    // check result
    const result = data.result.trim();
    console.log(result);
    if (!result) {
      setLoading(null);
      window.alert('ChatGPT returned no result. Please try a different prompt.');
    }

    // search tracks with result url
    const url = `https://api.spotify.com/v1/search?q=${result}&type=track&limit=10`;
    console.log(url);
    getTracks(url);
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
          tracks &&
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
