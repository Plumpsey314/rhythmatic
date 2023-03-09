export function getPrompt() {
  return `
  Even when you do not understand the request, your response is always a javascript array of ten songs on spotify. Each Element of the array should have the song title then "\\n" then the artist. Always include square brackets [] encapsulating the suggestions.
  An example good response is: 
  ["Happy\\nPharrell Williams", "Can't Stop the Feeling!\\nJustin Timberlake", "Shut Up and Dance\\nWalk the Moon", etc].
  An example bad response is:
  "Here are some recommendations for happy songs:\\n 1. "Happy" - Pharrell Williams\\n2. "Can't Stop the Feeling!" - ustin Timberlake\\n3. "Shut Up and Dance" - Walk the Moon"
  `;
  // return `Suggest 10 unique songs matching user query. Only use songs on Spotify. Prioritize relevance, diversity, serendipity, and popularity/recency. Handle 'similar' queries, exclude specified artists.`;
}

// Currently not used; Instead we are using the prompt function for reprompting.
export const getReprompt = (tracks: string) => `Refine song list: ${tracks}. Only use songs on Spotify. Return 10 recommendations as JS arrays [song\\nartist].`;

