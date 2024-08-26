let clientid = process.env.SPOTIFY_CLIENT_ID!
let clientsecret = process.env.SPOTIFY_CLIENT_SECRET!
let redirecturl = process.env.SPOTIFY_REDIRECT_URI
let scopes = encodeURIComponent("user-read-recently-played");
//you should replace these with your own URL
export let discord_url = "https://discord.com/oauth2/authorize?client_id=1275461125928124561&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Fcallback%2Fdiscord&scope=identify" 
export let spotify_url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientid}&redirect_uri=${redirecturl}&scope=${scopes}`;
export let page_url="http://localhost:3000/"