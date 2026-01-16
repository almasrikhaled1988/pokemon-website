<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { usePokedexStore } from './stores/pokedex'
import PokemonCard from './components/PokemonCard.vue'
import PokemonDetails from './components/PokemonDetails.vue'
import BattleSimulator from './components/BattleSimulator.vue'
import FusionLab from './components/FusionLab.vue'
import WorldMap from './components/WorldMap.vue'
import AICompanion from './components/AICompanion.vue'
import QuestMode from './components/QuestMode.vue'
import GalaxyBackground from './components/GalaxyBackground.vue'
import { playSound, triggerConfetti } from './utils/fx'
import { 
  Search, 
  Settings, 
  Gamepad2, 
  Map as MapIcon, 
  Baby, 
  Code,
  Trophy,
  Volume2,
  VolumeX,
  ChevronRight,
  Loader2,
  Dna,
  Sword,
  Activity
} from 'lucide-vue-next'

const store = usePokedexStore()
const searchQuery = ref('')
const selectedPokemon = ref<any>(null)
const battleData = ref<any>(null)
const showFusionLab = ref(false)
const showWorldMap = ref(false)
const fps = ref(60)

onMounted(async () => {
  await store.fetchPokemon(50, 0) // Fetch first 50 for start
})

const filteredPokemon = computed(() => {
  return store.pokemonList.filter(p => 
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    p.id.toString() === searchQuery.value
  )
})

const toggleSound = () => {
  store.settings.soundEnabled = !store.settings.soundEnabled
}

const startBattle = (pokemon: any) => {
  selectedPokemon.value = null
  const opponent = store.pokemonList[Math.floor(Math.random() * store.pokemonList.length)]
  battleData.value = { pokemon1: pokemon, pokemon2: opponent }
}

const handleMapPokemon = async (name: string) => {
  showWorldMap.value = false
  const pokemon = await store.fetchPokemonByName(name)
  if (pokemon) {
    selectedPokemon.value = pokemon
  }
}

watch(selectedPokemon, (newVal) => {
  if (newVal && store.kidMode) {
    const utterance = new SpeechSynthesisUtterance(`${newVal.name}. This is a ${newVal.types.map((t: any) => t.type.name).join(' and ')} type Pokémon.`);
    utterance.pitch = 1.2;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
})

// FPS Counter & Easter Egg
onMounted(() => {
  let frameCount = 0
  let lastTime = performance.now()
  
  const updateFPS = () => {
    frameCount++
    const now = performance.now()
    if (now - lastTime >= 1000) {
      fps.value = frameCount
      frameCount = 0
      lastTime = now
    }
    requestAnimationFrame(updateFPS)
  }
  updateFPS()

  window.addEventListener('keydown', (e) => {
    if (e.key === 'd') { // Developer Easter Egg
      console.log('Easter Egg Triggered!')
      playSound('pokedexOpen')
      triggerConfetti()
    }
  })
})
</script>

<template>
  <div class="min-h-screen text-slate-200 pokedex-texture overflow-hidden selection:bg-pokedex-blue selection:text-white">
    <GalaxyBackground />

    <!-- Top Navigation Bar -->
    <header class="fixed top-0 left-0 right-0 z-50 h-16 glass border-b border-white/10 flex items-center justify-between px-6">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 rounded-full bg-pokedex-red border-4 border-white glow-red flex items-center justify-center">
          <div class="w-4 h-4 bg-pokedex-blue rounded-full animate-pulse border-2 border-white/50 shadow-[0_0_10px_rgba(0,168,255,0.8)]"></div>
        </div>
        <h1 class="text-xl font-bold tracking-tighter uppercase hidden sm:block">
          Poké<span class="text-pokedex-red">Dex</span> <span class="text-white/40 font-light">Universe</span>
        </h1>
      </div>

      <!-- Search Bar -->
      <div class="flex-1 max-w-md mx-4 relative group">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-pokedex-blue transition-colors" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search Name or ID..." 
          class="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-pokedex-blue/50 focus:bg-white/10 transition-all font-medium"
        />
      </div>

      <div class="flex items-center gap-3">
        <button @click="toggleSound" class="p-2 rounded-full hover:bg-white/10 transition-colors">
          <Volume2 v-if="store.settings.soundEnabled" class="w-5 h-5 text-green-400" />
          <VolumeX v-else class="w-5 h-5 text-red-400" />
        </button>
        <button @click="store.toggleKidMode" :class="{'bg-yellow-500 text-black shadow-lg shadow-yellow-500/50': store.kidMode}" class="p-2 rounded-full hover:bg-white/10 transition-colors">
          <Baby class="w-5 h-5" />
        </button>
        <button @click="store.toggleDevMode" :class="{'bg-pokedex-blue text-white shadow-lg shadow-blue-500/50': store.devMode}" class="p-2 rounded-full hover:bg-white/10 transition-colors">
          <Code class="w-5 h-5" />
        </button>
      </div>
    </header>

    <!-- Sidebar Explorer -->
    <aside class="fixed left-0 top-16 bottom-0 w-20 lg:w-64 glass border-r border-white/10 hidden md:flex flex-col py-6">
      <nav class="flex-1 flex flex-col gap-2 px-3">
        <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-pokedex-blue/20 text-pokedex-blue border border-pokedex-blue/30 transition-all group">
          <Gamepad2 class="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span class="hidden lg:block font-bold">Explorer</span>
        </a>
        <a href="#" @click.prevent="showWorldMap = true" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 transition-all group">
          <MapIcon class="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span class="hidden lg:block font-medium">World Map</span>
        </a>
        <a href="#" @click.prevent="showFusionLab = true" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 transition-all group">
          <Dna class="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span class="hidden lg:block font-medium">DNA Lab</span>
          <div v-if="store.fusionSlots.length > 0" class="ml-auto w-2 h-2 rounded-full bg-pokedex-blue animate-ping"></div>
        </a>
        <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 transition-all group">
          <Trophy class="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span class="hidden lg:block font-medium">Achievements</span>
        </a>
      </nav>

      <div class="px-6 py-4 mt-auto">
        <div class="bg-white/5 rounded-2xl p-4 border border-white/10 hidden lg:block mb-4">
          <div class="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Completion</div>
          <div class="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-1">
            <div class="bg-pokedex-blue h-full" :style="{ width: (store.achievements.seenCount / 500 * 100) + '%' }"></div>
          </div>
          <div class="text-xs font-mono text-slate-400">
            {{ store.achievements.seenCount }} / 500 Seen
          </div>
        </div>

        <div class="hidden lg:flex flex-col gap-2">
          <div class="text-[10px] text-slate-500 uppercase tracking-widest font-bold px-1">Badges</div>
          <div class="flex flex-wrap gap-2">
            <div 
              class="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all"
              :class="store.achievements.seenCount >= 50 ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50 glow-yellow' : 'bg-white/5 text-white/20'"
              title="Seen 50 Pokémon"
            >
              <Trophy class="w-4 h-4" />
            </div>
            <div 
              class="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all"
              :class="store.achievements.battlesWon > 0 ? 'bg-pokedex-red/20 text-pokedex-red border-pokedex-red/50 glow-red' : 'bg-white/5 text-white/20'"
              title="First Victory"
            >
              <Sword class="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content AREA -->
    <main class="pt-20 md:ml-20 lg:ml-64 p-6 min-h-screen">
      <!-- Dev Overlay -->
      <div v-if="store.devMode" class="mb-6 p-6 glass border border-pokedex-blue/30 rounded-2xl bg-slate-900/80 font-mono text-[10px] relative overflow-hidden group">
        <div class="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
          <Activity class="w-4 h-4 text-pokedex-blue animate-pulse" />
        </div>
        <h4 class="text-pokedex-blue font-black mb-4 flex items-center gap-2 text-xs">
          <Code class="w-4 h-4" /> ENGINEERING DASHBOARD v2.1
        </h4>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="p-3 bg-white/5 rounded-xl border border-white/5">
            <div class="text-slate-500 mb-1">FPS PERFORMANCE</div>
            <div class="text-green-400 font-bold text-sm">{{ fps }} Hz</div>
          </div>
          <div class="p-3 bg-white/5 rounded-xl border border-white/5">
            <div class="text-slate-500 mb-1">API INSTANCES</div>
            <div class="text-blue-400 font-bold text-sm">{{ store.pokemonList.length }} NODES</div>
          </div>
          <div class="p-3 bg-white/5 rounded-xl border border-white/5">
            <div class="text-slate-500 mb-1">DOM FRAGMENTS</div>
            <div class="text-yellow-400 font-bold text-sm">3,492 ELEMS</div>
          </div>
          <div class="p-3 bg-white/5 rounded-xl border border-white/5">
            <div class="text-slate-500 mb-1">GSAP ENGINE</div>
            <div class="text-purple-400 font-bold text-sm">WEBGL_ACCEL</div>
          </div>
        </div>
      </div>

      <!-- Welcome Hero (Kid Mode) -->
      <div v-if="store.kidMode" class="mb-8 p-8 rounded-3xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-2xl relative overflow-hidden group">
        <div class="absolute -right-10 -bottom-10 opacity-20 group-hover:scale-110 transition-transform duration-1000 rotate-12">
          <Gamepad2 class="w-64 h-64" />
        </div>
        <div class="relative z-10">
          <h2 class="text-4xl font-black mb-2">HELLO YOUNG TRAINER! 🌟</h2>
          <p class="text-lg font-medium opacity-80">Pick your favorite Pokemon and start your adventure!</p>
          <button class="mt-4 px-6 py-3 bg-white rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-xl">
            <Zap class="w-5 h-5 fill-yellow-500 text-yellow-500" /> Start Quiz
          </button>
        </div>
      </div>

      <!-- Filters Row -->
      <div class="flex flex-wrap items-center gap-4 mb-8">
        <h2 class="text-2xl font-black tracking-tight" :class="store.kidMode ? 'text-4xl' : ''">
          {{ store.kidMode ? 'FOUND POKEMON' : 'All Generations' }}
        </h2>
        <div class="flex gap-2 ml-auto">
          <span v-for="type in ['Fire', 'Water', 'Grass', 'Electric']" :key="type" class="px-4 py-1 rounded-full glass text-xs font-bold hover:bg-pokedex-blue/20 transition-colors cursor-pointer border border-white/10 uppercase tracking-widest">
            {{ type }}
          </span>
        </div>
      </div>

      <!-- Grid -->
      <div v-if="store.loading && store.pokemonList.length === 0" class="flex items-center justify-center py-40">
        <Loader2 class="w-12 h-12 text-pokedex-blue animate-spin" />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        <PokemonCard 
          v-for="pokemon in filteredPokemon" 
          :key="pokemon.id" 
          :pokemon="pokemon"
          @select="selectedPokemon = $event"
        />
      </div>

      <PokemonDetails 
        v-if="selectedPokemon" 
        :pokemon="selectedPokemon" 
        @close="selectedPokemon = null" 
        @battle="startBattle"
      />

      <BattleSimulator 
        v-if="battleData"
        :pokemon1="battleData.pokemon1"
        :pokemon2="battleData.pokemon2"
        @close="battleData = null"
        @victory="store.incrementBattlesWon"
      />

      <FusionLab 
        v-if="showFusionLab"
        @close="showFusionLab = false"
      />

      <WorldMap
        v-if="showWorldMap"
        @close="showWorldMap = false"
        @select-pokemon="handleMapPokemon"
      />

      <QuestMode v-if="!store.starterChosen" />

      <AICompanion />

      <!-- Load More -->
      <div class="mt-12 flex justify-center pb-20">
        <button 
          @click="store.fetchPokemon(20, store.pokemonList.length)"
          class="group relative px-8 py-4 bg-pokedex-red text-white font-black rounded-full overflow-hidden transition-all hover:scale-105 hover:glow-red"
        >
          <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <span class="relative flex items-center gap-2">
            LOAD MORE POKÉMON
            <ChevronRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </button>
      </div>

      <!-- Pokedex Device UI (Bottom Floating) -->
      <div class="fixed bottom-6 right-6 z-50">
        <button class="w-20 h-20 rounded-full bg-pokedex-red border-8 border-[#333] shadow-2xl flex items-center justify-center group hover:scale-110 hover:rotate-12 transition-all">
          <div class="w-10 h-10 bg-pokedex-blue rounded-full border-4 border-white glow-blue"></div>
          <div class="absolute -top-12 right-0 bg-white text-black px-4 py-1 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            OPEN POKÉDEX
          </div>
        </button>
      </div>
    </main>

    <!-- Footer Mobile -->
    <nav class="fixed bottom-0 left-0 right-0 h-16 glass md:hidden border-t border-white/10 flex items-center justify-around px-6 z-50">
      <Gamepad2 class="w-6 h-6 text-pokedex-blue" />
      <MapIcon class="w-6 h-6 text-slate-400" />
      <div class="w-14 h-14 bg-pokedex-red rounded-full -translate-y-6 border-4 border-[#0f172a] flex items-center justify-center shadow-2xl">
        <div class="w-4 h-4 bg-pokedex-blue rounded-full border-2 border-white"></div>
      </div>
      <Trophy class="w-6 h-6 text-slate-400" />
      <Settings class="w-6 h-6 text-slate-400" />
    </nav>
  </div>
</template>

<style>
.glass-dev {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(8px);
}
</style>
