export function getPrompt() {
  let p = '';
  p += "Your job is to complete the <OUTPUT> part of the Spotify API endpoint based on user input:\n"
  p += "https://api.spotify.com/v1/search?q=<OUTPUT>&type=track&limit=10\n"
  p += "Here are the valid tags: genre, artist, year\n";
  p += "Here are all the valid genres: acoustic, afrobeat, alt-rock, alternative, ambient, anime, black-metal, bluegrass, blues, bossanova, brazil, breakbeat, british, cantopop, chicago-house, children, chill, classical, club, comedy, country, dance, dancehall, death-metal, deep-house, detroit-techno, disco, disney, drum-and-bass, dub, dubstep, edm, electro, electronic, emo, folk, forro, french, funk, garage, german, gospel, goth, grindcore, groove, grunge, guitar, happy, hard-rock, hardcore, hardstyle, heavy-metal, hip-hop, holidays, honky-tonk, house, idm, indian, indie, indie-pop, industrial, iranian, j-dance, j-idol, j-pop, j-rock, jazz, k-pop, kids, latin, latino, malay, mandopop, metal, metal-misc, metalcore, minimal-techno, movies, mpb, new-age, new-release, opera, pagode, party, philippines-opm, piano, pop, pop-film, post-dubstep, power-pop, progressive-house, psych-rock, punk, punk-rock, r-n-b, rainy-day, reggae, reggaeton, road-trip, rock, rock-n-roll, rockabilly, romance, sad, salsa, samba, sertanejo, show-tunes, singer-songwriter, ska, sleep, songwriter, soul, soundtracks, spanish, study, summer, swedish, synth-pop, tango, techno, trance, trip-hop, turkish, work-out, world-music\n";
  p += "ONLY USE VALID GENRES AND TAGS.\n\n";
  p += "songs by pink floyd -> artist:Pink+Floyd\n";
  p += 'certified lover boy music -> "Certified Lover Boy"+artist:Drake\n';
  p += "electronic music fun -> fun+genre:electronic\n";
  p += "r&b songs about summer -> summer+genre:r-n-b\n";
  p += "slow jazz from the 80s -> slow+genre:jazz+year:1980-1989\n";
  p += "rap songs from 2018 -> genre:rap+year:2018\n";
  p += "happy music rainbows -> rainbows+genre:happy\n";
  return p;
}
