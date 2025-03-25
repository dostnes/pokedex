#!/bin/bash

# Create collection-data directory if it doesn't exist
mkdir -p collection-data

# Export current collection to collection-data
echo "Exporting current collection..."
node -e '
const fs = require("fs");
const { openDB } = require("idb");

async function exportCollection() {
    const db = await openDB("pokemon-collection-db", 1);
    const collection = await db.getAll("collection");
    fs.writeFileSync(
        "./collection-data/collection.json",
        JSON.stringify(collection, null, 2)
    );
    console.log(`Exported ${collection.length} Pokémon`);
}

exportCollection();
'

# Add and commit changes
git add collection-data/collection.json
git commit -m "Update collection data: $(date +%Y-%m-%d)"
git push

echo "Collection synchronized successfully!" 