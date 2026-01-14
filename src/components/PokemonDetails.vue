<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { gsap } from 'gsap'
import { 
  X, 
  ChevronRight, 
  Zap, 
  Shield, 
  Heart, 
  Sword, 
  Wind, 
  Activity,
  Dna
} from 'lucide-vue-next'
import axios from 'axios'
import { usePokedexStore } from '../stores/pokedex'

const store = usePokedexStore()

const props = defineProps<{
  pokemon: any
}>()

const emit = defineEmits(['close', 'battle'])
const evolutionChain = ref<any[]>([])

const fetchEvolutions = async () => {
  try {
    const speciesRes = await axios.get(props.pokemon.species.url)
    const evolutionRes = await axios.get(speciesRes.data.evolution_chain.url)
    
    let current = evolutionRes.data.chain
    const chain = []
    
    while (current) {
      const id = current.species.url.split('/').filter(Boolean).pop()
      chain.push({
        name: current.species.name,
        id: id,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
      })
      current = current.evolves_to[0]
    }
    evolutionChain.value = chain
  } catch (e) {
    console.error('Error fetching evolutions', e)
  }
}

onMounted(() => {
  fetchEvolutions()
  gsap.from('.modal-content', {
    y: 100,
    opacity: 0,
    duration: 0.5,
    ease: 'power3.out'
  })
})

const stats = computed(() => {
  return props.pokemon.stats.map((s: any) => ({
    name: s.stat.name,
    value: s.base_stat,
    percent: (s.base_stat / 255) * 100
  }))
})

const getStatIcon = (name: string) => {
  if (name.includes('hp')) return Heart
  if (name.includes('attack')) return Sword
  if (name.includes('defense')) return Shield
  if (name.includes('speed')) return Wind
  return Activity
}
</script>

<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
    <div class="absolute inset-0 bg-black/80 backdrop-blur-md" @click="emit('close')"></div>
    
    <div class="modal-content relative w-full max-w-4xl bg-[#1e293b] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row max-h-[90vh]">
      <!-- Close Button -->
      <button 
        @click="emit('close')"
        class="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
      >
        <X class="w-6 h-6" />
      </button>

      <!-- Left Side: Visuals -->
      <div 
        class="w-full md:w-2/5 p-8 flex flex-col items-center justify-center relative overflow-hidden"
        :class="pokemon.types[0].type.name"
      >
        <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
        <div class="relative z-10 text-center">
          <span class="text-sm font-bold opacity-70 uppercase tracking-widest text-white">#{{ pokemon.id.toString().padStart(3, '0') }}</span>
          <h2 class="text-4xl font-black text-white capitalize mb-4">{{ pokemon.name }}</h2>
          <div class="flex gap-2 justify-center mb-8">
            <span 
              v-for="type in pokemon.types" 
              :key="type.type.name"
              class="px-4 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 text-sm font-bold uppercase"
            >
              {{ type.type.name }}
            </span>
          </div>
        </div>
        
        <div class="relative z-10 group">
          <div class="absolute inset-0 bg-white/20 rounded-full blur-3xl scale-150 animate-pulse"></div>
          <img 
            :src="pokemon.sprites.other['official-artwork'].front_default" 
            :alt="pokemon.name"
            class="w-64 h-64 object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          />
        </div>
      </div>

      <!-- Right Side: Data -->
      <div class="flex-1 p-8 overflow-y-auto bg-slate-900/50">
        <!-- Stats Section -->
        <section class="mb-8">
          <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity class="w-5 h-5 text-pokedex-blue" />
            BASE STATS
          </h3>
          <div class="space-y-4">
            <div v-for="stat in stats" :key="stat.name" class="group">
              <div class="flex justify-between text-xs font-bold mb-1 uppercase tracking-wider text-slate-400">
                <span class="flex items-center gap-2">
                  <component :is="getStatIcon(stat.name)" class="w-3 h-3" />
                  {{ stat.name }}
                </span>
                <span>{{ stat.value }}</span>
              </div>
              <div class="h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-pokedex-blue transition-all duration-1000 ease-out group-hover:bg-blue-400"
                  :style="{ width: stat.percent + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </section>

        <!-- Evolution Chain -->
        <section class="mb-8">
          <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
            <Dna class="w-5 h-5 text-green-400" />
            EVOLUTION CHAIN
          </h3>
          <div class="flex flex-wrap items-center gap-4">
            <div 
              v-for="(evo, index) in evolutionChain" 
              :key="evo.id"
              class="flex items-center gap-4"
            >
              <div class="flex flex-col items-center">
                <div class="w-16 h-16 bg-white/5 rounded-2xl p-2 border border-white/10 hover:bg-white/10 transition-colors">
                  <img :src="evo.image" :alt="evo.name" class="w-full h-full object-contain" />
                </div>
                <span class="text-[10px] font-bold uppercase mt-1 text-slate-400">{{ evo.name }}</span>
              </div>
              <ChevronRight v-if="index < evolutionChain.length - 1" class="w-4 h-4 text-slate-600" />
            </div>
          </div>
        </section>

        <!-- Abilities & Actions -->
        <section>
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold flex items-center gap-2">
              <Zap class="w-5 h-5 text-yellow-400" />
              ABILITIES
            </h3>
            <div class="flex gap-2">
              <button 
                @click="store.addToFusion(pokemon)"
                class="px-4 py-1.5 bg-pokedex-blue hover:bg-blue-600 text-white rounded-full text-xs font-black uppercase flex items-center gap-2 transition-all hover:scale-105"
              >
                <Dna class="w-4 h-4" /> Fuse
              </button>
              <button 
                @click="emit('battle', pokemon)"
                class="px-4 py-1.5 bg-pokedex-red hover:bg-red-600 text-white rounded-full text-xs font-black uppercase flex items-center gap-2 transition-all hover:scale-105"
              >
                <Sword class="w-4 h-4" /> Battle!
              </button>
            </div>
          </div>
          <div class="flex gap-2">
            <div 
              v-for="ability in pokemon.abilities" 
              :key="ability.ability.name"
              class="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold capitalize"
            >
              {{ ability.ability.name }}
              <span v-if="ability.is_hidden" class="text-[8px] opacity-40 ml-1">HIDDEN</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fire { background: linear-gradient(to bottom right, #f97316, #ef4444); }
.water { background: linear-gradient(to bottom right, #38bdf8, #2563eb); }
.grass { background: linear-gradient(to bottom right, #4ade80, #16a34a); }
.electric { background: linear-gradient(to bottom right, #facc15, #eab308); }
.psychic { background: linear-gradient(to bottom right, #f472b6, #a855f7); }
.ice { background: linear-gradient(to bottom right, #7dd3fc, #0ea5e9); }
.dragon { background: linear-gradient(to bottom right, #6366f1, #4338ca); }
.dark { background: linear-gradient(to bottom right, #374151, #111827); }
.fairy { background: linear-gradient(to bottom right, #f9a8d4, #f43f5e); }
.normal { background: linear-gradient(to bottom right, #cbd5e1, #64748b); }
.fighting { background: linear-gradient(to bottom right, #b91c1c, #991b1b); }
.poison { background: linear-gradient(to bottom right, #a855f7, #7e22ce); }
.ground { background: linear-gradient(to bottom right, #d97706, #92400e); }
.flying { background: linear-gradient(to bottom right, #93c5fd, #3b82f6); }
.bug { background: linear-gradient(to bottom right, #a3e635, #65a30d); }
.rock { background: linear-gradient(to bottom right, #78716c, #44403c); }
.ghost { background: linear-gradient(to bottom right, #6d28d9, #1e1b4b); }
.steel { background: linear-gradient(to bottom right, #94a3b8, #475569); }
</style>
