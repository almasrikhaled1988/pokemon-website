<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { usePokedexStore } from '../stores/pokedex'
import { playSound, triggerConfetti, triggerFlash } from '../utils/fx'
import { Dna, Zap, Shield, Heart, Trash2, Wand2, X, Activity, Info, Swords, Loader2, Sparkles } from 'lucide-vue-next'
import { gsap } from 'gsap'
import PokemonSelector from './PokemonSelector.vue'

const store = usePokedexStore()
const isFusing = ref(false)
const fusedPokemon = ref<any>(null)
const fusionLore = ref('')
const isGeneratingLore = ref(false)
const isGeneratingImage = ref(false)
const showSelector = ref(false)
const activeSlot = ref(0)
const imageError = ref(false)
const fusionProgress = ref(0)

const emit = defineEmits(['close'])

const openSelector = (slotIndex: number) => {
  activeSlot.value = slotIndex
  showSelector.value = true
  playSound('click')
}

const handlePokemonSelect = (pokemon: any) => {
  if (activeSlot.value === 0) {
    store.fusionSlots[0] = pokemon
  } else {
    store.fusionSlots[1] = pokemon
  }
  showSelector.value = false
  playSound('pokedexOpen')
}

const fusePokemon = async () => {
  if (store.fusionSlots.length < 2) return
  
  console.log('Fusion process started');
  imageError.value = false
  fusionProgress.value = 5
  isFusing.value = true
  playSound('evolution')
  
  const p1 = store.fusionSlots[0]
  const p2 = store.fusionSlots[1]
  const fusionName = p1.name.substring(0, Math.ceil(p1.name.length / 2)) + p2.name.substring(Math.floor(p2.name.length / 2))

  console.log('Fusing:', p1.name, 'and', p2.name);
  isGeneratingImage.value = true
  
  // Fake progress increments
  const progressInterval = setInterval(() => {
    if (fusionProgress.value < 90) {
      fusionProgress.value += Math.random() * 15
    }
  }, 400)

  // Animation for the fusion process
  gsap.to('.fusion-anim', {
    rotate: 720,
    scale: 2,
    duration: 3,
    ease: 'power4.inOut',
    onComplete: async () => {
      console.log('Animation complete, sending image request...');
      fusionProgress.value = 40
      triggerFlash()
      triggerConfetti()
      
      try {
        const imageRes = await axios.post('/api/generate-image', {
          p1: p1.name,
          p2: p2.name,
          fusionName: fusionName
        })
        console.log('Image generation response received:', imageRes.data);

        const newPokemon = {
          name: fusionName,
          id: 'FUSION-' + p1.id + '-' + p2.id,
          types: [...new Set([...p1.types.map((t: any) => t.type.name), ...p2.types.map((t: any) => t.type.name)])].slice(0, 2),
          image: imageRes.data.imageUrl,
          stats: p1.stats.map((s: any, i: number) => ({
            base_stat: Math.floor((s.base_stat + p2.stats[i].base_stat) / 2) + 20,
            stat: s.stat
          })),
          isFusion: true
        }
        
        fusionProgress.value = 100
        clearInterval(progressInterval)
        fusedPokemon.value = newPokemon
        store.achievements.fusionsCreated++
        generateLore(p1.name, p2.name, newPokemon.name)
      } catch (e) {
        console.error("Fusion Image Error", e)
        clearInterval(progressInterval)
        fusionProgress.value = 0
      } finally {
        isFusing.value = false
        isGeneratingImage.value = false
      }
    }
  })
}

const generateLore = async (p1: string, p2: string, fusion: string) => {
  isGeneratingLore.value = true
  try {
    const response = await axios.post('/api/generate', {
      text: `Create a very short (15 words max) Pokedex entry for a fusion of ${p1} and ${p2} named ${fusion}. Mention one unique hybrid power.`
    })
    fusionLore.value = response.data.output
  } catch (e) {
    fusionLore.value = "A biological marvel created by merging DNA. Its powers are unstable but immense."
  } finally {
    isGeneratingLore.value = false
  }
}

const reset = () => {
  fusedPokemon.value = null
  fusionLore.value = ''
  store.clearFusion()
}
</script>

<template>
  <div class="fixed inset-0 z-[150] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/95 backdrop-blur-2xl" @click="emit('close')"></div>
    
    <div class="relative w-full max-w-5xl bg-slate-900/50 rounded-[3rem] border border-pokedex-blue/20 overflow-hidden shadow-[0_0_100px_rgba(0,168,255,0.1)]">
      <!-- Background DNA Animation -->
      <div class="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <Dna class="w-full h-full rotate-45 scale-150 animate-[pulse_8s_infinite]" />
      </div>

      <div class="relative z-10 p-8 md:p-12">
        <div class="flex justify-between items-center mb-8">
          <div class="flex-1">
            <h2 class="text-5xl font-black italic tracking-tighter text-white flex items-center gap-4">
              <div class="p-3 bg-pokedex-blue/20 rounded-2xl">
                <Dna class="text-pokedex-blue w-10 h-10 animate-[spin_4s_linear_infinite]" />
              </div>
              DNA FUSION LAB
            </h2>
            <p class="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-2 opacity-60">Genetic Hybridization Facility v2.0</p>
          </div>
          <button @click="emit('close')" class="p-4 bg-white/5 hover:bg-white/10 rounded-full transition-all hover:rotate-90">
            <X class="w-6 h-6 text-white" />
          </button>
        </div>

        <div v-if="!fusedPokemon" class="grid grid-cols-1 md:grid-cols-3 gap-12 items-center min-h-[400px]">
          <!-- Slot 1 -->
          <div 
            @click="openSelector(0)"
            class="group relative aspect-square rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center bg-white/5 overflow-hidden transition-all hover:border-pokedex-blue/50 hover:bg-pokedex-blue/5 cursor-pointer"
          >
            <div v-if="store.fusionSlots[0]" class="p-6 flex flex-col items-center animate-[float_4s_ease-in-out_infinite]">
              <div class="relative">
                <div class="absolute inset-0 bg-pokedex-blue blur-3xl opacity-20"></div>
                <img :src="store.fusionSlots[0].sprites.other['official-artwork'].front_default" class="w-48 h-48 object-contain relative drop-shadow-2xl" />
              </div>
              <span class="mt-6 font-black uppercase tracking-widest text-pokedex-blue bg-pokedex-blue/10 px-4 py-1 rounded-full text-xs border border-pokedex-blue/20">{{ store.fusionSlots[0].name }}</span>
            </div>
            <div v-else class="text-center p-6 text-white/20 transition-all group-hover:scale-110">
              <Wand2 class="w-12 h-12 mx-auto mb-4 opacity-50 text-pokedex-blue" />
              <p class="text-xs font-black uppercase tracking-widest leading-loose">Tap to Select<br/>Genetic Sample A</p>
            </div>

            <!-- Hover hint -->
            <div class="absolute inset-0 bg-pokedex-blue/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
               <span class="text-[10px] font-black uppercase tracking-[0.5em] text-white">Access Database</span>
            </div>
          </div>

          <!-- Fusion Trigger -->
          <div class="flex flex-col items-center gap-8">
            <div class="fusion-anim relative group">
              <div class="absolute -inset-8 bg-pokedex-blue/20 rounded-full blur-3xl animate-pulse"></div>
              <div class="relative p-10 rounded-full bg-gradient-to-br from-pokedex-blue to-purple-600 border border-white/20 shadow-2xl">
                <Activity :class="{'animate-spin': isFusing}" class="w-16 h-16 text-white" />
              </div>
              <div v-if="isFusing" class="absolute inset-0 -m-4 border-2 border-pokedex-blue/30 border-dashed rounded-full animate-[spin_2s_linear_infinite]"></div>
            </div>
            
            <div v-if="isFusing" class="w-full space-y-3">
               <div class="flex justify-between text-[8px] font-black text-pokedex-blue uppercase tracking-widest">
                  <span>Synthesizing DNA</span>
                  <span>{{ Math.round(fusionProgress) }}%</span>
               </div>
               <div class="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    class="h-full bg-gradient-to-r from-pokedex-blue to-purple-500 transition-all duration-300"
                    :style="{ width: fusionProgress + '%' }"
                  ></div>
               </div>
            </div>

            <button 
              v-else
              @click="fusePokemon"
              :disabled="store.fusionSlots.length < 2 || isFusing"
              class="group relative w-full py-5 px-10 rounded-2xl bg-white text-black font-black uppercase tracking-[0.2em] text-sm transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] disabled:opacity-20 disabled:grayscale overflow-hidden"
            >
              <div class="relative z-10 flex items-center justify-center gap-2">
                {{ isFusing ? 'SYNTHESIZING...' : 'START FUSION' }}
              </div>
              <div class="absolute inset-0 bg-gradient-to-r from-pokedex-blue/0 via-pokedex-blue/20 to-pokedex-blue/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </button>
          </div>

          <!-- Slot 2 -->
          <div 
            @click="openSelector(1)"
            class="group relative aspect-square rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center bg-white/5 overflow-hidden transition-all hover:border-pokedex-blue/50 hover:bg-pokedex-blue/5 cursor-pointer"
          >
            <div v-if="store.fusionSlots[1]" class="p-6 flex flex-col items-center animate-[float_4s_ease-in-out_infinite_1s]">
              <div class="relative">
                <div class="absolute inset-0 bg-pokedex-blue blur-3xl opacity-20"></div>
                <img :src="store.fusionSlots[1].sprites.other['official-artwork'].front_default" class="w-48 h-48 object-contain relative drop-shadow-2xl" />
              </div>
              <span class="mt-6 font-black uppercase tracking-widest text-pokedex-blue bg-pokedex-blue/10 px-4 py-1 rounded-full text-xs border border-pokedex-blue/20">{{ store.fusionSlots[1].name }}</span>
            </div>
            <div v-else class="text-center p-6 text-white/20 transition-all group-hover:scale-110">
              <Wand2 class="w-12 h-12 mx-auto mb-4 opacity-50 text-pokedex-blue" />
              <p class="text-xs font-black uppercase tracking-widest leading-loose">Tap to Select<br/>Genetic Sample B</p>
            </div>
            <!-- Hover hint -->
            <div class="absolute inset-0 bg-pokedex-blue/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
               <span class="text-[10px] font-black uppercase tracking-[0.5em] text-white">Access Database</span>
            </div>
          </div>
        </div>

        <!-- Fused Result -->
        <div v-else class="flex flex-col md:flex-row gap-12 items-center py-8">
          <!-- The Hybrid AI Image -->
          <div class="relative w-80 h-80 group">
            <div class="absolute inset-0 bg-pokedex-blue rounded-full blur-[120px] opacity-30 animate-pulse"></div>
            
            <div class="relative w-full h-full overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <div v-if="isGeneratingImage" class="flex flex-col items-center gap-4 text-pokedex-blue">
                   <Loader2 class="w-12 h-12 animate-spin" />
                   <p class="text-[10px] font-black uppercase tracking-[0.2em]">Synthesizing Image...</p>
                </div>
                <div v-else class="relative w-full h-full flex items-center justify-center">
                  <img 
                    :src="fusedPokemon.image" 
                    @error="imageError = true"
                    class="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" 
                    :class="{'opacity-0': imageError}"
                  />
                  <div v-if="imageError" class="flex flex-col items-center text-red-400 gap-2">
                    <Activity class="w-8 h-8 opacity-50" />
                    <span class="text-[10px] font-black uppercase">DNA Rendering Failed</span>
                  </div>
                </div>

                <!-- AI Badge -->
                <div class="absolute top-4 right-4 flex items-center gap-2 px-2 py-1 bg-black/60 rounded-lg border border-white/10 backdrop-blur-md">
                   <Sparkles class="w-3 h-3 text-pokedex-blue" />
                   <span class="text-[8px] font-black text-white uppercase tracking-widest">Gemini Rendered</span>
                </div>
            </div>

            <!-- Stats Badge -->
            <div class="absolute -bottom-6 -right-6 bg-yellow-400 text-black px-6 py-2 rounded-2xl font-black text-sm rotate-3 shadow-2xl border-4 border-black group-hover:rotate-0 transition-transform">
              LV. 99 HYBRID
            </div>
          </div>

          <div class="flex-1 space-y-6">
            <div>
              <div class="flex items-center gap-3 mb-2">
                <span v-for="t in fusedPokemon.types" :key="t" class="px-3 py-1 bg-white/10 rounded-md text-[10px] font-black uppercase tracking-tighter text-white border border-white/5">
                  {{ t }}
                </span>
                <span class="px-3 py-1 bg-pokedex-blue/20 rounded-md text-[10px] font-black uppercase tracking-tighter text-pokedex-blue border border-pokedex-blue/20 flex items-center gap-1">
                  <Zap class="w-3 h-3" /> FUSION
                </span>
              </div>
              <h3 class="text-7xl font-black italic text-white tracking-tighter uppercase leading-none break-words">{{ fusedPokemon.name }}</h3>
              <p class="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 italic">Class-A Biological Hybrid Identified</p>
            </div>

            <!-- AI Lore Card -->
            <div class="bg-white/5 border border-white/10 p-6 rounded-[2rem] relative overflow-hidden group/lore min-h-[100px] flex items-center">
              <div class="absolute top-4 right-4 text-pokedex-blue/20">
                <Info class="w-8 h-8" />
              </div>
              <div class="absolute inset-0 bg-gradient-to-r from-pokedex-blue/5 to-transparent"></div>
              <p class="text-sm font-medium text-slate-200 leading-relaxed italic relative z-10">
                <span v-if="isGeneratingLore" class="animate-pulse flex items-center gap-2">
                  <div class="w-2 h-2 bg-pokedex-blue rounded-full animate-bounce"></div>
                  Decoding genetic entry...
                </span>
                <span v-else>{{ fusionLore }}</span>
              </p>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div class="bg-white/5 p-4 rounded-2xl border border-white/10 group/stat">
                <Heart class="w-4 h-4 text-red-500 mb-2 group-hover/stat:scale-125 transition-transform" />
                <div class="text-2xl font-black text-white">{{ fusedPokemon.stats[0].base_stat }}</div>
                <div class="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Vitality</div>
              </div>
              <div class="bg-white/5 p-4 rounded-2xl border border-white/10 group/stat">
                <Swords class="w-4 h-4 text-orange-500 mb-2 group-hover/stat:scale-125 transition-transform" />
                <div class="text-2xl font-black text-white">{{ fusedPokemon.stats[1].base_stat }}</div>
                <div class="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Force</div>
              </div>
              <div class="bg-white/5 p-4 rounded-2xl border border-white/10 group/stat">
                <Shield class="w-4 h-4 text-blue-500 mb-2 group-hover/stat:scale-125 transition-transform" />
                <div class="text-2xl font-black text-white">{{ fusedPokemon.stats[2].base_stat }}</div>
                <div class="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Armor</div>
              </div>
            </div>

            <button @click="reset" class="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase font-black text-[10px] tracking-[0.2em] pt-4 group border-b border-transparent hover:border-red-500/30">
              <Trash2 class="w-4 h-4 group-hover:text-red-500 transition-colors" /> Purge Laboratory Data
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pokemon Selection Modal -->
    <Transition name="fade">
      <PokemonSelector 
        v-if="showSelector" 
        :exclude-ids="store.fusionSlots.filter(p => !!p).map(p => p.id)"
        @select="handlePokemonSelect" 
        @close="showSelector = false"
      />
    </Transition>
  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0); }
  50% { transform: translateY(-15px) rotate(2deg); }
}

@keyframes glitch {
  0% { transform: translate(1px, 1px); }
  25% { transform: translate(-1px, -1px); opacity: 0.8; }
  50% { transform: translate(-1px, 1px); }
  75% { transform: translate(1px, -1px); opacity: 0.9; }
  100% { transform: translate(1px, 1px); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
