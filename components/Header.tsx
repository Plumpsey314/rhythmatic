import { signIn, signOut } from 'next-auth/react';
import Image from 'next/image';
import styles from '../styles/components/Header.module.scss';

type Props = {
  session: any;
};

export default function Header(props: Props) {
  const { session } = props;

  return (
    <div className={styles.container}>
      <h1>
        <Image
          className={styles.logo}
          src="/img/logo.png"
          width="48"
          height="48"
          alt="logo.png"
        />
        <span>Finetune</span>
      </h1>
      <span className={styles.tm}>&trade;</span>
      <p className={styles.x}>&times;</p>
      <Image
        className={styles.spotify}
        src="/img/spotify_green.png"
        width={2362 / 16}
        height={709 / 16}
        alt="spotify_green.png"
      />
      <Image
        className={styles.spotify_icon}
        src="/img/spotify_icon_green.png"
        width={709 / 16}
        height={709 / 16}
        alt="spotify_icon_green.png"
      />
      <span className={styles.flexfill} />
      {
        session ?
          <>
            <p className={styles.name}>
              Logged in as {(session as any).token.name}
            </p>
            <button onClick={() => signOut()}>
              Sign Out
            </button>
          </> :
          <button onClick={() => signIn()}>
            Log in with Spotify
          </button>
      }
    </div>
  );
}
