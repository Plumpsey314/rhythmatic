import '@/styles/globals.scss';
import { firebaseConfig } from '@/util/firebaseConfig';
import { getApps, initializeApp } from 'firebase/app';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';

// initialize firebase
if (!getApps().length) initializeApp(firebaseConfig);

export default function App(props: AppProps) {
  const { Component, pageProps: { session, ...pageProps } } = props;

  return (
    <>
      <Head>
        <title>Rhythmatic</title>
        <meta name="description" content="Discover new music with Rhythmatic.ai, the music recommendation service powered by OpenAI's APIs and connected to Spotify. Get personalized recommendations tailored to your tastes and discover your new favorite artists."/>
        <link rel="icon" href="/favicons/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png" />
      </Head>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </>
  );
}
