// components/PokemonSearch.tsx
'use client'

import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface PokemonSearchProps {
  onSearch: (pokemonName: string) => void;
  isLoading: boolean;
}

export function PokemonSearch({ onSearch, isLoading }: PokemonSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLUListElement>(null)
  const lastFetchRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm.trim()) {
        setSuggestions([])
        setIsOpen(false)
        return
      }

      try {
        setIsFetchingSuggestions(true)
        const response = await fetch(`/api/pokemon-names?query=${encodeURIComponent(searchTerm)}`)
        if (response.ok) {
          const data = await response.json()
          setSuggestions(data)
          setIsOpen(data.length > 0)
          setHighlightedIndex(-1) // Reset highlight when suggestions change
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error)
      } finally {
        setIsFetchingSuggestions(false)
      }
    }

    // Clear any existing timeout to implement debouncing
    if (lastFetchRef.current) {
      clearTimeout(lastFetchRef.current)
    }

    // Set a new timeout to fetch suggestions after a delay
    lastFetchRef.current = setTimeout(fetchSuggestions, 300)

    // Cleanup function to clear the timeout if the component unmounts or searchTerm changes again
    return () => {
      if (lastFetchRef.current) {
        clearTimeout(lastFetchRef.current)
      }
    }
  }, [searchTerm])

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current && 
        !searchInputRef.current.contains(event.target as Node) &&
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      onSearch(searchTerm.toLowerCase().trim())
      setIsOpen(false)
    }
  }

  const handleSuggestionSelect = (pokemonName: string) => {
    setSearchTerm(pokemonName)
    onSearch(pokemonName)
    setIsOpen(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    // Arrow down
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prevIndex) => 
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
      );
    }
    // Arrow up
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prevIndex) => 
        prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
      );
    }
    // Enter key
    else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSuggestionSelect(suggestions[highlightedIndex]);
    }
    // Escape key
    else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Scroll the highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && suggestionsRef.current) {
      const highlightedElement = suggestionsRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex]);

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2 relative">
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder="Search Pokémon by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
          disabled={isLoading}
          ref={searchInputRef}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        />
        
        {isOpen && suggestions.length > 0 && (
          <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-md mt-1 border border-gray-200 z-10">
            <ul 
              ref={suggestionsRef}
              className="max-h-60 overflow-auto py-1"
            >
              {suggestions.map((name, index) => (
                <li 
                  key={name} 
                  className={`px-4 py-2 cursor-pointer capitalize ${
                    index === highlightedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSuggestionSelect(name)}
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <Button type="submit" disabled={isLoading || !searchTerm.trim()}>
        {isLoading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
        ) : (
          <Search className="h-4 w-4" />
        )}
        <span className="ml-2 sm:inline hidden">Search</span>
      </Button>
    </form>
  )
}