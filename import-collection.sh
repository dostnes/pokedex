#!/bin/bash

# Pull latest changes
git pull

# Stop the services to prevent conflicts
echo "Stopping Pokedex services..."
sudo systemctl stop pokedex-frontend@$USER
sudo systemctl stop pokedex-server@$USER

# Import collection from collection-data
echo "Importing collection..."
node -e '
const fs = require("fs");
const { openDB } = require("idb");

async function importCollection() {
    const db = await openDB("pokemon-collection-db", 1);
    const collection = JSON.parse(
        fs.readFileSync("./collection-data/collection.json", "utf-8")
    );
    
    // Clear existing collection
    await db.clear("collection");
    
    // Import new collection
    for (const pokemon of collection) {
        await db.add("collection", pokemon);
    }
    console.log(`Imported ${collection.length} Pokémon`);
}

importCollection();
'

# Restart the services
echo "Restarting Pokedex services..."
sudo systemctl start pokedex-server@$USER
sudo systemctl start pokedex-frontend@$USER

echo "Collection imported successfully!" 