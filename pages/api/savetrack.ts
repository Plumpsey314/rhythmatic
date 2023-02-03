import { saveTrack } from '@/util/spotify';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { token: { accessToken } } = (await getSession({ req })) as any;
  const { id } = req.query;
  if (typeof id !== 'string') throw 'invalid save track request';
  const response = await saveTrack(accessToken, id);
  // handle ok
  if (response.ok) return res.status(200).json({});
  // handle error
  console.error(response.status, response.statusText);
  return res.status(response.status).json({});
};

export default handler;
