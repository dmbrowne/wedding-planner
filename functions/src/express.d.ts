import * as admin from "firebase-admin";

declare module "express-serve-static-core" {
  export interface Request {
    user: admin.auth.DecodedIdToken;
  }
}
