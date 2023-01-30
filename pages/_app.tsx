import '@/styles/globals.scss';
import type { AppProps } from 'next/app';
import Head from 'next/head';

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <>
      <Head>
        <title>AI Music</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
