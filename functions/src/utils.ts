import * as functions from "firebase-functions";
import * as algolia from "algoliasearch";
import * as mailgunJs from "mailgun-js";

const ALGOLIA_ID = functions.config().algolia.app_id;
const ALGOLIA_ADMIN_KEY = functions.config().algolia.admin_key;
export const ALGOLIA_SEARCH_KEY = functions.config().algolia.search_key;
export const agoliaClient = algolia(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);

export const mailGunApiKey = functions.config().mailgun.apikey;
export const mailGunDomain = functions.config().mailgun.domain;
export const mailGun = mailgunJs({ apiKey: mailGunApiKey, domain: mailGunDomain });

export async function modifyAlgoliaDocument<D>(
  indexName: string,
  { before, after }: functions.Change<functions.firestore.DocumentSnapshot>,
  transformData?:
    | ((data: D & { objectID: string; [key: string]: any }) => { objectID: string; [key: string]: any })
    | ((data: D & { objectID: string; [key: string]: any }) => Promise<{ objectID: string; [key: string]: any }>)
) {
  const isDeletion = before.exists && !after.exists;
  const index = agoliaClient.initIndex(indexName);

  if (!isDeletion) {
    const data = after.data() as D & { objectID: string; [key: string]: any };
    data.objectID = after.id;

    const document = await Promise.resolve(transformData ? transformData({ ...data }) : data).then();
    return index.saveObject(document);
  }

  return index.deleteObject(after.id);
}
