import { defineStore } from 'pinia'
import axios from 'axios'

export const usePokedexStore = defineStore('pokedex', {
    state: () => ({
        pokemonList: [] as any[],
        loading: false,
        selectedPokemon: null as any,
        kidMode: false,
        devMode: false,
        favorites: [] as number[],
        achievements: {
            seenCount: 0,
            battlesWon: 0,
            regionsCompleted: [],
        },
        settings: {
            soundEnabled: true,
            musicEnabled: false,
            theme: 'dark',
        }
    }),
    actions: {
        async fetchPokemon(limit = 151, offset = 0) {
            this.loading = true
            try {
                const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`)
                const results = response.data.results

                const detailedList = await Promise.all(
                    results.map(async (p: any) => {
                        const detailRes = await axios.get(p.url)
                        return detailRes.data
                    })
                )

                this.pokemonList = [...this.pokemonList, ...detailedList]
                this.achievements.seenCount = this.pokemonList.length
            } catch (error) {
                console.error('Error fetching pokemon:', error)
            } finally {
                this.loading = false
            }
        },
        toggleKidMode() {
            this.kidMode = !this.kidMode
        },
        toggleDevMode() {
            this.devMode = !this.devMode
        },
        incrementBattlesWon() {
            this.achievements.battlesWon++
        }
    }
})
