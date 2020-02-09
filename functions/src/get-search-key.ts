import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";
import * as cors from "cors";

import { agoliaClient, ALGOLIA_SEARCH_KEY } from "./utils";

const app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  cors({
    origin: (origin, cb) => {
      const allowedOrigins = ["https://us-central1-wedlock-316f8.cloudfunctions.net", "http://localhost:3000"];
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        cb(null, true);
        return;
      }
      if (allowedOrigins.indexOf(origin) === -1) {
        cb(new Error("The CORS policy for this site does not allow access from the specified Origin."), false);
        return;
      }
      cb(null, true);
    }
  })
);
app.use(validateFirebaseIdToken);

app.post<{ weddingId: string }>("/", async (req, res) => {
  const user = await admin
    .firestore()
    .doc(`users/${req.user.user_id}`)
    .get();
  const userData = user.data() as any;
  if (!user.exists) {
    res.status(400).send("User cannot be found");
    return;
  }

  if (!userData.weddingIds || !userData.weddingIds.includes(req.body.weddingId)) {
    res.status(401).send("User does not have permission to view this wedding");
    return;
  }

  // Create the params object as described in the Algolia documentation:
  // https://www.algolia.com/doc/guides/security/api-keys/#generating-api-keys
  const params = {
    // This filter ensures that only documents with correcsponding weddingId will be readable
    filters: `weddingId:${req.body.weddingId}`,
    // We also proxy the user_id as a unique token for this key.
    userToken: req.user.user_id
  };

  // Call the Algolia API to generate a unique key based on our search key
  const key = agoliaClient.generateSecuredApiKey(ALGOLIA_SEARCH_KEY, params);

  res.json({ key });
});

// Finally, pass our ExpressJS app to Cloud Functions as a function
// called 'getSearchKey';
const getSearchKey = functions.https.onRequest(app);

export default getSearchKey;

async function validateFirebaseIdToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (
    (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) &&
    !(req.cookies && req.cookies.__session)
  ) {
    res.status(403).send("Unauthorized");
    return;
  }

  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else if (req.cookies) {
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  } else {
    // No cookie
    res.status(403).send("Unauthorized");
    return;
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch (error) {
    res.status(403).send("Unauthorized");
    return;
  }
}
