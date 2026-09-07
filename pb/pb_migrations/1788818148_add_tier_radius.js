/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = app.findCollectionByNameOrId("kingdoms");
  if (!collection) return;

  if (!collection.fields.getByName("tier")) {
    collection.fields.addMarshaledJSON(JSON.stringify({
      name: "tier",
      type: "number",
      onlyInt: true,
      required: false,
    }));
  }

  if (!collection.fields.getByName("radius")) {
    collection.fields.addMarshaledJSON(JSON.stringify({
      name: "radius",
      type: "number",
      onlyInt: true,
      min: 0,
      max: 359,
      required: false,
    }));
  }

  app.save(collection);

  // Backfill existing kingdoms: tier defaults to 10, radius gets a random 0-359.
  const limit = 500;
  let offset = 0;
  for (;;) {
    const records = app.findRecordsByFilter("kingdoms", "", "", limit, offset);
    if (!records || records.length === 0) break;
    for (const rec of records) {
      if (!rec) continue;
      let changed = false;
      // Note: PocketBase normalizes unset number fields to 0, so 0 also
      // means "never assigned" for these brand-new columns.
      if (rec.get("tier") == null || rec.getInt("tier") === 0) {
        rec.set("tier", 10);
        changed = true;
      }
      if (rec.get("radius") == null || rec.getInt("radius") === 0) {
        rec.set("radius", Math.floor(Math.random() * 360));
        changed = true;
      }
      if (changed) app.save(rec);
    }
    if (records.length < limit) break;
    offset += limit;
  }
}, (app) => {
  const collection = app.findCollectionByNameOrId("kingdoms");
  if (!collection) return;
  if (collection.fields.getByName("tier")) {
    collection.fields.removeByName("tier");
  }
  if (collection.fields.getByName("radius")) {
    collection.fields.removeByName("radius");
  }
  app.save(collection);
});
