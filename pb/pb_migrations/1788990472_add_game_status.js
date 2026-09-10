/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = app.findCollectionByNameOrId("gameStatus");
  if (!collection) return;

  if (!collection.fields.getByName("status")) {
    collection.fields.addMarshaledJSON(JSON.stringify({
      name: "status",
      type: "select",
      maxSelect: 1,
      values: ["registration", "in-progress", "stopped"],
      required: false,
    }));
  }

  app.save(collection);

  // Backfill existing rounds: tick 0 means still registering, otherwise running.
  const limit = 100;
  let offset = 0;
  for (;;) {
    const records = app.findRecordsByFilter("gameStatus", "", "", limit, offset);
    if (!records || records.length === 0) break;
    for (const rec of records) {
      if (!rec) continue;
      if (rec.get("status") == null || rec.get("status") === "") {
        rec.set("status", rec.getInt("currentTick") > 0 ? "in-progress" : "registration");
        app.save(rec);
      }
    }
    if (records.length < limit) break;
    offset += limit;
  }
}, (app) => {
  const collection = app.findCollectionByNameOrId("gameStatus");
  if (!collection) return;
  if (collection.fields.getByName("status")) {
    collection.fields.removeByName("status");
  }
  app.save(collection);
});
