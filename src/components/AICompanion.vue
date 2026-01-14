<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { playSound } from '../utils/fx'
import { X, Sparkles, Send } from 'lucide-vue-next'
import { gsap } from 'gsap'

const isOpen = ref(false)
const message = ref('')
const chatter = ref([
  { role: 'bot', text: 'Pika Pika! I am your AI Poké-Guide. How can I help you today?' }
])
const isTyping = ref(false)

const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    playSound('pokedexOpen')
    gsap.from('.chat-window', { y: 20, opacity: 0, duration: 0.3 })
  }
}

const sendMessage = async () => {
  if (!message.value.trim()) return

  const userText = message.value
  chatter.value.push({ role: 'user', text: userText })
  message.value = ''
  isTyping.value = true

  try {
    // Call the local backend proxy (securely handles API key)
    const response = await axios.post('/api/generate', {
      text: userText
    })

    const aiText = response.data.output
    chatter.value.push({ role: 'bot', text: aiText })

  } catch (error) {
    console.error('Gemini Proxy Error:', error)
    chatter.value.push({ role: 'bot', text: "Pika-pi! Something went wrong with my Poké-brain." })
  } finally {
    isTyping.value = false
    playSound('click')
    // Jump animation for Pikachu
    gsap.to('.pika-buddy', { y: -20, duration: 0.2, yoyo: true, repeat: 1 })
  }
}
</script>


<template>
  <div class="fixed bottom-28 right-6 z-[200]">
    <!-- Chat Window -->
    <div v-if="isOpen" class="chat-window mb-4 w-80 h-96 glass rounded-2xl flex flex-col border border-pokedex-blue/30 shadow-2xl overflow-hidden bg-slate-900/90">
      <div class="p-4 border-b border-white/10 bg-pokedex-blue/20 flex justify-between items-center text-white">
        <h3 class="font-black text-xs uppercase tracking-widest flex items-center gap-2">
          <Sparkles class="w-4 h-4 text-yellow-400" /> Poké-Companion AI
        </h3>
        <button @click="toggleChat"><X class="w-4 h-4" /></button>
      </div>
      
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <div v-for="(msg, i) in chatter" :key="i" 
          :class="msg.role === 'bot' ? 'justify-start' : 'justify-end'" 
          class="flex"
        >
          <div :class="msg.role === 'bot' ? 'bg-white/10 text-white rounded-br-2xl' : 'bg-pokedex-blue/30 text-white rounded-bl-2xl'" 
            class="max-w-[80%] p-3 rounded-t-2xl text-xs font-medium leading-relaxed"
          >
            {{ msg.text }}
          </div>
        </div>
        <div v-if="isTyping" class="flex justify-start">
          <div class="bg-white/5 p-2 rounded-full animate-pulse flex gap-1">
            <div class="w-1 h-1 bg-white/40 rounded-full"></div>
            <div class="w-1 h-1 bg-white/40 rounded-full"></div>
            <div class="w-1 h-1 bg-white/40 rounded-full"></div>
          </div>
        </div>
      </div>

      <div class="p-4 border-t border-white/10 bg-black/20">
        <div class="relative">
          <input 
            v-model="message"
            @keyup.enter="sendMessage"
            type="text" 
            placeholder="Ask me anything..." 
            class="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-4 pr-10 text-xs outline-none focus:border-pokedex-blue transition-colors"
          />
          <button @click="sendMessage" class="absolute right-2 top-1/2 -translate-y-1/2 text-pokedex-blue hover:scale-110 transition-transform">
            <Send class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Pikachu Buddy -->
    <button 
      @click="toggleChat"
      class="pika-buddy group relative"
    >
      <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black px-3 py-1 rounded-full text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        PIKA?
      </div>
      <div class="w-16 h-16 rounded-full bg-yellow-400 border-4 border-[#333] shadow-2xl flex items-center justify-center overflow-hidden transition-all hover:scale-110 active:scale-95 group-hover:glow-yellow overflow-visible">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" class="w-20 h-20 -mb-2" />
      </div>
    </button>
  </div>
</template>
