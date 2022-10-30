import Datastore from "nedb";

const db = new Datastore({ filename: "./db" });
await new Promise((resolve) => db.loadDatabase(resolve));

console.log("Loaded database ✅");

export async function addPoints(memberID, count) {
  return db.update(
    { id: memberID },
    {
      $inc: {
        score: count,
      },
    },
    {
      upsert: true,
      returnUpdatedDocs: true,
    }
  );
}

export async function getPoints(memberID) {
  return new Promise((resolve) =>
    db.findOne({ id: memberID }, (r, result) => resolve(result?.score || 0))
  );
}
/** @returns {Promise<{id: string, score:number}[]>} */
export async function getLead() {
  return new Promise((resolve) => db.find({}, (r, result) => resolve(result)));
}
