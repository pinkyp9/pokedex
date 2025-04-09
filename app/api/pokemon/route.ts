// app/api/pokemon/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPokemonByName } from '@/lib/api-service';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get('name')?.toLowerCase();

  if (!name) {
    return NextResponse.json(
      { error: 'Pokémon name is required' },
      { status: 400 }
    );
  }

  try {
    const pokemonData = await getPokemonByName(name);
    return NextResponse.json(pokemonData);
  } catch (error) {
    console.error(`Error fetching Pokémon ${name}:`, error);
    
    // Check if it's a 404 error (Pokémon not found)
    if (error instanceof Error && error.message.includes('404')) {
      return NextResponse.json(
        { error: `Pokémon "${name}" not found` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch Pokémon data' },
      { status: 500 }
    );
  }
}