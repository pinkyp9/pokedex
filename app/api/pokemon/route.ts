// app/api/pokemon/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory cache
type CacheEntry = {
  data: any;
  timestamp: number;
}

const CACHE: Record<string, CacheEntry> = {};
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_CACHE_SIZE = 100;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const pokemonName = searchParams.get('name')?.toLowerCase();

  if (!pokemonName) {
    return NextResponse.json({ error: 'Pokemon name is required' }, { status: 400 });
  }

  // Check if we have a valid cached entry
  const cachedEntry = CACHE[pokemonName];
  if (cachedEntry && (Date.now() - cachedEntry.timestamp) < CACHE_TTL) {
    return NextResponse.json(cachedEntry.data);
  }

  try {
    // Fetch from PokeAPI
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    
    if (!response.ok) {
      // Return a more specific error for 404
      if (response.status === 404) {
        return NextResponse.json(
          { error: `Pokémon "${pokemonName}" not found` }, 
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to fetch Pokémon: ${response.statusText}` }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Manage cache size - remove oldest entry if cache is full
    const cacheEntries = Object.entries(CACHE);
    if (cacheEntries.length >= MAX_CACHE_SIZE) {
      const oldestEntry = cacheEntries.reduce((oldest, current) => {
        return oldest[1].timestamp < current[1].timestamp ? oldest : current;
      });
      delete CACHE[oldestEntry[0]];
    }
    
    // Cache the result
    CACHE[pokemonName] = {
      data,
      timestamp: Date.now()
    };
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Pokémon:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Pokémon data' }, 
      { status: 500 }
    );
  }
}