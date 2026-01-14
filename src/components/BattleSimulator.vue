<script setup lang="ts">
import { ref } from 'vue'
import { gsap } from 'gsap'
import { Sword, Shield, Zap, Heart, RefreshCw, X } from 'lucide-vue-next'

const props = defineProps<{
  pokemon1: any
  pokemon2: any
}>()

const emit = defineEmits(['close', 'victory'])

const hp1 = ref(props.pokemon1.stats[0].base_stat)
const hp2 = ref(props.pokemon2.stats[0].base_stat)
const maxHp1 = props.pokemon1.stats[0].base_stat
const maxHp2 = props.pokemon2.stats[0].base_stat

const log = ref<string[]>(['Battle Started!'])
const turn = ref(1) // 1 or 2
const isAttacking = ref(false)
const winner = ref<number | null>(null)

const logMessage = (msg: string) => {
  log.value.unshift(msg)
  if (log.value.length > 5) log.value.pop()
}

const attack = async () => {
  if (winner.value || isAttacking.value) return
  isAttacking.value = true
  
  const attacker = turn.value === 1 ? props.pokemon1 : props.pokemon2
  const defender = turn.value === 1 ? props.pokemon2 : props.pokemon1
  const setHp = turn.value === 1 ? hp2 : hp1
  
  // Animation
  const attackerEl = turn.value === 1 ? '.p1-model' : '.p2-model'
  const defenderEl = turn.value === 1 ? '.p2-model' : '.p1-model'
  
  await gsap.to(attackerEl, {
    x: turn.value === 1 ? 50 : -50,
    duration: 0.2,
    yoyo: true,
    repeat: 1
  })
  
  gsap.to(defenderEl, {
    x: turn.value === 1 ? 10 : -10,
    duration: 0.1,
    yoyo: true,
    repeat: 3
  })

  // Damage calculation (simplified)
  const damage = Math.floor(Math.random() * 20) + 10
  setHp.value = Math.max(0, setHp.value - damage)
  
  logMessage(`${attacker.name} used Tackle! Dealt ${damage} damage.`)
  
  if (setHp.value <= 0) {
    winner.value = turn.value
    logMessage(`${defender.name} fainted! ${attacker.name} wins!`)
    emit('victory', attacker)
  } else {
    turn.value = turn.value === 1 ? 2 : 1
  }
  
  isAttacking.value = false
}

const reset = () => {
  hp1.value = maxHp1
  hp2.value = maxHp2
  turn.value = 1
  winner.value = null
  log.value = ['Battle Started!']
}
</script>

<template>
  <div class="fixed inset-0 z-[120] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/90 backdrop-blur-xl" @click="emit('close')"></div>
    
    <div class="relative w-full max-w-5xl bg-slate-900 rounded-3xl border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(0,168,255,0.2)]">
      <!-- Header -->
      <div class="p-6 border-b border-white/10 flex justify-between items-center">
        <h2 class="text-2xl font-black italic tracking-tighter flex items-center gap-2">
          <Sword class="text-pokedex-red w-6 h-6 animate-pulse" />
          BATTLE SIMULATOR
        </h2>
        <button @click="emit('close')" class="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- Arena -->
      <div class="relative h-[400px] bg-gradient-to-b from-blue-900/20 to-slate-900 flex items-center justify-around p-12 overflow-hidden pokedex-texture">
        <!-- Background elements -->
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-8 border-white/20 rounded-full"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-1 bg-white/20"></div>
        </div>

        <!-- Pokemon 1 -->
        <div class="flex flex-col items-center gap-4 relative z-10 p1-model">
          <div class="w-full max-w-[200px] bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs font-bold uppercase">{{ pokemon1.name }}</span>
              <span class="text-[10px] opacity-60">Lv. 50</span>
            </div>
            <div class="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                class="h-full bg-green-500 transition-all duration-500"
                :class="{'bg-yellow-500': (hp1/maxHp1) < 0.5, 'bg-red-500': (hp1/maxHp1) < 0.2}"
                :style="{ width: (hp1/maxHp1 * 100) + '%' }"
              ></div>
            </div>
            <div class="text-[10px] text-right mt-1 font-mono">{{ hp1 }} / {{ maxHp1 }} HP</div>
          </div>
          <div class="relative">
            <div class="absolute bottom-0 w-32 h-8 bg-black/40 rounded-full blur-xl scale-150"></div>
            <img :src="pokemon1.sprites.other['official-artwork'].front_default" class="w-48 h-48 object-contain drop-shadow-2xl" />
          </div>
        </div>

        <!-- VS -->
        <div class="flex flex-col items-center gap-2">
          <div class="text-6xl font-black italic text-white/10 select-none">VS</div>
        </div>

        <!-- Pokemon 2 -->
        <div class="flex flex-col items-center gap-4 relative z-10 p2-model">
          <div class="w-full max-w-[200px] bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs font-bold uppercase">{{ pokemon2.name }}</span>
              <span class="text-[10px] opacity-60">Lv. 50</span>
            </div>
            <div class="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                class="h-full bg-green-500 transition-all duration-500"
                :class="{'bg-yellow-500': (hp2/maxHp2) < 0.5, 'bg-red-500': (hp2/maxHp2) < 0.2}"
                :style="{ width: (hp2/maxHp2 * 100) + '%' }"
              ></div>
            </div>
            <div class="text-[10px] text-right mt-1 font-mono">{{ hp2 }} / {{ maxHp2 }} HP</div>
          </div>
          <div class="relative">
            <div class="absolute bottom-0 w-32 h-8 bg-black/40 rounded-full blur-xl scale-150"></div>
            <img :src="pokemon2.sprites.other['official-artwork'].front_default" class="w-48 h-48 object-contain drop-shadow-2xl scale-x-[-1]" />
          </div>
        </div>
      </div>

      <!-- Controls & Log -->
      <div class="grid grid-cols-1 md:grid-cols-3 bg-black/40 border-t border-white/10">
        <!-- Actions -->
        <div class="p-8 border-r border-white/10 flex flex-col gap-4">
          <h4 class="text-xs font-bold opacity-40 uppercase tracking-widest">Select Action</h4>
          <div v-if="!winner" class="grid grid-cols-2 gap-3">
            <button 
              @click="attack" 
              :disabled="turn !== 1 || isAttacking"
              class="flex flex-col items-center justify-center p-4 bg-pokedex-red/20 border border-pokedex-red/40 rounded-2xl hover:bg-pokedex-red/40 transition-all disabled:opacity-20 group"
            >
              <Sword class="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
              <span class="font-bold text-xs uppercase">Attack</span>
            </button>
            <button class="flex flex-col items-center justify-center p-4 bg-blue-500/20 border border-blue-500/40 rounded-2xl hover:bg-blue-500/40 transition-all opacity-50 cursor-not-allowed">
              <Shield class="w-6 h-6 mb-1" />
              <span class="font-bold text-xs uppercase">Defend</span>
            </button>
            <button class="flex flex-col items-center justify-center p-4 bg-yellow-500/20 border border-yellow-500/40 rounded-2xl hover:bg-yellow-500/40 transition-all opacity-50 cursor-not-allowed">
              <Zap class="w-6 h-6 mb-1" />
              <span class="font-bold text-xs uppercase">Special</span>
            </button>
            <button class="flex flex-col items-center justify-center p-4 bg-green-500/20 border border-green-500/40 rounded-2xl hover:bg-green-500/40 transition-all opacity-50 cursor-not-allowed">
              <Heart class="w-6 h-6 mb-1" />
              <span class="font-bold text-xs uppercase">Heal</span>
            </button>
          </div>
          <div v-else class="flex-1 flex flex-col justify-center">
             <button 
              @click="reset" 
              class="w-full py-4 bg-white text-black font-black rounded-2xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <RefreshCw class="w-5 h-5" /> RESTART BATTLE
            </button>
          </div>
        </div>

        <!-- Battle Log -->
        <div class="col-span-2 p-8 overflow-y-auto h-[200px] flex flex-col-reverse gap-2 font-mono text-sm">
          <div 
            v-for="(msg, i) in log" 
            :key="i"
            class="p-2 rounded bg-white/5 border-l-4 border-pokedex-blue"
            :class="{'border-pokedex-red': msg.includes('damage'), 'border-yellow-400': msg.includes('wins')}"
          >
            {{ msg }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
