/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = app.findCollectionByNameOrId("kingdoms");
  if (!collection) return;

  const moneyField = collection.fields.getByName("money");
  if (moneyField) {
    moneyField.required = false;
  }

  const powerField = collection.fields.getByName("power");
  if (powerField) {
    powerField.required = false;
  }

  app.save(collection);
}, () => {});
