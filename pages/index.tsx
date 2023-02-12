import Track from '@/components/Track';
import styles from '@/styles/pages/Index.module.scss';
import { getPrompt, getReprompt } from '@/util/prompt';
import { LinearProgress } from '@mui/material';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Home() {
  const { data: session } = useSession();

  const db = getFirestore();

  const [email, setEmail] = useState('');
  const [popupOpen, setPopupOpen] = useState(false);
  const [text, setText] = useState('');
  const [textPlaceholder, setTextPlaceholder] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [tracks, setTracks] = useState<any[]>();
  const [loading, setLoading] = useState<boolean>(false);

  // set up text placeholder typing effect
  useEffect(() => {
    const states = ['songs by pink floyd', 'electronic music fun', 'jazz from the 80s', 'rap songs from 2018', 'r&b songs about summer'];
    let stateIndex = 0;
    let letterIndex = 0;
    let countdown = 0;
    const textInterval = setInterval(() => {
      if (letterIndex === states[stateIndex].length) {
        letterIndex = 0;
        stateIndex += 1;
        countdown = 16;
      }
      if (stateIndex === states.length) stateIndex = 0;
      if (countdown === 0) {
        setTextPlaceholder(states[stateIndex].slice(0, letterIndex + 1));
        letterIndex++;
      } else countdown--;
    }, 80);
    return () => clearInterval(textInterval);
  }, []);

  // handle popup on start
  useEffect(() => {
    const localEmail = localStorage.getItem('email');
    setPopupOpen(!localEmail);
  }, []);

  // gets data for given tracks
  async function getTracks(tracksData: string[]) {
    setLoading(false);
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
      // handle api error
      if (response.status !== 200) {
        window.alert(`Something went wrong searching tracks: ${response.status} ${response.statusText}`);
        return;
      }
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

  // collects an email and saves it to localstorage and firebase
  async function collectEmail() {
    localStorage.setItem('email', email);
    setPopupOpen(false);
    const emailsRef = collection(db, 'emails');
    await addDoc(emailsRef, { email, timestamp: new Date().getTime() });
  }

  // generates songs from chatgpt
  async function generateSongs(reprompting: boolean) {
    // update loading state
    if (loading) return;
    setLoading(true);

    // return if no text
    if (!text || !text.trim()) {
      window.alert('Please enter some text.');
      return;
    }

    // clear tracks
    setTracks(undefined);
    if (reprompting && !lastResponse) throw 'no last response';
    const prompt = reprompting ? getReprompt(lastResponse) : getPrompt();

    // make request to chatgpt
    const response = await fetch("/api/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, prompt })
    });

    // parse json data
    const data = await response.json();
    if (response.status !== 200) {
      setLoading(false);
      throw data.error || new Error(`Request failed with status ${response.status}`);
    }

    console.log(data.result);

    // parse raw result
    let raw = data.result.trim();
    const bracketIndex = raw.indexOf('[');
    if (bracketIndex === -1) {
      setLoading(false);
      window.alert(`Invalid result from ChatGPT:\n${raw ? raw : 'No response'}`);
      throw 'invalid result';
    }
    raw = raw.substring(bracketIndex);
    console.log(raw);
    setLastResponse(raw);

    // parse song array
    let songArray: string[];
    try {
      songArray = JSON.parse(raw);
    } catch (e) {
      setLoading(false);
      throw `Something went wrong parsing the result: ${e}`;
    }

    // get tracks from song data
    console.log(songArray);
    getTracks(songArray);
  }

  return (
    <div className={styles.container}>
      <Image
        className={styles.rings}
        src="/img/rings.svg"
        width={1691 * 0.7}
        height={1691 * 0.7}
        alt="logo.svg"
      />
      <div className={styles.logo}>
        <Image
          src="/img/logo.svg"
          width="24"
          height="24"
          alt="logo.svg"
        />
        <h1>Rhythmatic</h1>
      </div>
      {
        !session ?
          <button className={styles.signInButton} onClick={() => signIn('spotify')}>
            Sign in with
            <Image
              src="/img/spotify.png"
              width="36"
              height="36"
              alt="spotify.png"
            />
          </button> :
          <button className={styles.signOutButton} onClick={() => signOut()}>
            <Image
              src="/icons/signout.svg"
              width="24"
              height="24"
              alt="signout.svg"
            />
            Sign Out
          </button>
      }
      <div className={styles.content}>
        {
          popupOpen &&
          <div className={styles.popupContainer}>
            <div className={styles.popup}>
              <button onClick={() => setPopupOpen(false)}>
                &times;
              </button>
              <p>Enter your email for updates!</p>
              <form className={styles.popupForm} onSubmit={e => {
                e.preventDefault();
                collectEmail();
              }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="example@domain.com"
                  required
                />
                <button>Submit</button>
              </form>
            </div>
          </div>
        }
        <div className={loading ? styles.loading : `${styles.loading} ${styles.faded}`}>
          <p>Finding the groove...</p>
          <LinearProgress sx={{
            background: '#fff',
            height: '6px',
            borderRadius: '2px',
            '& .MuiLinearProgress-bar': {
              background: '#5024ff'
            }
          }} />
        </div>
        <div className={styles.form}>
          <div
            className={(loading || tracks) ? `${styles.formTitle} ${styles.faded}` : styles.formTitle}
          >
            <div>
              <div className={styles.titleLogo}>
                <Image
                  className={styles.tinyHidden}
                  src="/img/logo.svg"
                  width="42"
                  height="42"
                  alt="logo.svg"
                />
                <Image
                  className={styles.tinyShown}
                  src="/img/logo.svg"
                  width={51 * 0.65}
                  height={51 * 0.65}
                  alt="logo.svg"
                />
                <h1>Rhythmatic</h1>
              </div>
              <p className={styles.smallHidden}>combines the power</p>
            </div>
            <p>
              <span className={styles.smallShown}>combines the power </span>
              of Spotify and ChatGPT to supercharge your music recommendations. Try it out below!
            </p>
          </div>
          <form className={(loading || tracks) ? styles.raised : undefined} onSubmit={e => {
            e.preventDefault();
            const reprompting = (e.nativeEvent as any).submitter.name == "reprompt";
            console.log(`Reprompting? ${reprompting}`);
            setPopupOpen(false);
            generateSongs(reprompting);
          }}>
            <input
              type="text"
              placeholder={textPlaceholder}
              value={text}
              onChange={e => setText(e.target.value)}
              spellCheck="false"
              required
            />
            {
              tracks &&
              <button name="reprompt" style={{ right: '50px' }}>
                <Image
                  src="/icons/reprompt.svg"
                  width="36"
                  height="36"
                  alt="reprompt.svg"
                />
              </button>
            }
            <button name="bolt">
              <Image
                src="/icons/bolt.svg"
                width="36"
                height="36"
                alt="bolt.svg"
              />
            </button>
          </form>
        </div>
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
    </div>
  );
}
