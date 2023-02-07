import { searchTrack } from '@/util/spotify';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { song, artist } = req.query;
  if (typeof song !== 'string' || typeof artist !== 'string') {
    throw 'invalid search query';
  }
  const response = await searchTrack(song, artist);
  // handle ok
  if (response.ok) {
    const data = await response.json();
    return res.status(200).json(data);
  }
  // handle error
  console.error(response.status, response.statusText);
  return res.status(response.status).json({});
};

export default handler;
