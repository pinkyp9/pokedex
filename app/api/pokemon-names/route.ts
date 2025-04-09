// app/api/pokemon-names/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchPokemonNames } from '@/lib/api-service';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query')?.toLowerCase() || '';

  try {
    const filteredNames = await searchPokemonNames(query);
    return NextResponse.json(filteredNames);
  } catch (error) {
    console.error('Error fetching Pokémon names:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Pokémon names' },
      { status: 500 }
    );
  }
}