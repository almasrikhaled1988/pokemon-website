<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { usePokedexStore } from '../stores/pokedex'
import { playSound, triggerConfetti, triggerFlash } from '../utils/fx'
import { Dna, Zap, Shield, Heart, Trash2, Wand2, X, Activity, Info, Swords } from 'lucide-vue-next'
import { gsap } from 'gsap'

const store = usePokedexStore()
const isFusing = ref(false)
const fusedPokemon = ref<any>(null)
const fusionLore = ref('')
const isGeneratingLore = ref(false)

const emit = defineEmits(['close'])

const fusePokemon = async () => {
  if (store.fusionSlots.length < 2) return
  
  isFusing.value = true
  playSound('evolution')
  
  // Animation for the fusion process
  gsap.to('.fusion-anim', {
    rotate: 720,
    scale: 2,
    duration: 3,
    ease: 'power4.inOut',
    onComplete: async () => {
      triggerFlash()
      triggerConfetti()
      
      const p1 = store.fusionSlots[0]
      const p2 = store.fusionSlots[1]
      
      // Fusion Logic
      const newPokemon = {
        name: p1.name.substring(0, Math.ceil(p1.name.length / 2)) + p2.name.substring(Math.floor(p2.name.length / 2)),
        id: 'FUSION-' + p1.id + '-' + p2.id,
        types: [...new Set([...p1.types.map((t: any) => t.type.name), ...p2.types.map((t: any) => t.type.name)])].slice(0, 2),
        sprites: {
          p1: p1.sprites.other['official-artwork'].front_default,
          p2: p2.sprites.other['official-artwork'].front_default
        },
        stats: p1.stats.map((s: any, i: number) => ({
          base_stat: Math.floor((s.base_stat + p2.stats[i].base_stat) / 2) + 20,
          stat: s.stat
        })),
        isFusion: true
      }
      
      fusedPokemon.value = newPokemon
      store.achievements.fusionsCreated++
      isFusing.value = false

      // Generate AI Lore
      generateLore(p1.name, p2.name, newPokemon.name)
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
          <div>
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
          <div class="group relative aspect-square rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center bg-white/5 overflow-hidden transition-all hover:border-pokedex-blue/50 hover:bg-pokedex-blue/5">
            <div v-if="store.fusionSlots[0]" class="p-6 flex flex-col items-center animate-[float_4s_ease-in-out_infinite]">
              <div class="relative">
                <div class="absolute inset-0 bg-pokedex-blue blur-3xl opacity-20"></div>
                <img :src="store.fusionSlots[0].sprites.other['official-artwork'].front_default" class="w-48 h-48 object-contain relative drop-shadow-2xl" />
              </div>
              <span class="mt-6 font-black uppercase tracking-widest text-pokedex-blue bg-pokedex-blue/10 px-4 py-1 rounded-full text-xs border border-pokedex-blue/20">{{ store.fusionSlots[0].name }}</span>
            </div>
            <div v-else class="text-center p-6 text-white/20">
              <Wand2 class="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p class="text-xs font-black uppercase tracking-widest">Awaiting Genetic Sample</p>
            </div>
          </div>

          <!-- Fusion Trigger -->
          <div class="flex flex-col items-center gap-8">
            <div class="fusion-anim relative group">
              <div class="absolute -inset-8 bg-pokedex-blue/20 rounded-full blur-3xl animate-pulse"></div>
              <div class="relative p-10 rounded-full bg-gradient-to-br from-pokedex-blue to-purple-600 border border-white/20 shadow-2xl">
                <Activity :class="{'animate-spin': isFusing}" class="w-16 h-16 text-white" />
              </div>
              <!-- DNA Strands around the button -->
              <div v-if="isFusing" class="absolute inset-0 -m-4 border-2 border-pokedex-blue/30 border-dashed rounded-full animate-[spin_2s_linear_infinite]"></div>
            </div>
            
            <button 
              @click="fusePokemon"
              :disabled="store.fusionSlots.length < 2 || isFusing"
              class="group relative w-full py-5 px-10 rounded-2xl bg-white text-black font-black uppercase tracking-[0.2em] text-sm transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] disabled:opacity-20 disabled:grayscale overflow-hidden"
            >
              <div class="relative z-10 flex items-center justify-center gap-2">
                {{ isFusing ? 'HYBRIDIZING...' : 'COLLIDE DNA' }}
              </div>
              <div class="absolute inset-0 bg-gradient-to-r from-pokedex-blue/0 via-pokedex-blue/20 to-pokedex-blue/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </button>
          </div>

          <!-- Slot 2 -->
          <div class="group relative aspect-square rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center bg-white/5 overflow-hidden transition-all hover:border-pokedex-blue/50 hover:bg-pokedex-blue/5">
            <div v-if="store.fusionSlots[1]" class="p-6 flex flex-col items-center animate-[float_4s_ease-in-out_infinite_1s]">
              <div class="relative">
                <div class="absolute inset-0 bg-pokedex-blue blur-3xl opacity-20"></div>
                <img :src="store.fusionSlots[1].sprites.other['official-artwork'].front_default" class="w-48 h-48 object-contain relative drop-shadow-2xl" />
              </div>
              <span class="mt-6 font-black uppercase tracking-widest text-pokedex-blue bg-pokedex-blue/10 px-4 py-1 rounded-full text-xs border border-pokedex-blue/20">{{ store.fusionSlots[1].name }}</span>
            </div>
            <div v-else class="text-center p-6 text-white/20">
              <Wand2 class="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p class="text-xs font-black uppercase tracking-widest">Awaiting Genetic Sample</p>
            </div>
          </div>
        </div>

        <!-- Fused Result -->
        <div v-else class="flex flex-col md:flex-row gap-12 items-center py-8">
          <!-- The Hybrid Image (Split Effect) -->
          <div class="relative w-80 h-80 group">
            <div class="absolute inset-0 bg-pokedex-blue rounded-full blur-[120px] opacity-30 animate-pulse"></div>
            
            <div class="relative w-full h-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm">
                <!-- Left Half (Pokemon 1) -->
                <div class="absolute inset-0 grayscale-[0.2] contrast-125 transition-transform group-hover:scale-110 duration-700" :style="{ 
                  'clip-path': 'polygon(0 0, 65% 0, 35% 100%, 0% 100%)'
                }">
                  <img :src="fusedPokemon.sprites.p1" class="w-full h-full object-contain p-4" />
                </div>
                
                <!-- Right Half (Pokemon 2) -->
                <div class="absolute inset-0 hue-rotate-30 transition-transform group-hover:scale-110 duration-700 delay-75" :style="{ 
                  'clip-path': 'polygon(65% 0, 100% 0, 100% 100%, 35% 100%)'
                }">
                  <img :src="fusedPokemon.sprites.p2" class="w-full h-full object-contain p-4" />
                </div>

                <!-- Separation Line -->
                <div class="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/0 via-white/40 to-white/0 w-[2px] left-[50%] -translate-x-1/2 rotate-[16.7deg] shadow-[0_0_20px_white]"></div>
                
                <!-- Glitch Overlay -->
                <div class="absolute inset-0 pointer-events-none mix-blend-overlay opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] animate-[glitch_0.2s_infinite]"></div>
            </div>

            <!-- Stats Badge -->
            <div class="absolute -bottom-6 -right-6 bg-yellow-400 text-black px-6 py-2 rounded-2xl font-black text-sm rotate-3 shadow-2xl border-4 border-black">
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

            <button @click="reset" class="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase font-black text-[10px] tracking-[0.2em] pt-4 group">
              <Trash2 class="w-4 h-4 group-hover:text-red-500 transition-colors" /> Purge Laboratory Data
            </button>
          </div>
        </div>
      </div>
    </div>
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

.glow-blue {
  box-shadow: 0 0 40px rgba(0, 168, 255, 0.4);
}
</style>
