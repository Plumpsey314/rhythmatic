import Track from '@/components/Track';
import styles from '@/styles/pages/Index.module.scss';
import { getPrompt, getReprompt } from '@/util/prompt';
import { LinearProgress, Tooltip } from '@mui/material';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

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
  const promptStates = [
    'I am going on a long car ride through the mountains and want music that will keep me from falling asleep',
    'I want to feel empowered, play me some empowering pop songs',
    'I\'m having a party and want songs that will keep everyone dancing',
    'I\'m in the mood for throwback hits from the 90s and 2000s',
    'I am playing chess and I want music that won\'t distract me but will keep me happy.'
  ];
  const repromptStates = [
    'Only popular rap music though',
    'Make them sad but still empowering',
    'Only happy music',
    'Can you make them sad but still empowering',
    'Can you only find rap or pop music from after 2020',
    'Only electronic music though',
    'Can you make it very chill pop music?'
  ];

  const blueLoading = useRef<HTMLDivElement>(null);
  const blackBackground = useRef<HTMLDivElement>(null)
  const trackElement = useRef<HTMLDivElement>(null);

  // set up text placeholder typing effect
  useEffect(() => {
    let stateIndex = 0;
    let letterIndex = 0;
    let countdown = 0;
    let startingIndex = 0;
    let states = promptStates;
    const textInterval = setInterval(() => {
      if(states==promptStates && document.getElementsByClassName(styles.formTitle)[0].classList.contains(styles.faded)){
        states = repromptStates;
        stateIndex = 0;
        letterIndex = 0;
        countdown = 0;
        startingIndex = 0;
      }
      if (letterIndex === states[stateIndex].length) {
        letterIndex = 0;
        stateIndex ++;
        countdown = 16;
        startingIndex = 0;
      }
      if (stateIndex === states.length) { stateIndex = 0 };
      if (countdown === 0) {
        if(letterIndex > 36){
          countdown = 1;
        }
        const minIndex = Math.max(0, letterIndex - 36);
        setTextPlaceholder(states[stateIndex].slice(minIndex, letterIndex + 1));
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

    // parse raw result
    let raw = data.result.trim();
    const bracketIndex = raw.indexOf('[');
    if (bracketIndex === -1) {
      setLoading(false);
      window.alert(`Invalid result from ChatGPT:\n${raw ? raw : 'No response'}`);
      throw 'invalid result';
    }
    raw = raw.substring(bracketIndex);
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
    getTracks(songArray);
  }

  async function loadBox(){
    if(blueLoading.current){
      let top = 0;
      let left = 0;
      blueLoading.current.style.left = '0px';
      blueLoading.current.style.top = '0px'
      blueLoading.current.style.height = document.body.offsetHeight/2 + 'px';
      blueLoading.current.style.width = '10px';
      blueLoading.current.style.border='none';
      const blueLoadInterval = setInterval(() => {
        if(blueLoading.current){
          const boxHeightStr =  blueLoading.current.style.height;
          let boxHeight = +(boxHeightStr.substring(0,boxHeightStr.length-2));
          const boxWidthStr =  blueLoading.current.style.width;
          let boxWidth = +(boxWidthStr.substring(0,boxWidthStr.length-2));
          const height = document.body.offsetHeight;
          const width = document.body.offsetWidth;
          if(left==0){
            if(top<=0){
              blueLoading.current.style.borderLeft='5px solid #00f';
              if(boxWidth-width/100 > 10){
                boxHeight += height/100;
                boxWidth -= width/100;
              }else{
                top = 0.01;
                blueLoading.current.style.borderTop='none';
              }
            }else{
              if(top+0.01 >= 1-boxHeight/height){
                blueLoading.current.style.borderBottom='5px solid #00f';
                if(boxHeight-height/100 > 10){
                  boxHeight -= height/100;
                  boxWidth += width/100;
                  top=1-boxHeight/height;
                }else{
                  blueLoading.current.style.borderLeft='none';
                  left = 0.01;
                }
              }else{
                top += 0.01;
              }
            }
          }else{
            if(top <= 0.001){
              top=0;
              blueLoading.current.style.borderTop = '5px solid #00f';
              if(boxHeight-height/100 > 10){
                boxHeight -= height/100;
                boxWidth += width/100;
                left=1-boxWidth/width;
              }else{
                blueLoading.current.style.borderRight='none';
                left -= 0.01;
                if(left <= 0){
                  left = 0;
                }
              }
            }else{
              if(left+0.01 >= 1-boxWidth/width){
                blueLoading.current.style.borderRight = '5px solid #00f';
                if(boxWidth-width/100 > 10){
                  boxHeight += height/100;
                  boxWidth -= width/100;
                  top=1-boxHeight/height;
                  left=1-boxWidth/width;
                }else{
                  blueLoading.current.style.borderBottom='none';
                  top -= 0.01;
                }
              }else{
                left += 0.01;
              }
            }
          }
          blueLoading.current.style.height = (boxHeight) + 'px';
          blueLoading.current.style.width = (boxWidth) + 'px';
          blueLoading.current.style.left = (left*width) + 'px';
          blueLoading.current.style.top = (top*height) + 'px';
          if(blueLoading.current.classList.contains(styles.faded)){
            blueLoading.current.style.left = '0px';
            blueLoading.current.style.top = '0px'
            blueLoading.current.style.height = document.body.offsetHeight/2 + 'px';
            blueLoading.current.style.width = '10px';
            blueLoading.current.style.border='none';
            finishLoad();
            clearInterval(blueLoadInterval);
          }
        }else{
          throw new Error('loading element has been been modified or destroyed');
        }
      }, 5);
    } 
  }

  async function finishLoad(){
    if(blueLoading.current && blackBackground.current){
      blackBackground.current.classList.remove(styles.faded);
      blueLoading.current.classList.remove(styles.faded);
      blueLoading.current.style.height = '100%';
      blueLoading.current.style.width = '100%';
      blueLoading.current.style.border = '5px solid #00f'
      setTimeout(() => {
        if(blueLoading.current && blackBackground.current){
          blackBackground.current.classList.add(styles.faded);
          blueLoading.current.classList.add(styles.faded);
        }
      }, 1000)

    }else{
      throw new Error('loading elements have been been modified or destroyed');
    }
  }

  return (
    <div className={styles.container}>
      <div ref={blackBackground} className={loading?styles.blackBackground:`${styles.blackBackground} ${styles.faded}`}>
        <div ref={blueLoading} className={loading?styles.blueOutline:`${styles.blueOutline} ${styles.faded}`}> </div>
      </div>
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
            setPopupOpen(false);
            generateSongs(false);
            loadBox();
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
              <Tooltip title="Refine songs" arrow>
                <button
                  type="button"
                  style={{ right: '50px' }}
                  onClick={() => {
                    generateSongs(true)
                    loadBox();
                  }}
                >
                  <Image
                    src="/icons/reprompt.svg"
                    width="36"
                    height="36"
                    alt="reprompt.svg"
                  />
                </button>
              </Tooltip>
            }
            <Tooltip title="Generate songs" arrow>
              <button name="bolt">
                <Image
                  src="/icons/bolt.svg"
                  width="36"
                  height="36"
                  alt="bolt.svg"
                />
              </button>
            </Tooltip>
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
