import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import { Tooltip } from '@mui/material';
import { useState } from 'react';
import styles from '../styles/components/Track.module.scss';

export default function Track(props: any) {
  const {
    name, id, artists, album, external_urls, genres,
    preview_url, popularity, duration_ms, session, explicit
  } = props;

  const [saved, setSaved] = useState(false);

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

  return (
    <div className={styles.container}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={album.images[0].url} alt="" />
      <div className={styles.details}>
        <h1>{name}</h1>
        <p>{artists.map((artist: any) => artist.name).join(', ')}</p>
        <p>{album.name}</p>
      </div>
      <div className={styles.alts}>
        <audio src={preview_url} controls />
        <a href={external_urls['spotify']} target="_blank" rel="noopener noreferrer">
          Spotify link
        </a>
        <p>Popularity: {popularity}/100</p>
      </div>
      <span className={styles.flexfill} />
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
    </div >
  );
}
