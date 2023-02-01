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
