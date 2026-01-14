<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Map as MapIcon, Compass, MapPin, X, Info } from 'lucide-vue-next'
import { gsap } from 'gsap'
import { usePokedexStore } from '../stores/pokedex'
import { playSound } from '../utils/fx'

const emit = defineEmits(['close'])
const store = usePokedexStore()
const selectedRegion = ref<string | null>(null)

const regions = [
  { id: 'pallet', name: 'Pallet Town', x: 200, y: 400, type: 'Home', pokemon: ['Bulbasaur', 'Squirtle', 'Charmander'] },
  { id: 'viridian', name: 'Viridian Forest', x: 220, y: 300, type: 'Wild', pokemon: ['Pikachu', 'Caterpie', 'Weedle'] },
  { id: 'pewter', name: 'Pewter City', x: 180, y: 150, type: 'Gym', pokemon: ['Geodude', 'Onix'] },
  { id: 'cerulean', name: 'Cerulean Cave', x: 500, y: 100, type: 'Wild', pokemon: ['Mewtwo', 'Golduck', 'Slowbro'] },
  { id: 'lavender', name: 'Lavender Town', x: 650, y: 250, type: 'Town', pokemon: ['Gastly', 'Haunter', 'Cubone'] },
  { id: 'fuchsia', name: 'Safari Zone', x: 450, y: 450, type: 'Area', pokemon: ['Scyther', 'Pinsir', 'Kangaskhan'] },
]

onMounted(() => {
  gsap.from('.map-svg', { scale: 0.8, opacity: 0, duration: 1, ease: 'power3.out' })
  gsap.from('.region-pin', { opacity: 0, y: -20, stagger: 0.1, duration: 0.5, delay: 0.5 })
})

const selectRegion = (region: any) => {
  selectedRegion.value = region.name
  playSound('click')
  gsap.from('.region-info', { x: 20, opacity: 0, duration: 0.3 })
}
</script>

<template>
  <div class="fixed inset-0 z-[150] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/90 backdrop-blur-xl" @click="emit('close')"></div>
    
    <div class="relative w-full max-w-6xl aspect-video bg-[#0f172a] rounded-[3rem] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(0,168,255,0.2)]">
      <!-- Left: Interactive Map -->
      <div class="absolute inset-0 grid grid-cols-1 lg:grid-cols-4">
        <div class="lg:col-span-3 relative h-full bg-[#1e293b] overflow-hidden pokedex-texture">
          <!-- Stylized Kanto Continent -->
          <svg viewBox="0 0 800 600" class="map-svg w-full h-full opacity-40">
            <path d="M100,100 Q400,50 700,100 T700,500 Q400,550 100,500 Z" fill="#2d3748" stroke="#4a5568" stroke-width="4" />
            <path d="M150,200 Q300,150 450,200 T650,400" fill="none" stroke="#2b6cb0" stroke-width="8" stroke-dasharray="10" class="opacity-30" />
          </svg>

          <!-- Floating Pins -->
          <button 
            v-for="region in regions" 
            :key="region.id"
            @click="selectRegion(region)"
            class="region-pin absolute group"
            :style="{ left: region.x + 'px', top: region.y + 'px' }"
          >
            <div class="relative flex items-center justify-center">
              <div class="absolute w-12 h-12 bg-pokedex-blue/20 rounded-full animate-ping"></div>
              <MapPin class="w-8 h-8 text-pokedex-blue group-hover:scale-125 group-hover:text-white transition-all drop-shadow-lg" />
              <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {{ region.name }}
              </div>
            </div>
          </button>

          <!-- Map Header -->
          <div class="absolute top-8 left-8">
            <h2 class="text-3xl font-black italic tracking-tighter text-white flex items-center gap-3">
              <Compass class="w-8 h-8 text-pokedex-blue animate-spin-slow" />
              KANTO REGION MAP
            </h2>
          </div>
        </div>

        <!-- Right: Region Info Sidebar -->
        <div class="h-full bg-slate-900/80 border-l border-white/10 p-8 flex flex-col">
          <div class="flex justify-between items-center mb-8">
            <div class="flex items-center gap-2 text-pokedex-blue">
              <Info class="w-4 h-4" />
              <span class="text-[10px] font-black uppercase tracking-widest">Region Data</span>
            </div>
            <button @click="emit('close')" class="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-500">
              <X class="w-6 h-6" />
            </button>
          </div>

          <div v-if="selectedRegion" class="region-info space-y-8">
            <div>
              <h3 class="text-4xl font-black text-white uppercase">{{ selectedRegion }}</h3>
              <p class="text-slate-400 text-sm mt-2">NATIVE POKÉMON ENCOUNTERED</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div v-for="p in regions.find(r => r.name === selectedRegion)?.pokemon" :key="p" class="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center group hover:bg-white/10 transition-colors">
                <div class="w-12 h-12 rounded-full bg-pokedex-blue/10 flex items-center justify-center mb-2">
                  <Sparkles class="w-4 h-4 text-pokedex-blue group-hover:scale-110 transition-transform" />
                </div>
                <span class="text-[10px] font-bold text-white/60 tracking-widest uppercase">{{ p }}</span>
              </div>
            </div>

            <button class="w-full py-4 bg-pokedex-blue text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-transform uppercase tracking-widest text-xs">
              Travel to Region
            </button>
          </div>

          <div v-else class="flex-1 flex flex-col items-center justify-center text-center">
            <MapIcon class="w-12 h-12 text-slate-700 mb-4" />
            <p class="text-slate-500 font-bold text-xs uppercase tracking-widest">Select a pin on the map to explore</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-slow {
  animation: spin-slow 10s linear infinite;
}
</style>
