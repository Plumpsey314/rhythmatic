import { saveTrack } from '@/util/spotify';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { token: { accessToken } } = (await getSession({ req })) as any;
  const { id } = req.query;
  if (typeof id !== 'string') throw 'invalid save track request';
  await saveTrack(accessToken, id);
  return res.status(200).json({});
};

export default handler;
