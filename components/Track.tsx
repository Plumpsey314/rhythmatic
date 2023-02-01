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
    </div>
  );
}
