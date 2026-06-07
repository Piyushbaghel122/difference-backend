import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import { Strategy as GitHubStrategy, Profile } from "passport-github2";


dotenv.config();

const requiredEnv = [
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "SESSION_SECRET"
] as const;

for (const name of requiredEnv) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

const PORT = Number(process.env.PORT || 5000);
const GITHUB_CALLBACK_URL =
  process.env.GITHUB_CALLBACK_URL ||
  `http://localhost:${PORT}/auth/github/callback`;

const app = express();

type GithubUser = {
  githubId: string;
  username?: string;
  displayName?: string;
  avatar?: string;
  profileUrl?: string;
};

declare global {
  namespace Express {
    interface User extends GithubUser {}
  }
}

app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: Express.User, done) => {
  done(null, user);
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      callbackURL: GITHUB_CALLBACK_URL,
      state: true
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (error: any, user?: GithubUser) => void
    ) => {
      const user: GithubUser = {
        githubId: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        avatar: profile.photos?.[0]?.value,
        profileUrl: profile.profileUrl
      };

      return done(null, user);
    }
  )
);

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "GitHub OAuth API is running",
    loginUrl: "/auth/github"
  });
});

app.get(
  "/auth/github",
  passport.authenticate("github", {
    scope: ["user:email"]
  })
);

app.get(
  "/auth/github/callback",
  (req: Request, res: Response, next) => {
    passport.authenticate(
      "github",
      (error: unknown, user: Express.User | false) => {
        if (error) {
          const oauthError = error as {
            message?: string;
            oauthError?: { statusCode?: number; data?: string };
          };

          console.error("GitHub OAuth callback failed:", {
            message: oauthError.message,
            statusCode: oauthError.oauthError?.statusCode,
            providerResponse: oauthError.oauthError?.data
          });

          return res.redirect("/login-failed");
        }

        if (!user) {
          return res.redirect("/login-failed");
        }

        req.logIn(user, (loginError) => {
          if (loginError) {
            return next(loginError);
          }

          res.json({
            success: true,
            message: "GitHub login successful",
            user
          });
        });
      }
    )(req, res, next);
  }
);

app.get("/login-failed", (req: Request, res: Response) => {
  res.status(401).json({
    success: false,
    message: "GitHub login failed"
  });
});

app.get("/auth/me", (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not logged in"
    });
  }

  res.json({
    success: true,
    user: req.user
  });
});

app.post("/auth/logout", (req: Request, res: Response, next) => {
  req.logout((logoutError) => {
    if (logoutError) {
      return next(logoutError);
    }

    req.session.destroy((sessionError) => {
      if (sessionError) {
        return next(sessionError);
      }

      res.clearCookie("connect.sid");
      res.json({
        success: true,
        message: "Logout successful"
      });
    });
  });
});

app.use(
  (
    error: Error,
    req: Request,
    res: Response,
    next: (error?: unknown) => void
  ) => {
    console.error("Request failed:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running: http://localhost:${PORT}`);
    console.log(`GitHub callback URL: ${GITHUB_CALLBACK_URL}`);
  });
}

export default app;
