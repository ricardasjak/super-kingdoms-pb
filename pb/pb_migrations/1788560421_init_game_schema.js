/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    // ── 1. Kingdoms Collection ───────────────────────────────────────────────
    const kingdoms = new Collection({
      name: "kingdoms",
      type: "base",
      listRule: "@request.auth.id != '' && @request.auth.id = userId",
      viewRule: "@request.auth.id != '' && @request.auth.id = userId",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: "userId",
          type: "relation",
          collectionId: "_pb_users_auth_",
          cascadeDelete: false,
          maxSelect: 1,
          required: false,
        },
        {
          name: "kdName",
          type: "text",
          required: true,
        },
        {
          name: "rulerName",
          type: "text",
          required: true,
        },
        {
          name: "planetType",
          type: "text",
          required: true,
        },
        {
          name: "raceType",
          type: "text",
          required: true,
        },
        {
          name: "population",
          type: "number",
          required: true,
        },
        {
          name: "popChange",
          type: "number",
          required: false,
        },
        {
          name: "land",
          type: "number",
          required: true,
        },
        {
          name: "money",
          type: "number",
          required: false,
        },
        {
          name: "power",
          type: "number",
          required: false,
        },
        {
          name: "probes",
          type: "number",
          required: false,
        },
        {
          name: "moneyIncome",
          type: "number",
          required: false,
        },
        {
          name: "powerIncome",
          type: "number",
          required: false,
        },
        {
          name: "nw",
          type: "number",
          required: true,
        },
        {
          name: "autoExplore",
          type: "number",
          required: false,
        },
        {
          name: "autoBuild",
          type: "bool",
          required: false,
        },
        {
          name: "landQueue",
          type: "json",
          required: false,
        },
        {
          name: "military",
          type: "json",
          required: false,
        },
        {
          name: "buildings",
          type: "json",
          required: false,
        },
        {
          name: "researchPts",
          type: "number",
          required: false,
        },
        {
          name: "research",
          type: "json",
          required: false,
        },
        {
          name: "researchAutoAssign",
          type: "json",
          required: false,
        },
        {
          name: "state",
          type: "text",
          required: false,
        },
        {
          name: "botOwnerKd",
          type: "text",
          required: false,
        },
        {
          name: "botSettings",
          type: "json",
          required: false,
        },
      ],
      indexes: [
        "CREATE INDEX `idx_kingdoms_userId` ON `kingdoms` (`userId`)",
        "CREATE INDEX `idx_kingdoms_botOwnerKd` ON `kingdoms` (`botOwnerKd`)",
        "CREATE INDEX `idx_kingdoms_land_nw` ON `kingdoms` (`land`, `nw`)",
      ],
    });
    app.save(kingdoms);

    // ── 2. Spy Reports Collection ───────────────────────────────────────────
    const spyReports = new Collection({
      name: "spyReports",
      type: "base",
      listRule: "@request.auth.id != '' && @request.auth.id = userId",
      viewRule: "@request.auth.id != '' && @request.auth.id = userId",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: "userId",
          type: "relation",
          collectionId: "_pb_users_auth_",
          cascadeDelete: false,
          maxSelect: 1,
          required: true,
        },
        {
          name: "targetKdName",
          type: "text",
          required: true,
        },
        {
          name: "targetRulerName",
          type: "text",
          required: true,
        },
        {
          name: "targetPlanetType",
          type: "text",
          required: true,
        },
        {
          name: "targetRaceType",
          type: "text",
          required: true,
        },
        {
          name: "targetLevel",
          type: "number",
          required: true,
        },
        {
          name: "land",
          type: "number",
          required: true,
        },
        {
          name: "networth",
          type: "number",
          required: true,
        },
        {
          name: "honor",
          type: "number",
          required: false,
        },
        {
          name: "money",
          type: "number",
          required: true,
        },
        {
          name: "population",
          type: "number",
          required: true,
        },
        {
          name: "power",
          type: "number",
          required: true,
        },
        {
          name: "probes",
          type: "number",
          required: false,
        },
        {
          name: "scientists",
          type: "number",
          required: false,
        },
        {
          name: "maProtection",
          type: "number",
          required: false,
        },
        {
          name: "military",
          type: "json",
          required: false,
        },
        {
          name: "maxDefPotential",
          type: "number",
          required: false,
        },
        {
          name: "maxOffPotential",
          type: "number",
          required: false,
        },
        {
          name: "buildings",
          type: "json",
          required: false,
        },
        {
          name: "spiedAt",
          type: "number",
          required: true,
        },
      ],
      indexes: [
        "CREATE INDEX `idx_spyReports_userId` ON `spyReports` (`userId`)",
      ],
    });
    app.save(spyReports);

    // ── 3. Game Status Collection ───────────────────────────────────────────
    const gameStatus = new Collection({
      name: "gameStatus",
      type: "base",
      listRule: "",
      viewRule: "",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: "currentTick",
          type: "number",
          required: false,
        },
        {
          name: "endTick",
          type: "number",
          required: true,
        },
        {
          name: "roundNumber",
          type: "number",
          required: true,
        },
        {
          name: "kingdomCount",
          type: "number",
          required: false,
        },
      ],
    });
    app.save(gameStatus);
  },
  (app) => {
    const gameStatus = app.findCollectionByNameOrId("gameStatus");
    if (gameStatus) {
      app.delete(gameStatus);
    }
    const spyReports = app.findCollectionByNameOrId("spyReports");
    if (spyReports) {
      app.delete(spyReports);
    }
    const kingdoms = app.findCollectionByNameOrId("kingdoms");
    if (kingdoms) {
      app.delete(kingdoms);
    }
  }
);
