export function getPrompt() {
  let prompt = `Create AI music chatbot. Suggest ten unique songs matching user query. Prioritize relevance, diversity, serendipity, and popularity/recency. Handle 'similar' queries, exclude specified artists. Return recommendations as JS arrays [song, artist].`
  
  prompt += `Example: Query 'happy pop songs' -> ["Happy\\nPharrell Williams", "Can't Stop the Feeling!\\nJustin Timberlake", "Shut Up and Dance\\nWalk the Moon", etc].`
  return prompt;
}
 
 

export function getReprompt(tracks: string) {
  let prompt = `Refine the song list using same prompt: ${tracks}. Get updated 10 recommendations in the same format.\n\n`;
  return prompt;
}
