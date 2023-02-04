import Track from '@/components/Track';
import styles from '@/styles/pages/Index.module.scss';
import { LinearProgress } from '@mui/material';
import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Home() {
  const { data: session } = useSession();

  const [text, setText] = useState("");
  const [textPlaceholder, setTextPlaceholder] = useState('');
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

  // gets tracks from spotify with given url
  async function getTracks(url: string) {
    const response = await fetch(`/api/searchtrack?url=${encodeURIComponent(url)}`);
    // handle api error
    if (response.status !== 200) {
      window.alert(`Something went wrong searching tracks: ${response.status} ${response.statusText}`);
      setLoading(false);
      return;
    }
    const data = await response.json();
    const items = data?.tracks?.items;
    console.log(items);
    if (!items?.length) {
      window.alert('Spotify found no tracks. Please try a different prompt.');
      setLoading(false);
      return;
    }
    setTracks(items);
    setLoading(false);
  }

  // generates songs from chatgpt
  async function generateSongs() {
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

    // make request to chatgpt
    const response = await fetch("/api/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text })
    });

    // parse json data
    const data = await response.json();
    if (response.status !== 200) {
      setLoading(false);
      throw data.error || new Error(`Request failed with status ${response.status}`);
    }

    // check result
    const result = data.result.trim();
    console.log(result);
    if (!result) {
      setLoading(false);
      window.alert('ChatGPT returned no result. Please try a different prompt.');
    }

    // search tracks with result url
    const url = `https://api.spotify.com/v1/search?q=${result}&type=track&limit=10`;
    console.log(url);
    getTracks(url);
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
          width="184"
          height="24"
          alt="logo.svg"
        />
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
              <Image
                className={styles.tinyHidden}
                src="/img/logo.svg"
                width="374"
                height="51"
                alt="logo.svg"
              />
              <Image
                className={styles.tinyShown}
                src="/img/logo.svg"
                width={374 * 0.8}
                height={51 * 0.8}
                alt="logo.svg"
              />
              <p className={styles.smallHidden}>combines the power</p>
            </div>
            <p>
              <span className={styles.smallShown}>combines the power </span>
              of Spotify and ChatGPT to supercharge your music recommendations. Try it out below!
            </p>
          </div>
          <form className={(loading || tracks) ? styles.raised : undefined} onSubmit={e => {
            e.preventDefault();
            generateSongs();
          }}>
            <input
              type="text"
              placeholder={textPlaceholder}
              value={text}
              onChange={e => setText(e.target.value)}
              spellCheck="false"
              required
            />
            <button>
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
      <p className={styles.copyright}>
        &copy; {new Date().getFullYear()} Prodigy Development
      </p>
    </div>
  );
}
