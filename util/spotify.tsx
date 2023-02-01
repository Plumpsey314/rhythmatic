const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const TRACKS_ENDPOINT = 'https://api.spotify.com/v1/me/tracks';
const SEARCH_ENDPOINT = 'https://api.spotify.com/v1/search';
