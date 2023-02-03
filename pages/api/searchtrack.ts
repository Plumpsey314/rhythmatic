import { searchTrack } from '@/util/spotify';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { token: { accessToken } } = (await getSession({ req })) as any;
  const { url } = req.query;
  if (typeof url !== 'string') throw 'invalid search url';
  const response = await searchTrack(accessToken, url);
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
