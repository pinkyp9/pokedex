// lib/api-service.ts
import { pokemonDataCache, pokemonNamesCache } from './cache';

const BASE_URL = 'https://pokeapi.co/api/v2';

// Creating a deduping system for in-flight requests
const pendingRequests: Record<string, Promise<any>> = {};

/**
 * Fetches data with deduping to prevent duplicate in-flight requests
 */
async function dedupedFetch<T>(url: string): Promise<T> {
  // If there's already a pending request for this URL, return that promise
  if (pendingRequests[url] !== undefined) {
    return pendingRequests[url];
  }
  
  // Create a new request promise and store it
  const requestPromise = fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .finally(() => {
      // Clean up the pending request after it completes (success or error)
      delete pendingRequests[url];
    });
  
  pendingRequests[url] = requestPromise;
  return requestPromise;
}

/**
 * Get detailed information about a specific Pokémon
 */
export async function getPokemonByName(name: string) {
  const cacheKey = `pokemon:${name.toLowerCase()}`;
  
  // Check cache first
  const cachedData = pokemonDataCache.get(cacheKey);
  if (cachedData) {
    console.log(`Cache hit for Pokémon: ${name}`);
    return cachedData;
  }
  
  console.log(`Cache miss for Pokémon: ${name}, fetching from API`);
  
  // If not in cache, fetch from API with deduping
  const url = `${BASE_URL}/pokemon/${name.toLowerCase()}`;
  const data = await dedupedFetch(url);
  
  // Store in cache
  pokemonDataCache.set(cacheKey, data);
  
  return data;
}

/**
 * Get all Pokémon names for search suggestions
 */
export async function getAllPokemonNames() {
  const cacheKey = 'all-pokemon-names';
  
  // Check cache first
  let allNames = pokemonNamesCache.get<string[]>(cacheKey);
  if (allNames) {
    return allNames;
  }
  
  // If not in cache, fetch from API with deduping
  const url = `${BASE_URL}/pokemon?limit=1000`;
  const data = await dedupedFetch(url);
  
  const typedData = data as { results: { name: string }[] };
  allNames = typedData.results.map((pokemon: { name: string }) => pokemon.name);
  
  // Store in cache
  pokemonNamesCache.set(cacheKey, allNames);
  
  return allNames;
}

/**
 * Filter Pokémon names based on search query
 */
export async function searchPokemonNames(query: string) {
  const allNames = await getAllPokemonNames();
  
  if (!query) {
    return [];
  }
  
  const filteredNames = allNames.filter(name => 
    name.toLowerCase().includes(query.toLowerCase())
  );
  
  return filteredNames.slice(0, 10); // Return top 10 results
}

/**
 * Get move type information
 */
export async function getMoveType(moveUrl: string) {
  const cacheKey = `move:${moveUrl}`;
  
  // Check cache first
  const cachedData = pokemonDataCache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  // If not in cache, fetch from API with deduping
  const data = await dedupedFetch(moveUrl);
  
  // Store in cache
  pokemonDataCache.set(cacheKey, data);
  
  return data;
}