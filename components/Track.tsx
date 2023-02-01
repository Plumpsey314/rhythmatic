import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import { Tooltip } from '@mui/material';
import { useState } from 'react';
import styles from '../styles/components/Track.module.scss';

export default function Track(props: any) {
  const { name, id, artists, album, external_urls, session } = props;

  const [saved, setSaved] = useState(false);

  // saves given track to library
  async function saveTrack(id: string) {
    setSaved(true);
    await fetch(`/api/savetrack?id=${encodeURIComponent(id)}`);
  };

  return (
    <div className={styles.container}>
      <a
        href={external_urls['spotify']} target="_blank" rel="noopener noreferrer"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={album.images[0].url} alt="" />
        <div className={styles.details}>
          <h1>{name}</h1>
          <p>{artists.map((artist: any) => artist.name).join(', ')}</p>
          <p>{album.name}</p>
        </div>
        <span className={styles.flexfill} />
      </a>
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
    </div>
  );
}
