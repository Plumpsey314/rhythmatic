const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const TRACKS_ENDPOINT = 'https://api.spotify.com/v1/me/tracks';
const SEARCH_ENDPOINT = 'https://api.spotify.com/v1/search';

async function getAccessToken(refresh_token: string) {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
    }),
  });

  return response.json();
};

export async function saveTrack(refresh_token: string, id: string) {
  const { access_token } = await getAccessToken(refresh_token);
  return fetch(`${TRACKS_ENDPOINT}?ids=${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  });
};
