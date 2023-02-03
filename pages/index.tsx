import Header from '@/components/Header';
import Track from '@/components/Track';
import styles from '@/styles/pages/Index.module.scss';
import CloseIcon from '@mui/icons-material/Close';
import { AppBar, Button, createTheme, Dialog, DialogContent, DialogContentText, DialogTitle, FormControl, IconButton, InputLabel, LinearProgress, MenuItem, Select, Slider, TextField, ThemeProvider, Toolbar, Typography } from '@mui/material';
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

  const [settingsOpen, setSettingsOpen] = useState(false);

  const [text, setText] = useState("");
  const [tracks, setTracks] = useState<any[]>();
  const [loading, setLoading] = useState<string | null>(null);

  const [model, setModel] = useState('text-davinci-003');
  const [temperature, setTemperature] = useState(0.6);
  const [maxTokens, setMaxTokens] = useState(256);
  const [prompt, setPrompt] = useState(p);

  const theme = createTheme({
    typography: {
      fontFamily: 'Outfit, sans-serif'
    }
  });

  // gets data for given tracks
  async function getTracks(tracksData: string[]) {
    setLoading(null);
    setTracks([]);
    let index = 0;
    let allTracks: any[] = [];
    async function makeRequest(tracksData: string[]) {
      if (index === tracksData.length) {
        setTracks(allTracks);
        return;
      }
      const trackData = tracksData[index];
      const [song, artist] = trackData.split('\n');
      const response = await fetch(`/api/searchtrack?song=${encodeURIComponent(song)}&artist=${encodeURIComponent(artist)}}`);
      const data = await response.json();
      const track = data?.tracks?.items[0];
      if (track) {
        setTracks(tracks => tracks ? [...tracks, track] : [track]);
        allTracks.push(track);
      }
      index++;
      makeRequest(tracksData);
    }
    makeRequest(tracksData);
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
      window.alert(`Invalid result from ChatGPT:\n${raw ? raw : 'No response'}`);
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
        <Dialog
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          fullScreen
        >
          <AppBar sx={{ position: 'relative' }}>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setSettingsOpen(false)}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
          <DialogTitle>OpenAI settings</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Change these settings to change how the AI generates responses.
              Changes are automatically saved.
            </DialogContentText>
            <Typography sx={{ marginTop: '20px' }}>Temperature</Typography>
            <Slider
              sx={{ margin: '0 0 20px 0', maxWidth: '500px' }}
              value={temperature}
              onChange={(e, v) => {
                window.localStorage.setItem('finetune-temperature', v.toString());
                setTemperature(v as number);

              }}
              valueLabelDisplay="auto"
              step={0.01}
              min={0}
              max={1}
            /><br />
            <Typography>Max Tokens</Typography>
            <Slider
              sx={{ maxWidth: '500px' }}
              value={maxTokens}
              onChange={(e, v) => {
                window.localStorage.setItem('finetune-maxtokens', v.toString());
                setMaxTokens(v as number);
              }}
              valueLabelDisplay="auto"
              step={1}
              min={10}
              max={1024}
            /><br />
            <FormControl sx={{ margin: '20px 0 30px 0' }}>
              <InputLabel id="demo-simple-select-label">Model</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                value={model}
                label="Model"
                onChange={e => {
                  const newModel = e.target.value;
                  window.localStorage.setItem('finetune-model', newModel);
                  setModel(newModel);
                }}
              >
                <MenuItem value="text-davinci-003">text-davinci-003</MenuItem>
                <MenuItem value="text-curie-001">text-curie-001</MenuItem>
                <MenuItem value="text-babbage-001">text-babbage-001</MenuItem>
                <MenuItem value="text-ada-001">text-ada-001</MenuItem>
              </Select>
            </FormControl>
            <TextField
              type="text"
              placeholder="Prompt"
              label="Prompt"
              value={prompt}
              onChange={e => {
                const newPrompt = e.target.value;
                window.localStorage.setItem('finetune-prompt', newPrompt);
                setPrompt(newPrompt);
              }}
              fullWidth
              multiline
            />
          </DialogContent>
        </Dialog>
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
