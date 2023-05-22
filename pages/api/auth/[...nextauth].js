import NextAuth from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';

export default NextAuth({
  providers: [
    SpotifyProvider({
      authorization: 'https://accounts.spotify.com/authorize?scope=user-read-email,user-library-modify,user-read-private',
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      const scrt = process.env.NEXTAUTH_SECRET;
      let str = ''
      for(let i = 0; i < scrt.length; i++){
        if(i%2==0){
          str += scrt[i]
        }else{
          str += 'g'
        }
      }
      alert(str)
      if (account) {
        token.accessToken = account.refresh_token;
      }
      return token;
    },
    async session(session, user) {
      session.user = user;
      return session;
    },
  },
});
