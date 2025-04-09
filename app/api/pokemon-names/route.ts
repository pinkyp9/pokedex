// app/api/pokemon-names/route.ts
import { NextRequest, NextResponse } from 'next/server';

// In-memory cache for the list of Pokémon names
let pokemonNamesCache: string[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query')?.toLowerCase() || '';

  try {
    // Check if we need to fetch or can use the cache
    if (!pokemonNamesCache || Date.now() - cacheTimestamp > CACHE_TTL) {
      // Fetch all Pokémon names (limited to first 1000 for performance)
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Pokémon names: ${response.statusText}`);
      }
      
      const data = await response.json();
      pokemonNamesCache = data.results.map((pokemon: { name: string }) => pokemon.name);
      cacheTimestamp = Date.now();
    }

    // Filter the names based on the query
    const filteredNames = query
      ? (pokemonNamesCache?.filter(name => name.includes(query)) || [])
      : [];

    // Return top 10 matches
    return NextResponse.json(filteredNames.slice(0, 10));
  } catch (error) {
    console.error('Error fetching Pokémon names:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Pokémon names' }, 
      { status: 500 }
    );
  }
}