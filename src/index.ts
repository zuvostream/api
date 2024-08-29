import { Elysia, redirect, t } from "elysia";
import { PrismaClient } from "@prisma/client"
import { jwt } from '@elysiajs/jwt'
import bcryptjs from "bcryptjs";
import cors from "@elysiajs/cors";
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
.get('/project/:id', async ({jwt, cookie: { token }, params: {id}}) => {
    let project = await db.project.findUnique({ where: { id: id}})
    if(!project) {
    return { success: false, message: "ay dis don't exsist 😭🙏"}
    }
let users = await db.user.findUnique({ where: { id: project.creatorId } });
    if(!users) {
        return { success: false, message: "ay dis don't exsist �����"}
    }
    return { success: true,
        project: {
            Id: project.id,
            Title: project.title,
            Visibility : project.Visibility,
            Image: project.image,
            Creator: users.username,
            CreatedAt: project.createdAt,
            UpdatedAt: project.updatedAt
        }
    }
})
.post('/create/project', async ({ set, jwt, cookie: { token }}) => {
    let me = await jwt.verify( token.value )
    if(!me) {
        set.status = 401
        return { success: false, message: "Invalid token" };
    }
    let user = await db.user.findUnique({ where: { id: String(me.id) },
    })
let createproject = await db.project.create({
    data: {
        title: user?.username + `'s Project`,
        creatorId: String(me.id) 
    }
});
},
)
.post('/redeem', async ({ body, set, jwt, cookie: { token }}) => {
    let me = await jwt.verify(token.value);
    if (!me) {
        set.status = 401;
        return { success: false, message: "Invalid token" };
    }
    let { Code } = body as { Code: string };
    try {
        let searchdb = await db.premiumKeys.findFirst({
            where: { Code }
        });

        if (!searchdb) {
            set.status = 404;
            return { success: false, message: "Invalid key or already used." };
        }
        await db.premiumKeys.delete({
            where: {
                id: searchdb.id
            }
        });

        return { success: true, message: "Key redeemed successfully." };
    } catch (error) {
        set.status = 500;
        return { success: false, message: "An error occurred during the operation." };
    }
}, {
    body: t.Object({
        Code: t.String({})
    })
})
)
.put('/me', async ({ jwt, cookie: { token } }) => {
    let me = await jwt.verify(token.value);
    if (!me) {
        return { success: false, message: "Invalid token" };
    }

    let userId = String(me.id);
    let user = await db.user.findUnique({
        where: { id: userId },
        include: {
            projects: {
                include: {
                    creator: true
                }
            }
        },
    });
    return {
        success: true,
        token: token.value,
        user: {
            id: me.id,
            username: user?.username,
	    Avatar: user?.Avatar,
                projects: user?.projects.map(project => ({
                Id: project.id,
                Title: project.title,
                Visibility : project.Visibility,
                Image: project.image,
                Creator: project.creator?.username,
                CreatedAt: project.createdAt,
                UpdatedAt: project.updatedAt
            })) || [],
        }
    };
})
.listen(process.env.PORT!);
console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
