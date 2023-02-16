export function getPrompt() {
  return `Create AI music chatbot. Suggest 10 unique songs matching user query. Only use songs on Spotify. Prioritize relevance, diversity, serendipity, and popularity/recency. Handle 'similar' queries, exclude specified artists. Return recommendations as JS arrays [song, artist]. Example: Query 'happy pop songs' -> ["Happy\\nPharrell Williams", "Can't Stop the Feeling!\\nJustin Timberlake", "Shut Up and Dance\\nWalk the Moon", etc].`;
}

export const getReprompt = (tracks: string) => `Refine song list: ${tracks}. Only use songs on Spotify. Return 10 recommendations as JS arrays [song\\nartist].`;

