/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = app.findCollectionByNameOrId("gameStatus");
  if (!collection) return;

  if (!collection.fields.getByName("phase")) {
    collection.fields.addMarshaledJSON(JSON.stringify({
      name: "phase",
      type: "select",
      maxSelect: 1,
      values: ["newbie", "pve", "pvp", "ended"],
      required: false,
    }));
  }

  app.save(collection);

  // Backfill existing gameStatus records
  const limit = 100;
  let offset = 0;
  for (;;) {
    const records = app.findRecordsByFilter("gameStatus", "", "", limit, offset);
    if (!records || records.length === 0) break;
    for (const rec of records) {
      if (!rec) continue;
      if (rec.get("phase") == null || rec.get("phase") === "") {
        const status = rec.getString("status");
        let initialPhase = "newbie";
        if (status === "stopped") {
          initialPhase = "ended";
        } else if (status === "in-progress") {
          initialPhase = "newbie";
        }
        rec.set("phase", initialPhase);
        app.save(rec);
      }
    }
    if (records.length < limit) break;
    offset += limit;
  }
}, (app) => {
  const collection = app.findCollectionByNameOrId("gameStatus");
  if (!collection) return;
  if (collection.fields.getByName("phase")) {
    collection.fields.removeByName("phase");
  }
  app.save(collection);
});
