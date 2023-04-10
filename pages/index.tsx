import Track from '@/components/Track';
import styles from '@/styles/pages/Index.module.scss';
import { Tooltip } from '@mui/material';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const { data: session } = useSession();

  const db = getFirestore();

  const [email, setEmail] = useState('');
  const [popupOpen, setPopupOpen] = useState(false);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [textPlaceholder, setTextPlaceholder] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [tracks, setTracks] = useState<any[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const [haveBeen, setHaveBeen] = useState<boolean>(false);
  const [anyTracks, setAnyTracks] = useState<boolean>(tracks ? tracks.length > 0 ? true : false : false);
  // TODO: COOPER replace this with functional link
  const [signedIn, setSignedIn] = useState<boolean>(false);

  const blueLoading = useRef<HTMLDivElement>(null);
  const blackBackground = useRef<HTMLDivElement>(null);
  const textForm = useRef<HTMLInputElement>(null);
  const songTrack = useRef<HTMLDivElement>(null);
  const refinePopup = useRef<HTMLDivElement>(null);

  const [currAudio, setCurrAudio] = useState<HTMLAudioElement>();
  const [refineTooltip, setRefineTooltip] = useState(false);

  // set up text placeholder typing effect
  useEffect(() => {
    const promptStates = [
      'I am going on a long car ride through the mountains and want music that will keep me from falling asleep.',
      'I\'m having a party and want songs that will keep everyone dancing.',
      'I want to feel empowered, play me some empowering pop songs.',
      'Songs for running',
      'Rap songs for a hard workout',
      'I\'m in the mood for throwback hits from the 90s and 2000s',
      'I am playing chess and I want music that won\'t distract me but will keep me happy.'
    ];
    const repromptStates = [
      'Only popular rap music',
      'Make them sad but still empowering.',
      'Only happy music.',
      'Make them energizing.',
      'Can you only find rap or pop music from after 2017',
      'Only electronic music though.',
      'Can you make it very chill pop music?'
    ];
    let stateIndex = 0;
    let letterIndex = 0;
    let countdown = 0;
    let states = promptStates;
    let maxChars = 36
    if (textForm.current) {
      maxChars = (textForm.current.offsetWidth - 112) * 0.075;
    }
    if (!anyTracks) {
      maxChars += 2;
    }
    const textInterval = setInterval(() => {
      if (states == promptStates && anyTracks) {
        states = repromptStates;
        stateIndex = 0;
        letterIndex = 0;
        countdown = 0;
      }
      if (letterIndex === states[stateIndex].length) {
        letterIndex = 0;
        stateIndex++;
        countdown = 16;
      }
      if (stateIndex === states.length) stateIndex = 0;
      if (countdown === 0) {
        const minIndex = Math.max(0, letterIndex - maxChars);
        // if (minIndex > 0) {
        //   countdown = 1;
        // }
        setTextPlaceholder(
          (minIndex > 0 ? '...' : '') +
          states[stateIndex].slice(minIndex, letterIndex + 1)
        );
        letterIndex++;
      } else countdown--;
    }, 80);
    return () => clearInterval(textInterval);
  }, [anyTracks]);

  // handle popup on start
  useEffect(() => {
    setHaveBeen(localStorage.getItem('haveBeen') == 'true' ? true : false);
    if (!localStorage.getItem('haveBeen')) setRefineTooltip(true);
    const localEmail = localStorage.getItem('email');
    setPopupOpen(!localEmail);
  }, []);

  useEffect(() => {
    if (anyTracks) {
      if (!tracks) {
        setAnyTracks(false);
      }
    } else {
      if (tracks) {
        setAnyTracks(true);
      }
    }
  }, [tracks, anyTracks])

  //This just reloads the page right now. Leaving it here in case we want to do something else.
  async function handleErrorUI() {
    location.reload();
  }

  // A function that handles the errors/next steps after making a request to openAI
  // Note: This function does not directly make any request to OpenAI, but it just deals with how to hande the response.
  async function resHandling(res: any, canRecurse: boolean) {
    // parse json data
    if (res.status !== 200) {
      setLoading(false);
      if (res.status === 504) {
        throw 'OpenAI request timed out';
      }
      else {
        throw new Error(`Request failed with status ${res.status}`);
      }
    }
    const data = await res.json();

    // parse raw result
    let raw = data.result.trim();

    // keeping this commented out line for development ease
    // window.alert(raw);

    // parse song array
    let songArray: string[];

    const bracketIndex = raw.indexOf('[');
    if (bracketIndex === -1) {
      // Try to make it work if formated incorectly
      let keepGoing: boolean = true;
      let songNumber: number = 1;
      let tempRaw: string = raw;
      songArray = [];
      while (keepGoing && songNumber <= 10) {
        if (tempRaw.includes(songNumber + ".") || tempRaw.includes("1.")) {
          if (tempRaw.includes((songNumber + 1) + ".")) {
            songArray.push(tempRaw.substring(2, tempRaw.indexOf((songNumber + 1) + ".")).trim());
          } else {
            if (tempRaw.includes("1.")) {
              songArray.push(tempRaw.substring(2, tempRaw.indexOf("1.")).trim());
              songNumber = 1;
            } else {
              songArray.push(tempRaw.substring((songNumber == 10 ? 3 : 2)).trim());
              keepGoing = false;
            }
          }
          songNumber++;
          tempRaw = tempRaw.substring(tempRaw.indexOf((songNumber) + "."));
        } else {
          keepGoing = false;
        }
      }
      // What to do if it does not work
      if (songArray.length == 0) {
        setLoading(false);
        throw 'Invalid Result';
      }
    } else {
      raw = raw.substring(bracketIndex);
      try {
        songArray = JSON.parse(raw);
      } catch (e) {
        setLoading(false);
        throw `Something went wrong parsing the result: ${e}`;
      }
    }

    setLastResponse(raw);

    // get tracks from song data We are not fixing the prompt again. That will set up an infinite recursive loop
    getTracks(songArray, canRecurse);
  }

  // collects an email and saves it to localstorage and firebase
  async function collectEmail() {
    localStorage.setItem('email', email);
    setPopupOpen(false);
    const emailsRef = collection(db, 'emails');
    await addDoc(emailsRef, { email, timestamp: new Date().getTime() });
  }

  // gets data for given tracks
  async function getTracks(tracksData: string[], fixingPrompt: boolean) {
    setLoading(false);
    setTracks([]);
    let index: number = 0;
    let allTracks: any[] = [];
    let anything: boolean = false;
    async function makeRequest(tracksData: string[]) {
      if (index === tracksData.length) {
        setTracks(allTracks);
        return;
      }
      // Makes sure trackData does not have any " character
      let trackData = tracksData[index].split('"').join('');
      // songs should be split by \n but if chatGPT might occasionally split it by something else.
      let [song, artist] = trackData.split('\n');
      if (!artist) {
        [song, artist] = trackData.split('\\n');
        if (!artist) {
          [song, artist] = trackData.split(' by ');
          if (!artist) {
            [song, artist] = trackData.split(' - ');
          }
        }
      }
      if (artist) {
        const response = await fetch(`/api/searchtrack?song=${encodeURIComponent(song)}&artist=${encodeURIComponent(artist)}`);
        // handle api error
        if (response.status !== 200) {
          // Commenting this line out since it sometimes alerts user because of one song despite having other perfectly good songs
          // window.alert(`Something went wrong searching tracks: ${response.status} ${response.statusText}`);
          if(response.status == 401){
            throw '401: Unauthorised accesss'
          }
          return;
        }
        const data = await response.json();
        const track = data?.tracks?.items[0];
        if (track) {
          setTracks(tracks => tracks ? [...tracks, track] : [track]);
          allTracks.push(track);
          anything = true;
        }
      }
      index++;
      await makeRequest(tracksData);
    }
    await makeRequest(tracksData);

    if (!anything) {
      if (fixingPrompt) {
        setLoading(true);

        // loadBox();

        // make request to chatgpt
        const response = await fetch("/api/openai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ texts: ["[" + tracksData.toString() + "]"], mode: "fix prompt" })
        });

        // NEVER change this to true. It can create an infinite loop and charge us a bunch.
        resHandling(response, false);
      } else {
        window.alert('Invalid Result');
        handleErrorUI();
      }
    }
  }

  // generates songs from chatgpt
  async function generateSongs(reprompting: boolean) {
    // return if no text
    if (!text || !text.trim()) {
      window.alert('Please enter some text.');
      return;
    }

    // update loading state
    if (loading) return;
    setLoading(true);

    if (text.length > 300) {
      handleErrorUI();
      window.alert('Please enter less than 300 characters');
      return;
    }

    // clear tracks
    setTracks(undefined);
    if (reprompting && !lastResponse) throw 'no last response';

    // Loading box
    loadBox();

    // set new text as message history when reprompting, or the origional message when not reprompting
    const newText = reprompting ? [...messages, text] : [text];

    let totalLength = 0;
    newText.forEach(text => {
      totalLength += text.length;
    });

    setMessages(newText);

    // Reprompting length limit
    if (totalLength > 500) {
      handleErrorUI();
      window.alert('Too much reprompt text to handle. Please Start again.');
      return;
    }

    try {
      // make request to chatgpt
      const response = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ texts: newText, mode: "suggest" })
      });

      // handles the response and allows ChatGPT to reprompt itself once
      await resHandling(response, true);
    } catch (error: any) {
      if (error == "Invalid Result") {
        try { // to get GPT3 to return a response in the correct format
          setLoading(true);

          // If all else fails, try it with GPT3.
          const response = await fetch("/api/openai", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ texts: newText, mode: "gpt3" })
          });

          // This time, it can be true without breaking everything
          await resHandling(response, false);
        } catch (err: any) {
          handleErrorUI();
          window.alert(err);
          throw err;
        }
      } else {
        handleErrorUI();
        window.alert(error);
        throw error;
      }
    }
  }

  async function loadBox() {
    if (blueLoading.current) {
      blueLoading.current.focus();
      if (textForm.current) {
        textForm.current.blur();
        textForm.current.style.pointerEvents = 'none';
        textForm.current.style.paddingRight = '90px';
      }
      let top = 0;
      let left = 0;
      let boxShadowLeft = 3;
      let boxShadowTop = 0;
      blueLoading.current.style.left = '0px';
      blueLoading.current.style.top = '0px'
      blueLoading.current.style.height = document.body.offsetHeight / 2 + 'px';
      blueLoading.current.style.width = '10px';
      blueLoading.current.style.border = 'none';
      if (blackBackground.current) {
        blackBackground.current.style.opacity = '1';
      } else {
        handleErrorUI();
        throw new Error('black background element has been modified or destroyed');
      }
      const blueLoadInterval = setInterval(() => {
        if (blueLoading.current) {
          const boxHeightStr = blueLoading.current.style.height;
          let boxHeight = +(boxHeightStr.substring(0, boxHeightStr.length - 2));
          const boxWidthStr = blueLoading.current.style.width;
          let boxWidth = +(boxWidthStr.substring(0, boxWidthStr.length - 2));
          const height = document.body.offsetHeight;
          const width = document.body.offsetWidth;
          if (left == 0) {
            if (top <= 0) {
              boxShadowLeft = 3;
              boxShadowTop = 3;
              blueLoading.current.style.borderLeft = '5px solid #5024FF';
              if (boxWidth - width / 100 > 10) {
                boxHeight += height / 100;
                boxWidth -= width / 100;
              } else {
                top = 0.01;
                boxShadowLeft = 3;
                boxShadowTop = 0;
                blueLoading.current.style.borderTop = 'none';
              }
            } else {
              if (top + 0.01 >= 1 - boxHeight / height) {
                boxShadowLeft = 3;
                boxShadowTop = -3;
                blueLoading.current.style.borderBottom = '5px solid #5024FF';
                if (boxHeight - height / 100 > 10) {
                  boxHeight -= height / 100;
                  boxWidth += width / 100;
                  top = 1 - boxHeight / height;
                } else {
                  boxShadowLeft = 0;
                  boxShadowTop = -3;
                  blueLoading.current.style.borderLeft = 'none';
                  left = 0.01;
                }
              } else {
                top += 0.01;
              }
            }
          } else {
            if (top <= 0.001) {
              top = 0;
              boxShadowLeft = -3;
              boxShadowTop = 3;
              blueLoading.current.style.borderTop = '5px solid #5024FF';
              if (boxHeight - height / 100 > 10) {
                boxHeight -= height / 100;
                boxWidth += width / 100;
                left = 1 - boxWidth / width;
              } else {
                boxShadowLeft = 0;
                boxShadowTop = 3;
                blueLoading.current.style.borderRight = 'none';
                left -= 0.01;
                if (left <= 0) {
                  left = 0;
                }
              }
            } else {
              if (left + 0.01 >= 1 - boxWidth / width) {
                boxShadowLeft = -3;
                boxShadowTop = -3;
                blueLoading.current.style.borderRight = '5px solid #5024FF';
                if (boxWidth - width / 100 > 10) {
                  boxHeight += height / 100;
                  boxWidth -= width / 100;
                  top = 1 - boxHeight / height;
                  left = 1 - boxWidth / width;
                } else {
                  boxShadowLeft = -3;
                  boxShadowTop = 0;
                  blueLoading.current.style.borderBottom = 'none';
                  top -= 0.01;
                }
              } else {
                left += 0.01;
              }
            }
          }
          blueLoading.current.style.boxShadow = 'inset ' + boxShadowLeft + 'px ' + boxShadowTop + 'px 6px #2600BF';
          blueLoading.current.style.height = (boxHeight) + 'px';
          blueLoading.current.style.width = (boxWidth) + 'px';
          blueLoading.current.style.left = (left * width) + 'px';
          blueLoading.current.style.top = (top * height) + 'px';
          if (blueLoading.current.classList.contains(styles.faded)) {
            blueLoading.current.style.left = '0px';
            blueLoading.current.style.top = '0px'
            blueLoading.current.style.height = document.body.offsetHeight / 2 + 'px';
            blueLoading.current.style.width = '10px';
            blueLoading.current.style.border = 'none';
            finishLoad();
            clearInterval(blueLoadInterval);
          }
        } else {
          handleErrorUI();
          throw new Error('loading element has been been modified or destroyed');
        }
      }, 3);
    }
  }

  async function finishLoad() {
    if (blueLoading.current && blackBackground.current) {
      localStorage.setItem('haveBeen', 'true');
      blackBackground.current.classList.remove(styles.faded);
      blueLoading.current.classList.remove(styles.faded);
      blueLoading.current.style.height = '100%';
      blueLoading.current.style.width = '100%';
      blueLoading.current.style.border = '5px solid #00f'
      blueLoading.current.style.boxShadow = 'inset -3px -3px 5px #2600BF, inset 3px 3px 5px #2600BF';
      setAnyTracks(true);
      setText('');

      if (blueLoading.current && blackBackground.current) {
        let count = -50;
        blueLoading.current.style.borderRadius = '8px';

        // // To catch when ChatGPT returns no songs (but no other error occurs)
        // let noTracksCount = 0;
        // let definatelyTracks = false;
        const fadeBack = setInterval(() => {
          // // Tracks might not imidiately load, so something like if(!songTrack.current)window.alert would not work.
          // if(!definatelyTracks){
          //   if(songTrack.current){
          //     definatelyTracks = true;
          //   }else{
          //     // Wait two seconds for track to load just to be safe (sometimes it takes 200 ms).
          //     if(noTracksCount>1000){
          //       clearInterval(fadeBack);
          //       window.alert('Sorry: no songs met that request');
          //       location.reload();
          //       return;
          //     }
          //     noTracksCount++;
          //   }
          // }
          if (blueLoading.current && blackBackground.current && songTrack.current) {

            if (count <= 0) {
              if (songTrack.current) {
                songTrack.current.style.zIndex = '10';
                const height = document.body.offsetHeight;
                const width = document.body.offsetWidth;
                const trackHeight = songTrack.current.offsetHeight;
                const trackWidth = songTrack.current.offsetWidth;
                blueLoading.current.style.top = (50 + count) * songTrack.current.offsetTop / 50 + 'px';
                blueLoading.current.style.height = trackHeight - count * (height - trackHeight) / 50 + 'px';
                blueLoading.current.style.left = (50 + count) * songTrack.current.offsetLeft / 50 + 'px';
                blueLoading.current.style.width = trackWidth - count * (width - trackWidth) / 50 + 'px';
              }
              if (count == 0) {
                blackBackground.current.style.zIndex = '7';
              }
            } else {
              if (count > 25) {
                blackBackground.current.style.opacity = ((150 - count) / 100).toString();
              }
              if (count == 50) {
                blueLoading.current.style.borderRadius = '0px';
                blueLoading.current.classList.add(styles.faded);
              }
              if (count == 150) {
                if (textForm.current) {
                  textForm.current.style.pointerEvents = 'all';
                }
                songTrack.current.style.zIndex = '8';
                blackBackground.current.style.zIndex = '9';
                blackBackground.current.classList.add(styles.faded);
                if (localStorage.getItem('haveBeen') == 'false' && refinePopup.current) {
                  refinePopup.current.classList.remove(styles.faded);
                }
                clearInterval(fadeBack);
              }
            }
            count++;
          } else {
            //handleErrorUI();
            //throw new Error('loading or track elements have been been modified, destroyed, or they do not exist');
          }
        }, 2);
      }
    } else {
      handleErrorUI();
      throw new Error('loading elements have been been modified or destroyed');
    }
  }

  async function closeRefreshPopup() {
    if (refinePopup.current) {
      refinePopup.current.classList.add(styles.faded);
      localStorage.setItem('haveBeen', 'true');
    } else {
      handleErrorUI();
      throw new Error('can not close popup if it does not exist.');
    }
  }

  return (
    <div className={styles.container}>
      <div ref={blueLoading} className={loading ? styles.blueOutline : `${styles.blueOutline} ${styles.faded}`}> </div>
      <div ref={blackBackground} className={loading ? styles.blackBackground : `${styles.blackBackground} ${styles.faded}`}>
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
      {/* This should kind of merge with the commented out code when we connect with spotufy. */}
      <div className={styles.spotifyContainer}>
        {/* <Image
          src="/img/spotify_logo.png"
          width="112"
          height="32"
          alt="spotify_logo.png"
        /> */}
        {/* {
          signedIn? <button className={styles.accountButton} onClick={() => setSignedIn(false)}> Sign Out of Spotify </button>
            : <button className={styles.accountButton} onClick={() => setSignedIn(true)}> Sign In to Spotify </button>
        }
        <a href={"https://accounts.spotify.com"}>{signedIn?"OPEN SPOTIFY":"GET SPOTIFY FREE"}</a> */}
        {/* <a className={styles.spotifyLink} href={"https://accounts.spotify.com"}>{"OPEN SPOTIFY"}</a> */}
        <span className={styles.comingSoonText} >
          Spotify integration coming soon!
        </span>

      </div>
      {/*
        !session ?
          <button className={styles.signInButton} onClick={() => signIn('spotify')}>
            Sign in with
            <Image
              src="/img/spotify_icon.png"
              width="36"
              height="36"
              alt="spotify_icon.png"
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
  */}
      <div className={styles.content}>
        {/* {
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
        } */}
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
          }}>
            <input
              ref={textForm}
              type="text"
              className={styles.form_contents}
              placeholder={textPlaceholder}
              value={text}
              onChange={e => setText(e.target.value)}
              spellCheck="false"
              required
            />
            <div ref={refinePopup} className={`${styles.refinePopup} ${styles.faded}`}>
              <div onClick={() => { closeRefreshPopup() }} className={styles.refinePopupX}> &times; </div>
              Click the refresh button to refine the results!
            </div>
            {
              tracks &&
              <Tooltip
                open={refineTooltip}
                onOpen={() => setRefineTooltip(true)}
                onClose={() => setRefineTooltip(false)}
                title="Type text and click to refine the results!" arrow componentsProps={{
                  tooltip: {
                    sx: {
                      fontSize: "16px"
                    }
                  }
                }}>
                <button className={loading ? `${styles.submitIcon} ${styles.faded}` : styles.submitIcon}
                  type="button"
                  style={{ right: '50px' }}
                  onClick={() => {
                    generateSongs(true)
                  }}
                >
                  <Image
                    src={haveBeen ? "/icons/reprompt.svg" : "/icons/repromptYellow.svg"}
                    width={haveBeen ? "36" : "48"}
                    height={haveBeen ? "36" : "48"}
                    alt="reprompt.svg"
                  />
                </button>
              </Tooltip>
            }
            <Tooltip title="Generate songs" arrow>
              <button className={loading ? `${styles.submitIcon} ${styles.faded}` : styles.submitIcon} name="bolt">
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
                <div ref={i == 0 ? songTrack : null} key={i}>
                  <Track
                    currAudio={currAudio}
                    setCurrAudio={setCurrAudio}
                    session={session}
                    track={track}
                  />
                </div>
              )
            }
          </div>
        }
      </div>
    </div>
  );
}
