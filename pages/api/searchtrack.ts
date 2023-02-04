import { searchTrack } from '@/util/spotify';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { url } = req.query;
  if (typeof url !== 'string') throw 'invalid search url';
  const response = await searchTrack(url);
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
