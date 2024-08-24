import { Elysia, redirect, t } from "elysia";
import { PrismaClient } from "@prisma/client"
import { jwt } from '@elysiajs/jwt'
import bcryptjs from "bcryptjs";
import cors from "@elysiajs/cors";
import { discord_url } from "./exports";
let db = new PrismaClient();
let app = new Elysia()
.use(
  jwt({
    name: 'jwt',
    secret: process.env.JWT!
})
)
.use(cors())
app.group('/v1', (app) => 
  app
  .post('/register', async ({body}) => {
      let { username, email, password } = body as { username: string; email: string; password: string };
      try {
          let salt = await bcryptjs.genSalt(10);  
          let hashedPassword = await bcryptjs.hash(password, salt); 
          await db.user.create({
              data: {
                  username,
                  email,
                  password: hashedPassword
              }
          });
          return { success: true, message: "User created successfully" };
      } catch (error) {
          return { success: false, message: "Error creating user"};
      }
  },
  {
      body: t.Object({
          username: t.String({ maxLength: 32 }),
          email: t.String({}),
          password: t.String({ minLength: 8, maxLength: 32 })
      })
  })
.post('/signin', async ({body, jwt, cookie: { token }}) => {
  let { username, password } = body as { username: string; password: string };
  try {
    let user = await db.user.findFirst({ 
        where: { username }
    });
    if (!user || !(await bcryptjs.compare(password, user.password))) {
        return { success: false, message: "Invalid username or password" };
    } 
    let jasontoken = await jwt.sign({ id: user.id  });
    token.set({
        value: jasontoken,
        httpOnly: true,
    });
    return { success: true, token:  jasontoken};
} catch (error) {
    return { success: false, message: "Error during sign in" };
}
},
{
body: t.Object({
    username: t.String({ maxLength: 32 }),
    password: t.String({ minLength: 8 })
})})
.post('/signout', async ({ jwt, cookie: { token }}) => {
    let me = await jwt.verify(token.value)
    if(!me){
        return { success: false, message: "Invalid token" };
    } 
    token.remove();
})
.post('/user/:username', async ({ set, params: { username }}) => {
    //chcek prisma for username
    let user = await db.user.findFirst({ where: { username } })
    let schema = [
         user?.username,
        user?.About || 'No Bio Provided',
        user?.Avatar,
        user?.Banner
    ]
    if(!user) {
        set.status = 404
        return { success: false }
    }
    return { 
        success: true, 
        user: {
            "Username": user?.username,
            "Banner": user?.Banner,
            "Avatar": user?.Avatar,
            "Bio": user?.About || 'No Bio Provided',
            "Discord": user?.Discord
        } };
})
)
.put('/me', async ({jwt, cookie: {token}}) => {
    let me = await jwt.verify(token.value)
    if(!me){
        return { success: false, message: "Invalid token" };
    } 
    let userId = String(me.id);
    let user = await db.user.findUnique({
        where: {
            id: userId,
        },
    });
    return{
        "success": true,
        "token": token.value,
        "user": {
            "id": me.id,
            "Username": user?.username,
            "Banner": user?.Banner,
            "Avatar": user?.Avatar
        }
    }
} 
)
.group('/connections', (app) =>
    app
    .get('/discord', async => {
        return redirect(discord_url)
    })
)

.group('/callback', (app) =>
    app.get('/discord', async ({ query, jwt, cookie: { token } }) => {
        let { code } = query as { code: string };

        if (!code) {
            return { success: false, message: "No code provided" };
        }
        try {
            let accessTokenResponse = await fetch("https://discord.com/api/oauth2/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    client_id: process.env.DISCORD_CLIENT_ID!,
                    client_secret: process.env.DISCORD_CLIENT_SECRET!,
                    code,
                    grant_type: "authorization_code",
                    redirect_uri: process.env.DISCORD_REDIRECT_URI!,
                    scope: "identify",
                }),
            });
            let accessTokenData = await accessTokenResponse.json();
            if (!accessTokenData.access_token) {
                return { success: false, message: "Failed to get access token" };
            }
            let userResponse = await fetch("https://discord.com/api/users/@me", {
                headers: {
                    "Authorization": `Bearer ${accessTokenData.access_token}`,
                },
            });
            let discordUser = await userResponse.json();
            let me = await jwt.verify(token.value);
            if (!me) {
                return { success: false, message: "Invalid token" };
            }

            await db.user.update({
                where: { id: String(me.id) },
                data: { Discord: discordUser.username },
            });

            return { success: true, message: "Discord account linked", discordUsername: discordUser.username };
        } catch (error) {
            return { success: false, message: "An error occurred" };
        }
    })
)


.listen(process.env.PORT!);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
