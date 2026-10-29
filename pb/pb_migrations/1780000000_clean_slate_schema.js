/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  // 1. game_status (singleton tracking round progression)
  const gameStatus = new Collection({
    name: "game_status",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: "round_number",
        type: "number",
        required: true,
        onlyInt: true,
      },
      {
        name: "phase",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["newbie", "pvp", "concluded"],
      },
      {
        name: "current_tick",
        type: "number",
        required: false,
        onlyInt: true,
      },
      {
        name: "max_ticks",
        type: "number",
        required: false,
        onlyInt: true,
      },
      {
        name: "tick_interval_seconds",
        type: "number",
        required: false,
        onlyInt: true,
      },
      {
        name: "is_paused",
        type: "bool",
        required: false,
      },
      {
        name: "phase_ends_at",
        type: "date",
        required: false,
      },
    ],
  });
  app.save(gameStatus);

  // 2. sectors (10x10 torus galaxy grid)
  const sectors = new Collection({
    name: "sectors",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: "sector_number",
        type: "number",
        required: false,
        onlyInt: true,
      },
      {
        name: "grid_x",
        type: "number",
        required: false,
        onlyInt: true,
      },
      {
        name: "grid_y",
        type: "number",
        required: false,
        onlyInt: true,
      },
      {
        name: "name",
        type: "text",
        required: false,
      },
      {
        name: "tax_rate",
        type: "number",
        required: false,
      },
      {
        name: "fund",
        type: "number",
        required: false,
      },
      {
        name: "state",
        type: "select",
        required: false,
        maxSelect: 1,
        values: ["normal", "peaceful", "expansionist", "offensive", "defensive", "mobilization"],
      },
      {
        name: "enhancements",
        type: "json",
        required: false,
      },
    ],
    indexes: [
      "CREATE UNIQUE INDEX `idx_sectors_sector_number` ON `sectors` (`sector_number`)",
      "CREATE INDEX `idx_sectors_grid` ON `sectors` (`grid_x`, `grid_y`)",
    ],
  });
  app.save(sectors);

  // 3. kingdoms (core player entity)
  const kingdoms = new Collection({
    name: "kingdoms",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: "user",
        type: "relation",
        collectionId: "_pb_users_auth_",
        cascadeDelete: false,
        maxSelect: 1,
        required: true,
      },
      {
        name: "name",
        type: "text",
        required: true,
      },
      {
        name: "planet_type",
        type: "select",
        required: true,
        maxSelect: 1,
        values: [
          "aquatic",
          "arid",
          "boreal",
          "desert",
          "glacial",
          "jungle",
          "terran",
          "volcanic",
        ],
      },
      {
        name: "sector",
        type: "relation",
        collectionId: sectors.id,
        cascadeDelete: false,
        maxSelect: 1,
        required: true,
      },
      {
        name: "sector_slot",
        type: "number",
        required: false,
        onlyInt: true,
      },
      {
        name: "state",
        type: "select",
        required: false,
        maxSelect: 1,
        values: ["normal", "trouble", "dead"],
      },
      {
        name: "trouble_until_tick",
        type: "number",
        required: false,
        onlyInt: true,
      },
      {
        name: "ma_protection",
        type: "number",
        required: false,
      },
      {
        name: "land",
        type: "number",
        required: true,
        onlyInt: true,
      },
      {
        name: "free_land",
        type: "number",
        required: false,
        onlyInt: true,
      },
      {
        name: "population",
        type: "number",
        required: false,
        onlyInt: true,
      },
      {
        name: "money",
        type: "number",
        required: false,
        onlyInt: true,
      },
      {
        name: "power",
        type: "number",
        required: false,
        onlyInt: true,
      },
      {
        name: "probes",
        type: "number",
        required: false,
        onlyInt: true,
      },
      {
        name: "probe_credits",
        type: "number",
        required: false,
        onlyInt: true,
      },
      {
        name: "networth",
        type: "number",
        required: false,
        onlyInt: true,
      },
      {
        name: "honor",
        type: "number",
        required: false,
        onlyInt: true,
      },
      {
        name: "newbie_step",
        type: "number",
        required: false,
        onlyInt: true,
      },
      {
        name: "is_newbie",
        type: "bool",
        required: false,
      },
      {
        name: "last_daily_reward_tick",
        type: "number",
        required: false,
        onlyInt: true,
      },
      {
        name: "daily_explored_land",
        type: "number",
        required: false,
        onlyInt: true,
      },
      {
        name: "daily_drafted_soldiers",
        type: "number",
        required: false,
        onlyInt: true,
      },
      {
        name: "shields",
        type: "json",
        required: false,
      },
      {
        name: "buildings",
        type: "json",
        required: false,
      },
      {
        name: "building_queue",
        type: "json",
        required: false,
      },
      {
        name: "land_queue",
        type: "json",
        required: false,
      },
      {
        name: "military",
        type: "json",
        required: false,
      },
      {
        name: "training_queue",
        type: "json",
        required: false,
      },
      {
        name: "research",
        type: "json",
        required: false,
      },
      {
        name: "auto_research_allocation",
        type: "json",
        required: false,
      },
    ],
    indexes: [
      "CREATE UNIQUE INDEX `idx_kingdoms_user` ON `kingdoms` (`user`)",
      "CREATE INDEX `idx_kingdoms_sector_slot` ON `kingdoms` (`sector`, `sector_slot`)",
      "CREATE INDEX `idx_kingdoms_networth` ON `kingdoms` (`networth`)",
    ],
  });
  app.save(kingdoms);

  // Link leader_id in sectors & vote_kingdom_id in kingdoms
  sectors.fields.addMarshaledJSON(JSON.stringify({
    name: "leader_id",
    type: "relation",
    collectionId: kingdoms.id,
    cascadeDelete: false,
    maxSelect: 1,
    required: false,
  }));
  app.save(sectors);

  kingdoms.fields.addMarshaledJSON(JSON.stringify({
    name: "vote_kingdom_id",
    type: "relation",
    collectionId: kingdoms.id,
    cascadeDelete: false,
    maxSelect: 1,
    required: false,
  }));
  app.save(kingdoms);

  // 4. military_deployments (cross-torus military attacks)
  const militaryDeployments = new Collection({
    name: "military_deployments",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: "attacker_id",
        type: "relation",
        collectionId: kingdoms.id,
        cascadeDelete: false,
        maxSelect: 1,
        required: true,
      },
      {
        name: "target_id",
        type: "relation",
        collectionId: kingdoms.id,
        cascadeDelete: false,
        maxSelect: 1,
        required: true,
      },
      {
        name: "general_index",
        type: "number",
        required: true,
        onlyInt: true,
      },
      {
        name: "units",
        type: "json",
        required: true,
      },
      {
        name: "war_shields_power",
        type: "number",
        required: false,
        onlyInt: true,
      },
      {
        name: "departure_tick",
        type: "number",
        required: false,
        onlyInt: true,
      },
      {
        name: "arrival_tick",
        type: "number",
        required: false,
        onlyInt: true,
      },
      {
        name: "return_waves",
        type: "json",
        required: true,
      },
      {
        name: "status",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["outbound", "returning", "completed"],
      },
      {
        name: "combat_report",
        type: "json",
        required: false,
      },
    ],
    indexes: [
      "CREATE INDEX `idx_deployments_attacker` ON `military_deployments` (`attacker_id`)",
      "CREATE INDEX `idx_deployments_target` ON `military_deployments` (`target_id`)",
      "CREATE INDEX `idx_deployments_status_arrival` ON `military_deployments` (`status`, `arrival_tick`)",
    ],
  });
  app.save(militaryDeployments);

  // 5. aid_packages (trouble status emergency transfers)
  const aidPackages = new Collection({
    name: "aid_packages",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: "sender_id",
        type: "relation",
        collectionId: kingdoms.id,
        cascadeDelete: false,
        maxSelect: 1,
        required: true,
      },
      {
        name: "recipient_id",
        type: "relation",
        collectionId: kingdoms.id,
        cascadeDelete: false,
        maxSelect: 1,
        required: true,
      },
      {
        name: "resources",
        type: "json",
        required: true,
      },
      {
        name: "aid_points",
        type: "number",
        required: false,
        onlyInt: true,
      },
      {
        name: "tick",
        type: "number",
        required: false,
        onlyInt: true,
      },
    ],
    indexes: [
      "CREATE INDEX `idx_aid_recipient` ON `aid_packages` (`recipient_id`)",
      "CREATE INDEX `idx_aid_sender` ON `aid_packages` (`sender_id`)",
    ],
  });
  app.save(aidPackages);

  // 6. game_news (events across kingdom, sector, universe)
  const gameNews = new Collection({
    name: "game_news",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: "scope",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["kingdom", "sector", "universe"],
      },
      {
        name: "kingdom_id",
        type: "relation",
        collectionId: kingdoms.id,
        cascadeDelete: false,
        maxSelect: 1,
        required: false,
      },
      {
        name: "sector_id",
        type: "relation",
        collectionId: sectors.id,
        cascadeDelete: false,
        maxSelect: 1,
        required: false,
      },
      {
        name: "event_type",
        type: "text",
        required: true,
      },
      {
        name: "headline",
        type: "text",
        required: true,
      },
      {
        name: "content",
        type: "text",
        required: false,
      },
      {
        name: "tick",
        type: "number",
        required: false,
        onlyInt: true,
      },
    ],
    indexes: [
      "CREATE INDEX `idx_news_scope_tick` ON `game_news` (`scope`, `tick`)",
      "CREATE INDEX `idx_news_kd` ON `game_news` (`kingdom_id`)",
      "CREATE INDEX `idx_news_sector` ON `game_news` (`sector_id`)",
    ],
  });
  app.save(gameNews);

  // 7. Seed 100 Sectors (10x10 Torus)
  for (let i = 0; i < 100; i++) {
    const sec = new Record(sectors, {
      sector_number: i,
      grid_x: i % 10,
      grid_y: Math.floor(i / 10),
      name: `Sector ${i}`,
      tax_rate: 0,
      fund: 0,
      state: "normal",
      enhancements: [],
    });
    app.save(sec);
  }

  // 8. Seed Initial game_status Record
  const status = new Record(gameStatus, {
    round_number: 1,
    phase: "newbie",
    current_tick: 0,
    max_ticks: 960,
    tick_interval_seconds: 3600,
    is_paused: false,
  });
  app.save(status);
}, (app) => {
  const collections = ["game_news", "aid_packages", "military_deployments", "kingdoms", "sectors", "game_status"];
  for (const name of collections) {
    const col = app.findCollectionByNameOrId(name);
    if (col) {
      app.delete(col);
    }
  }
});
