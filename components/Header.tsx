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
    </div>
  );
}
