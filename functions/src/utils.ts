import * as functions from "firebase-functions";
import * as algolia from "algoliasearch";

const ALGOLIA_ID = functions.config().algolia.app_id;
const ALGOLIA_ADMIN_KEY = functions.config().algolia.admin_key;
export const ALGOLIA_SEARCH_KEY = functions.config().algolia.search_key;

export const agoliaClient = algolia(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);

export function modifyAlgoliaDocument<D>(
  indexName: string,
  { before, after }: functions.Change<functions.firestore.DocumentSnapshot>,
  transformData?: (data: D & { objectID: string; [key: string]: any }) => { objectID: string; [key: string]: any }
) {
  const isDeletion = before.exists && !after.exists;
  const index = agoliaClient.initIndex(indexName);

  if (!isDeletion) {
    const data = after.data() as D & { objectID: string; [key: string]: any };
    data.objectID = after.id;
    const guest = transformData ? transformData({ ...data }) : data;
    return index.saveObject(guest);
  }

  return index.deleteObject(after.id);
}
