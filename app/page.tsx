// app/page.tsx
'use client'

import { useState } from 'react'
import { PokemonSearch } from '@/components/PokemonSearch'
import { PokemonCard } from '@/components/PokemonCard'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getMoveType } from '@/lib/api-service'

interface PokemonData {
  id: number;
  name: string;
  sprites: {
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  types: Array<{
    type: {
      name: string;
    };
  }>;
  height: number;
  weight: number;
  abilities: Array<{
    ability: {
      name: string;
    };
    is_hidden: boolean;
  }>;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
  moves: Array<{
    move: {
      name: string;
      url: string;
    };
    version_group_details: Array<{
      level_learned_at: number;
      move_learn_method: {
        name: string;
      };
      version_group: {
        name: string;
      };
    }>;
  }>;
}

export default function Home() {
  const [pokemon, setPokemon] = useState<PokemonData | null>(null)
  const [moveTypes, setMoveTypes] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchPokemon = async (pokemonName: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/pokemon?name=${encodeURIComponent(pokemonName)}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Pokémon "${pokemonName}" not found. Please check the spelling or try another Pokémon.`)
        } else {
          throw new Error(`Failed to fetch data for "${pokemonName}". Please try again later.`)
        }
      }
      
      const data: PokemonData = await response.json()
      setPokemon(data)
      
      // Load move types (for the first 20 moves to avoid too many requests)
      const moveTypesMap: Record<string, string> = {}
      const movePromises = data.moves.slice(0, 20).map(async moveData => {
        try {
          // Use our service with caching and deduping
          const moveInfo = await getMoveType(moveData.move.url) as { type: { name: string } }
          moveTypesMap[moveData.move.name] = moveInfo.type.name
        } catch (error) {
          console.error(`Error fetching move type for ${moveData.move.name}:`, error)
        }
      })
      
      await Promise.all(movePromises)
      setMoveTypes(moveTypesMap)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Pokémon')
      setPokemon(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Process moves data to get the most recent version's moves
  const processedMoves = pokemon ? pokemon.moves.map(moveData => {
    // Get the latest version detail (assumes the API returns these in chronological order)
    const latestVersion = moveData.version_group_details[moveData.version_group_details.length - 1]
    
    return {
      name: moveData.move.name,
      type: moveTypes[moveData.move.name], // Type may be undefined if we haven't loaded it yet
      learnMethod: latestVersion.move_learn_method.name
    }
  }) : []

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-bold text-red-500 mb-2">Pokédex</h1>
          <p className="text-gray-500 mb-6">Search for any Pokémon by name</p>
          
          <PokemonSearch onSearch={searchPokemon} isLoading={isLoading} />
          
          {error && (
            <Alert variant="destructive" className="mt-4 w-full max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {pokemon && (
          <div className="flex justify-center">
            <PokemonCard
              name={pokemon.name}
              id={pokemon.id}
              image={pokemon.sprites.other['official-artwork'].front_default}
              types={pokemon.types.map(t => t.type.name)}
              height={pokemon.height}
              weight={pokemon.weight}
              abilities={pokemon.abilities.map(a => a.ability.name)}
              stats={pokemon.stats.map(s => ({
                name: s.stat.name,
                value: s.base_stat
              }))}
              moves={processedMoves}
            />
          </div>
        )}
      </div>
    </main>
  )
}