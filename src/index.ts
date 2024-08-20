import { Elysia, t } from "elysia";
import { PrismaClient } from "@prisma/client"
import { jwt } from '@elysiajs/jwt'
import bcryptjs from "bcryptjs";
let db = new PrismaClient();
let app = new Elysia()
.use(
  jwt({
    name: 'jwt',
    secret: process.env.JWT!
})
)
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
})   
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
} )
.listen(process.env.PORT!);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
