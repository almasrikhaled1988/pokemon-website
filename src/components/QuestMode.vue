<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePokedexStore } from '../stores/pokedex'
import { playSound, triggerConfetti, triggerFlash } from '../utils/fx'
import { Sparkles, ChevronRight } from 'lucide-vue-next'
import { gsap } from 'gsap'

const store = usePokedexStore()
const step = ref(1) // 1: Choose Starter, 2: Congratulations
const selectedId = ref<number | null>(null)

const starters = [
  { id: 1, name: 'Bulbasaur', type: 'Grass', desc: 'A strange seed was planted on its back at birth.', img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png' },
  { id: 4, name: 'Charmander', type: 'Fire', desc: 'The flame on its tail indicates its life force.', img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png' },
  { id: 7, name: 'Squirtle', type: 'Water', desc: 'Shoots water at prey from inside its shell.', img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png' }
]

const chooseStarter = (pokemon: any) => {
  selectedId.value = pokemon.id
  playSound('click')
}

const confirmStarter = () => {
  if (!selectedId.value) return
  const pokemon = starters.find(s => s.id === selectedId.value)
  store.starter = pokemon
  playSound('victory')
  triggerFlash()
  triggerConfetti()
  step.value = 2
}

onMounted(() => {
  gsap.from('.quest-modal', { scale: 0.9, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' })
})
</script>

<template>
  <div class="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
    <div class="quest-modal relative w-full max-w-4xl bg-slate-900 rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
      <div v-if="step === 1" class="p-12 text-center">
        <h2 class="text-xs font-black text-pokedex-blue uppercase tracking-[0.5em] mb-4">New Adventure</h2>
        <h3 class="text-5xl font-black text-white italic mb-12 tracking-tighter">CHOOSE YOUR STARTER</h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div 
            v-for="s in starters" 
            :key="s.id"
            @click="chooseStarter(s)"
            :class="selectedId === s.id ? 'border-pokedex-blue bg-pokedex-blue/10 scale-105' : 'border-white/10 bg-white/5 hover:border-white/30'"
            class="p-8 rounded-3xl border-2 cursor-pointer transition-all flex flex-col items-center group"
          >
            <div class="relative">
              <div v-if="selectedId === s.id" class="absolute inset-0 bg-pokedex-blue rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <img :src="s.img" :alt="s.name" class="w-32 h-32 object-contain relative z-10 transition-transform group-hover:scale-110" />
            </div>
            <h4 class="mt-6 text-xl font-bold text-white">{{ s.name }}</h4>
            <span class="text-[10px] font-black uppercase text-slate-500 mt-1">{{ s.type }} Type</span>
          </div>
        </div>

        <button 
          @click="confirmStarter"
          :disabled="!selectedId"
          class="px-12 py-4 bg-white text-black font-black rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-20 uppercase tracking-widest text-xs flex items-center gap-3 mx-auto"
        >
          Begin Journey <ChevronRight class="w-4 h-4" />
        </button>
      </div>

      <div v-else class="p-12 text-center animate-in fade-in zoom-in duration-500">
        <Sparkles class="w-16 h-16 text-yellow-400 mx-auto mb-6" />
        <h3 class="text-4xl font-black text-white italic mb-4">TRAINER ADVENTURE BEGUN!</h3>
        <p class="text-slate-400 mb-8 max-w-md mx-auto">
          You have chosen <span class="text-white font-bold">{{ store.starter.name }}</span> as your partner. 
          Your journey through the Kanto region starts now!
        </p>
        <div class="w-40 h-40 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-12 border border-white/10 relative overflow-hidden">
          <div class="absolute inset-0 bg-pokedex-blue/10 animate-pulse"></div>
          <img :src="store.starter.img" class="w-32 h-32 object-contain relative z-10" />
        </div>
        <button 
          @click="store.starterChosen = true"
          class="px-12 py-4 bg-pokedex-blue text-white font-black rounded-full shadow-2xl hover:scale-105 transition-all uppercase tracking-widest text-xs"
        >
          Let's Go!
        </button>
      </div>
    </div>
  </div>
</template>
