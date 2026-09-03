#!/bin/bash
set -e
mkdir -p src/types
npx pocketbase-typegen --db ./pb/pb_data/data.db --out src/types/pb.model.ts
echo "✓ Types written to src/types/pb.model.ts"
