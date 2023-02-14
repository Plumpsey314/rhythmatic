export function getPrompt() {
  let prompt = ` Build a fast AI music chatbot. Recommend teb unique songs matching user query. Prioritize relevance, diversity, serendipity, and popularity/recency. Handle 'similar' queries, excluding specified artists. Return recommendations as JS arrays [song, artist].`
  prompt += `Example: Query = 'find me happy pop songs' output = '["Happy\\nPharrell Williams", "Can't Stop the Feeling!\\nJustin Timberlake", "Shut Up and Dance\\nWalk the Moon", etc]."'\n\n`
  return prompt;
}
 
 

export function getReprompt(tracks: string) {
  let prompt = `Refine the song list: ${tracks}. Get updated 10 recommendations in the same format.\n\n`;
  return prompt;
}
