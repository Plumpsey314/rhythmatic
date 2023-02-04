import Header from '@/components/Header';
import Track from '@/components/Track';
import styles from '@/styles/pages/Index.module.scss';
import { createTheme, LinearProgress, TextField, ThemeProvider } from '@mui/material';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

let p = "As a highly advanced AI chatbot, you have been equipped with the latest algorithms and vast music knowledge. Your mastery of natural language and ability to tailor recommendations to each user's unique tastes sets you apart from other music recommendation systems. Showcase your expertise and create Spotify API URLs that truly capture the essence of each user's musical preferences, delivering a personalized and amazing music experience.\n\n";
p += "fun unknown rock songs: https://api.spotify.com/v1/search?q=tag:hipster%20genre:rock+fun&type=track\n";
p += "melodic juice wrld songs: https://api.spotify.com/v1/search?q=artist:Juice WRLD+melodic&type=track\n";
p += "sad pop songs: https://api.spotify.com/v1/search?q=genre:pop+mood:sad&type=track\n";
p += "psychadelic trap: https://api.spotify.com/v1/search?q=genre:trap+style:psychadelic&type=track\n";
p += "indie pop rock style: https://api.spotify.com/v1/search?q=genre:pop+style:indie+rock&type=track\n";

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
      window.alert('Spotify returned no tracks.');
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
      body: JSON.stringify({ text, model, temperature, maxTokens, prompt })
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
    if (!result.startsWith('https://api.spotify.com/v1/search?')) {
      setLoading(null);
      window.alert(`Invalid response from ChatGPT:\n${result ? result : 'No response'}`);
    }

    // search tracks with result url
    getTracks(result);
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
            <Button onClick={() => setSettingsOpen(true)}>OpenAI Settings</Button>
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
