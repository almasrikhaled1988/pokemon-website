<script setup lang="ts">
import { ref } from 'vue'
import { gsap } from 'gsap'
import { Sparkles, Shield, Zap, Heart } from 'lucide-vue-next'

const props = defineProps<{
  pokemon: any
}>()

const emit = defineEmits(['select'])

const innerRef = ref(null)

const handleClick = () => {
  emit('select', props.pokemon)
}

const handleMouseEnter = () => {
  gsap.to(innerRef.value, {
    rotateY: 15,
    rotateX: 10,
    scale: 1.05,
    duration: 0.4,
    ease: 'power2.out'
  })
}

const handleMouseLeave = () => {
  gsap.to(innerRef.value, {
    rotateY: 0,
    rotateX: 0,
    scale: 1,
    duration: 0.6,
    ease: 'elastic.out(1, 0.75)'
  })
}

const handleMouseMove = (e: MouseEvent) => {
  if (!innerRef.value) return
  const rect = (innerRef.value as HTMLElement).getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  
  const rotateX = ((y - centerY) / centerY) * -10
  const rotateY = ((x - centerX) / centerX) * 10
  
  gsap.to(innerRef.value, {
    rotateX,
    rotateY,
    duration: 0.1
  })
}

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    fire: 'from-orange-500 to-red-600',
    water: 'from-blue-400 to-cyan-600',
    grass: 'from-emerald-400 to-green-600',
    electric: 'from-yellow-300 to-amber-500',
    psychic: 'from-pink-400 to-purple-600',
    ice: 'from-sky-300 to-blue-400',
    dragon: 'from-indigo-500 to-purple-800',
    dark: 'from-gray-700 to-slate-900',
    fairy: 'from-pink-300 to-rose-400',
    normal: 'from-slate-300 to-gray-400',
    fighting: 'from-red-700 to-orange-800',
    poison: 'from-purple-500 to-fuchsia-700',
    ground: 'from-amber-600 to-yellow-800',
    flying: 'from-blue-300 to-indigo-400',
    bug: 'from-lime-400 to-emerald-600',
    rock: 'from-stone-500 to-neutral-700',
    ghost: 'from-violet-800 to-indigo-950',
    steel: 'from-slate-400 to-zinc-600'
  }
  return colors[type] || 'from-gray-400 to-gray-600'
}
</script>

<template>
  <div 
    ref="cardRef"
    class="relative w-full aspect-[3/4] perspective-1000 cursor-pointer"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @mousemove="handleMouseMove"
    @click="handleClick"
  >
    <div 
      ref="innerRef"
      class="w-full h-full preserve-3d transition-transform duration-100 rounded-2xl overflow-hidden glass group"
    >
      <!-- Card Front -->
      <div 
        class="absolute inset-0 p-4 flex flex-col items-center bg-gradient-to-br opacity-90 group-hover:opacity-100 transition-opacity"
        :class="getTypeColor(pokemon.types[0].type.name)"
      >
        <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
        
        <!-- Header -->
        <div class="z-10 w-full flex justify-between items-start mb-2">
          <span class="text-xs font-bold uppercase tracking-widest opacity-80 text-white">
            #{{ pokemon.id.toString().padStart(3, '0') }}
          </span>
          <div class="flex gap-1">
            <div 
              v-for="type in pokemon.types" 
              :key="type.type.name"
              class="px-2 py-0.5 rounded-full text-[10px] bg-white/20 backdrop-blur-md text-white border border-white/30"
            >
              {{ type.type.name }}
            </div>
          </div>
        </div>

        <!-- Image Container -->
        <div class="relative z-10 w-full flex-1 flex items-center justify-center mb-4">
          <div class="absolute w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
          <img 
            :src="pokemon.sprites.other['official-artwork'].front_default" 
            :alt="pokemon.name"
            class="w-40 h-40 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_20px_30px_rgba(0,0,0,0.7)] group-hover:scale-110 transition-all duration-500"
          />
        </div>

        <!-- Stats Footer -->
        <div class="z-10 w-full bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
          <h3 class="text-lg font-black text-white text-center capitalize mb-2 tracking-tight">
            {{ pokemon.name }}
          </h3>
          <div class="grid grid-cols-3 gap-2 text-[10px] text-white/90">
            <div class="flex flex-col items-center">
              <Heart class="w-3 h-3 mb-1 text-red-400" />
              <span>{{ pokemon.stats[0].base_stat }}</span>
            </div>
            <div class="flex flex-col items-center">
              <Zap class="w-3 h-3 mb-1 text-yellow-400" />
              <span>{{ pokemon.stats[1].base_stat }}</span>
            </div>
            <div class="flex flex-col items-center">
              <Shield class="w-3 h-3 mb-1 text-blue-400" />
              <span>{{ pokemon.stats[2].base_stat }}</span>
            </div>
          </div>
        </div>

        <!-- Shiny Particles Effect Pin -->
        <div class="absolute top-2 right-2 group-hover:animate-ping">
          <Sparkles v-if="pokemon.id % 10 === 0" class="w-4 h-4 text-yellow-300" />
        </div>
      </div>
      
      <!-- Scan Line Effect -->
      <div class="scan-line opacity-0 group-hover:opacity-30"></div>
    </div>
  </div>
</template>

<style scoped>
.preserve-3d {
  transform-style: preserve-3d;
}
</style>
