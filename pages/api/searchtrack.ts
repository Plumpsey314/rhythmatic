import { searchTrack } from '@/util/spotify';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { token: { accessToken } } = (await getSession({ req })) as any;
  const { song, artist } = req.query;
  if (typeof song !== 'string' || typeof artist !== 'string') {
    throw 'invalid search query';
  }
  const response = await searchTrack(accessToken, song, artist);
  const data = await response.json();
  return res.status(200).json(data);
};

export default handler;
