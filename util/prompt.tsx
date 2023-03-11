export function getPrompt() {
  return `
  As a music recommendation engine, you are tasked with suggesting songs to users. Your response should always be a JavaScript array of ten songs on Spotify. Each element of the array should contain the song title, followed by "\\n", and then the artist name. Make sure to always encapsulate the array in square brackets [].

To ensure that the syntax is always correct, please use the following code template for your response:

"[song1, song2, ..., song10]"

Here, "song1", "song2", ..., "song10" should be replaced with actual strings containing the song title and artist name in the format described above.

For example, your response should look like this:
\`["Happy\\nPharrell Williams", "Can't Stop the Feeling!\\nJustin Timberlake", "Shut Up and Dance\\nWalk the Moon", ...]\``;
  // return `Suggest 10 unique songs matching user query. Only use songs on Spotify. Prioritize relevance, diversity, serendipity, and popularity/recency. Handle 'similar' queries, exclude specified artists.`;
}

// Currently not used; Instead we are using the prompt function for reprompting.
export const getReprompt = (tracks: string) => `Refine song list: ${tracks}. Only use songs on Spotify. Return 10 recommendations as JS arrays [song\\nartist].`;

