// components/PokemonCard.tsx
import Image from 'next/image'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PokemonStat {
  name: string;
  value: number;
}

interface PokemonMove {
  name: string;
  type?: string;
  learnMethod: string;
}

interface PokemonCardProps {
  name: string;
  id: number;
  image: string;
  types: string[];
  height: number;
  weight: number;
  abilities: string[];
  stats: PokemonStat[];
  moves: PokemonMove[];
}

export function PokemonCard({
  name,
  id,
  image,
  types,
  height,
  weight,
  abilities,
  stats,
  moves
}: PokemonCardProps) {
  const [moveFilter, setMoveFilter] = useState<string>("all");
  
  // Get color based on Pokémon type
  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      normal: 'bg-gray-400',
      fire: 'bg-orange-500',
      water: 'bg-blue-500',
      electric: 'bg-yellow-400',
      grass: 'bg-green-500',
      ice: 'bg-blue-300',
      fighting: 'bg-red-700',
      poison: 'bg-purple-500',
      ground: 'bg-yellow-600',
      flying: 'bg-indigo-300',
      psychic: 'bg-pink-500',
      bug: 'bg-lime-500',
      rock: 'bg-yellow-800',
      ghost: 'bg-purple-700',
      dragon: 'bg-indigo-700',
      dark: 'bg-gray-800',
      steel: 'bg-gray-500',
      fairy: 'bg-pink-300',
    }
    
    return typeColors[type] || 'bg-gray-400';
  }

  // Filter moves based on selected filter
  const filteredMoves = moveFilter === "all" 
    ? moves 
    : moves.filter(move => move.learnMethod === moveFilter);

  // Get unique learn methods for filters
  const learnMethods = ["all", ...Array.from(new Set(moves.map(move => move.learnMethod)))];

  return (
    <Card className="w-full max-w-3xl overflow-hidden">
      <CardHeader className="bg-red-500 text-white">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="capitalize text-2xl">{name}</CardTitle>
            <CardDescription className="text-white/70">#{id.toString().padStart(3, '0')}</CardDescription>
          </div>
          <div className="flex gap-2">
            {types.map((type, index) => (
              <Badge key={index} className={`${getTypeColor(type)} text-white capitalize`}>
                {type}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="info">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="moves">Moves</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-48 h-48 bg-gray-100 rounded-full mb-4 flex items-center justify-center overflow-hidden">
                  {image ? (
                    <Image 
                      src={image} 
                      alt={name} 
                      width={180} 
                      height={180}
                      className="object-contain"
                      priority
                    />
                  ) : (
                    <div className="text-gray-400">No image</div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">Height</p>
                    <p className="font-bold">{(height / 10).toFixed(1)}m</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">Weight</p>
                    <p className="font-bold">{(weight / 10).toFixed(1)}kg</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="font-bold text-lg mb-2">Abilities</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {abilities.map((ability, index) => (
                    <Badge key={index} variant="outline" className="capitalize">
                      {ability}
                    </Badge>
                  ))}
                </div>

                <h3 className="font-bold text-lg mb-2">Base Stats</h3>
                <div className="space-y-3">
                  {stats.map((stat, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium capitalize">{stat.name}</span>
                        <span className="text-sm font-medium">{stat.value}</span>
                      </div>
                      <Progress value={Math.min(100, (stat.value / 255) * 100)} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="moves" className="mt-0">
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <span className="text-sm font-medium mt-1">Filter by:</span>
                {learnMethods.map((method) => (
                  <Badge 
                    key={method}
                    variant={moveFilter === method ? "default" : "outline"}
                    className="capitalize cursor-pointer"
                    onClick={() => setMoveFilter(method)}
                  >
                    {method === "all" ? "All" : method.replace("-", " ")}
                  </Badge>
                ))}
              </div>
              
              <ScrollArea className="h-80 rounded-md border p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {filteredMoves.length > 0 ? (
                    filteredMoves.map((move, index) => (
                      <div key={index} className="border rounded-md p-2">
                        <div className="font-medium capitalize">{move.name.replace('-', ' ')}</div>
                        {move.type && (
                          <Badge className={`${getTypeColor(move.type)} text-white capitalize text-xs`}>
                            {move.type}
                          </Badge>
                        )}
                        <div className="text-xs text-gray-500 capitalize mt-1">
                          {move.learnMethod.replace('-', ' ')}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-10 text-gray-500">
                      No moves found with the selected filter
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}