export function getPrompt() {
  return '';
  // return `Suggest 10 unique songs matching user query. Only use songs on Spotify. Prioritize relevance, diversity, serendipity, and popularity/recency. Handle 'similar' queries, exclude specified artists.`;
}

// Currently not used; Instead we are using the prompt function for reprompting.
export const getReprompt = (tracks: string) => `Refine song list: ${tracks}. Only use songs on Spotify. Return 10 recommendations as JS arrays [song\\nartist].`;

