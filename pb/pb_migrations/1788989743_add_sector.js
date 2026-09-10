/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = app.findCollectionByNameOrId("kingdoms");
  if (!collection) return;

  if (!collection.fields.getByName("sector")) {
    collection.fields.addMarshaledJSON(JSON.stringify({
      name: "sector",
      type: "number",
      onlyInt: true,
      required: false,
    }));
  }

  app.save(collection);

  // No data backfill needed: PocketBase normalizes unset number fields to 0,
  // which is exactly the default for this column.
}, (app) => {
  const collection = app.findCollectionByNameOrId("kingdoms");
  if (!collection) return;
  if (collection.fields.getByName("sector")) {
    collection.fields.removeByName("sector");
  }
  app.save(collection);
});
