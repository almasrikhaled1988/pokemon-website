<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Map as MapIcon, Compass, MapPin, X, Info, Sparkles, Target, Zap, Waves, TreePine } from 'lucide-vue-next'
import { gsap } from 'gsap'
import { playSound } from '../utils/fx'

const emit = defineEmits(['close', 'select-pokemon'])
const selectedRegion = ref<any>(null)
const mouseX = ref(0)
const mouseY = ref(0)

const selectPokemon = (name: string) => {
  playSound('click')
  emit('select-pokemon', name)
}

const handleTravel = () => {
  playSound('pokedexOpen')
  gsap.to('.relative.w-full.max-w-6xl', {
    scale: 2,
    opacity: 0,
    duration: 0.8,
    ease: 'expo.in',
    onComplete: () => emit('close')
  })
}

const regions = [
  { id: 'pallet', name: 'Pallet Town', x: 25, y: 75, type: 'Home', icon: MapPin, pokemon: ['Bulbasaur', 'Squirtle', 'Charmander'] },
  { id: 'viridian', name: 'Viridian Forest', x: 25, y: 55, type: 'Wild', icon: TreePine, pokemon: ['Pikachu', 'Caterpie', 'Weedle'] },
  { id: 'pewter', name: 'Pewter City', x: 25, y: 35, type: 'Gym', icon: Target, pokemon: ['Geodude', 'Onix'] },
  { id: 'cerulean', name: 'Cerulean Cave', x: 65, y: 25, type: 'Wild', icon: Zap, pokemon: ['Mewtwo', 'Golduck', 'Slowbro'] },
  { id: 'lavender', name: 'Lavender Town', x: 85, y: 45, type: 'Town', icon: MapIcon, pokemon: ['Gastly', 'Haunter', 'Cubone'] },
  { id: 'fuchsia', name: 'Safari Zone', x: 65, y: 85, type: 'Area', icon: Waves, pokemon: ['Scyther', 'Pinsir', 'Kangaskhan'] },
]

const handleMouseMove = (e: MouseEvent) => {
  const { clientX, clientY } = e
  const { innerWidth, innerHeight } = window
  mouseX.value = (clientX / innerWidth - 0.5) * 20
  mouseY.value = (clientY / innerHeight - 0.5) * 20
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  gsap.from('.map-container', { scale: 1.1, opacity: 0, duration: 1.2, ease: 'expo.out' })
  gsap.from('.region-pin', { opacity: 0, scale: 0, stagger: 0.1, duration: 0.6, delay: 0.5, ease: 'back.out(1.7)' })
  
  // Scanner animation
  gsap.to('.scanner-line', {
    top: '100%',
    duration: 3,
    repeat: -1,
    ease: 'none'
  })
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})

const selectRegion = (region: any) => {
  selectedRegion.value = region
  playSound('click')
  gsap.from('.region-info-content', { y: 20, opacity: 0, duration: 0.4, ease: 'power2.out' })
}
</script>

<template>
  <div class="fixed inset-0 z-[200] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-950/90 backdrop-blur-md" @click="emit('close')"></div>
    
    <div class="relative w-full max-w-6xl aspect-video bg-slate-900 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_0_150px_rgba(0,168,255,0.15)] flex">
      
      <!-- Left: Tactical Map -->
      <div class="relative flex-1 overflow-hidden bg-black group/map">
        <div 
          class="map-container absolute inset-0 transition-transform duration-700 ease-out"
          :style="{ transform: `scale(1.05) translate(${mouseX}px, ${mouseY}px)` }"
        >
          <img 
            src="../assets/kanto-map.png" 
            class="w-full h-full object-cover opacity-80 mix-blend-lighten"
            alt="Kanto Tactical Map"
          />
          
          <!-- Grid Overlay -->
          <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
          <div class="absolute inset-0 scanline-grid opacity-10 pointer-events-none"></div>

          <!-- Scanner Line -->
          <div class="scanner-line absolute left-0 right-0 h-1 bg-pokedex-blue/40 shadow-[0_0_15px_rgba(0,168,255,0.8)] z-10"></div>

          <!-- Region Pins -->
          <button 
            v-for="region in regions" 
            :key="region.id"
            @click="selectRegion(region)"
            class="region-pin absolute z-20 group/pin"
            :style="{ left: region.x + '%', top: region.y + '%' }"
          >
            <div class="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
              <!-- Radar Rings -->
              <div class="absolute w-12 h-12 bg-pokedex-blue/30 rounded-full animate-ping"></div>
              <div class="absolute w-8 h-8 border border-pokedex-blue/50 rounded-full group-hover/pin:scale-150 transition-transform duration-500"></div>
              
              <!-- Pin Icon -->
              <div class="relative w-10 h-10 bg-slate-900/80 backdrop-blur-md border border-pokedex-blue/50 rounded-xl flex items-center justify-center shadow-lg group-hover/pin:bg-pokedex-blue group-hover/pin:border-white transition-all duration-300">
                <component :is="region.icon" class="w-5 h-5 text-pokedex-blue group-hover/pin:text-white group-hover/pin:scale-110 transition-all" />
              </div>

              <!-- Label -->
              <div class="absolute top-12 whitespace-nowrap px-3 py-1 bg-slate-900/90 border border-white/10 rounded-lg opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-none">
                <span class="text-[10px] font-black tracking-widest text-white uppercase">{{ region.name }}</span>
              </div>
            </div>
          </button>
        </div>

        <!-- Interface HUD -->
        <div class="absolute top-8 left-8 z-30 pointer-events-none">
          <div class="flex items-center gap-4 mb-2">
            <Compass class="w-10 h-10 text-pokedex-blue animate-spin-slow" />
            <div>
              <h2 class="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">Tactical Ops</h2>
              <span class="text-[10px] font-bold text-pokedex-blue tracking-[0.3em] uppercase opacity-70">Sector: Kanto-01</span>
            </div>
          </div>
        </div>

        <!-- Background Stats Decor -->
        <div class="absolute bottom-8 left-8 z-30 pointer-events-none font-mono text-[8px] text-pokedex-blue/40 space-y-1 uppercase tracking-widest hidden lg:block">
          <div>LOC_LAT: 35.6895° N</div>
          <div>LOC_LONG: 139.6917° E</div>
          <div>STATUS: SCANNING_ACTIVE</div>
          <div class="flex gap-2 items-center">
             <div class="w-12 h-1 bg-pokedex-blue/20 rounded-full overflow-hidden">
                <div class="w-2/3 h-full bg-pokedex-blue shadow-[0_0_5px_#00a8ff]"></div>
             </div>
             SIGNAL: 98%
          </div>
        </div>
      </div>

      <!-- Right: Detailed Analytics Sidebar -->
      <div class="w-96 bg-slate-900/95 border-l border-white/10 p-8 flex flex-col relative z-40">
        <div class="flex justify-between items-center mb-10">
          <div class="flex items-center gap-2 text-pokedex-blue">
            <Info class="w-4 h-4" />
            <span class="text-[10px] font-black uppercase tracking-[0.2em]">Environmental Data</span>
          </div>
          <button @click="emit('close')" class="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-500">
            <X class="w-6 h-6" />
          </button>
        </div>

        <div v-if="selectedRegion" class="region-info-content flex-1 flex flex-col">
          <div class="mb-8">
            <span class="text-[10px] font-bold text-pokedex-blue uppercase tracking-widest mb-1 block">{{ selectedRegion.type }} SECTOR</span>
            <h3 class="text-4xl font-black text-white uppercase leading-tight tracking-tighter">{{ selectedRegion.name }}</h3>
          </div>

          <div class="space-y-6 flex-1">
            <div>
              <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Native Lifeforms Detected</p>
              <div class="grid grid-cols-1 gap-3">
                <div 
                  v-for="p in selectedRegion.pokemon" 
                  :key="p" 
                  @click="selectPokemon(p)"
                  class="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 group hover:bg-white/10 hover:border-pokedex-blue/30 transition-all cursor-pointer active:scale-95"
                >
                   <div class="w-10 h-10 rounded-full bg-pokedex-blue/10 flex items-center justify-center">
                      <Sparkles class="w-4 h-4 text-pokedex-blue group-hover:rotate-45 transition-transform" />
                   </div>
                   <div class="flex-1">
                      <div class="text-xs font-black text-white italic group-hover:text-pokedex-blue transition-colors">{{ p }}</div>
                      <div class="text-[8px] text-slate-500 uppercase tracking-widest font-bold">DNA Match: High</div>
                   </div>
                   <Target class="w-4 h-4 text-slate-700 group-hover:text-pokedex-blue transition-colors" />
                </div>
              </div>
            </div>
          </div>

          <button 
            @click="handleTravel"
            class="w-full mt-auto py-5 bg-pokedex-blue text-white font-black rounded-2xl shadow-[0_0_30px_rgba(0,168,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3"
          >
            <Zap class="w-4 h-4 fill-white" />
            Initialize Travel
          </button>
        </div>

        <div v-else class="flex-1 flex flex-col items-center justify-center text-center opacity-30">
          <MapIcon class="w-16 h-16 text-slate-500 mb-6 animate-pulse" />
          <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] max-w-[200px] leading-relaxed">
            Select a tactical coordinate on the map to begin analysis
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scanline-grid {
  background-size: 40px 40px;
  background-image: 
    linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-slow {
  animation: spin-slow 15s linear infinite;
}

.map-container {
  will-change: transform;
}
</style>
