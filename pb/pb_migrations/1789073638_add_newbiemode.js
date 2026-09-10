/// <reference path="../pb_data/types.d.ts" />

// Adds the newbie-mode self-tick budget to kingdoms.
// New realms start with 96 ticks of protection; each self-tick action
// advances the owner's kingdom by 8 ticks and deducts 8 from this budget.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("kingdoms");
  if (!collection) return;

  if (!collection.fields.getByName("newbiemode")) {
    collection.fields.addMarshaledJSON(JSON.stringify({
      name: "newbiemode",
      type: "number",
      onlyInt: true,
      required: false,
    }));
  }

  app.save(collection);

  // Backfill pre-existing kingdoms to the default budget. The column is new,
  // so any null/0 value means "never assigned" (0 is unreachable through
  // normal play: 96 is divisible by the 8-tick step and actions stop at <8).
  const limit = 500;
  let offset = 0;
  for (;;) {
    const records = app.findRecordsByFilter("kingdoms", "", "", limit, offset);
    if (!records || records.length === 0) break;
    for (const rec of records) {
      if (!rec) continue;
      if (rec.get("newbiemode") == null || rec.getInt("newbiemode") === 0) {
        rec.set("newbiemode", 96);
        app.save(rec);
      }
    }
    if (records.length < limit) break;
    offset += limit;
  }
}, (app) => {
  const collection = app.findCollectionByNameOrId("kingdoms");
  if (!collection) return;
  if (collection.fields.getByName("newbiemode")) {
    collection.fields.removeByName("newbiemode");
  }
  app.save(collection);
});
