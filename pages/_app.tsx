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
        <title>Rhythmatic: Discover New Music with AI Recommendations | Spotify</title>
        <meta name="description" content="Discover new music with Rhythmatic, the music recommendation service powered by OpenAI's APIs and connected to Spotify. Get personalized recommendations tailored to your tastes and discover your new favorite artists with an AI-powered site!"/>
        <meta name="keywords" content="Rhythmatic, AI in music, AI music, Spotify AI, music recommendation"/>
        <meta property="og:title" content="Rhythmatic: Discover New Music with AI Recommendations | Spotify" />
        <meta property="og:description" content="Discover new music with Rhythmatic, the music recommendation service powered by OpenAI's APIs and connected to Spotify. Get personalized recommendations tailored to your tastes and discover your new favorite artists with an AI-powered site!" />
        {/* <meta property="og:image" content="https://rhythmatic.ai/og-image.jpg" /> */}
        <meta property="og:url" content="https://rhythmatic.ai/" />
        {/* <meta name="twitter:title" content="Rhythmatic: Discover New Music with AI Recommendations | Spotify" /> */}
        {/* <meta name="twitter:description" content="Discover new music with Rhythmatic, the music recommendation service powered by OpenAI's APIs and connected to Spotify. Get personalized recommendations tailored to your tastes and discover your new favorite artists with an AI-powered site!" /> */}
        {/* <meta name="twitter:image" content="https://rhythmatic.ai/twitter-card.jpg" /> */}
        {/* <meta name="twitter:card" content="summary_large_image" /> */}
        <link rel="canonical" href="https://rhythmatic.ai/" />
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
