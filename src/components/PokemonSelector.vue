<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePokedexStore } from '../stores/pokedex'
import { Search, X, Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  excludeIds?: number[]
}>()

const emit = defineEmits(['select', 'close'])
const store = usePokedexStore()
const searchQuery = ref('')

const filteredPokemon = computed(() => {
  return store.pokemonList.filter(p => 
    (p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    p.id.toString() === searchQuery.value) &&
    !props.excludeIds?.includes(p.id)
  )
})

const select = (pokemon: any) => {
  emit('select', pokemon)
}
</script>

<template>
  <div class="fixed inset-0 z-[200] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" @click="emit('close')"></div>
    
    <div class="relative w-full max-w-4xl max-h-[80vh] bg-slate-900 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl flex flex-col">
      <!-- Header -->
      <div class="p-8 border-b border-white/5 flex flex-col gap-6">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-3xl font-black italic text-white uppercase tracking-tighter">Select Specimen</h3>
            <p class="text-[10px] font-bold text-pokedex-blue tracking-widest uppercase opacity-60">Pokedex Database Access</p>
          </div>
          <button @click="emit('close')" class="p-3 hover:bg-white/5 rounded-full transition-colors text-slate-500">
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="relative group">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-pokedex-blue transition-colors" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search database by name or ID..." 
            class="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-pokedex-blue/50 focus:bg-white/10 transition-all font-medium text-white"
          />
        </div>
      </div>

      <!-- Grid -->
      <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div v-if="filteredPokemon.length === 0" class="flex flex-col items-center justify-center py-20 opacity-30">
          <Loader2 class="w-12 h-12 mb-4 animate-spin" />
          <p class="font-black uppercase tracking-widest text-xs">No specimens found</p>
        </div>
        
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <button 
            v-for="p in filteredPokemon" 
            :key="p.id"
            @click="select(p)"
            class="group p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center gap-3 hover:bg-pokedex-blue/10 hover:border-pokedex-blue/30 transition-all active:scale-95"
          >
            <div class="relative">
              <div class="absolute inset-0 bg-pokedex-blue/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <img :src="p.sprites.other['official-artwork'].front_default" class="w-24 h-24 object-contain relative transition-transform group-hover:scale-110" />
            </div>
            <div class="text-center">
              <div class="text-[10px] font-black text-pokedex-blue opacity-60 mb-1">#{{ p.id.toString().padStart(3, '0') }}</div>
              <div class="text-xs font-black text-white uppercase tracking-wider group-hover:text-pokedex-blue transition-colors">{{ p.name }}</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Footer Stats -->
      <div class="p-6 bg-black/40 border-t border-white/5 text-[10px] font-mono text-slate-500 flex justify-between uppercase tracking-widest">
        <span>Database Items: {{ filteredPokemon.length }}</span>
        <span>Filter: {{ searchQuery || 'None' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 168, 255, 0.3);
}
</style>
