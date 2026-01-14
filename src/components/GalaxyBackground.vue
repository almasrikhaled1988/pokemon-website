<script setup lang="ts">
import { onMounted, ref } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let w = (canvas.width = window.innerWidth)
  let h = (canvas.height = window.innerHeight)

  const stars: any[] = []
  const count = 200

  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 2,
      sp: Math.random() * 0.5 + 0.1,
      color: `rgba(255, 255, 255, ${Math.random()})`
    })
  }

  const animate = () => {
    ctx.clearRect(0, 0, w, h)
    stars.forEach(s => {
      s.y -= s.sp
      if (s.y < 0) s.y = h
      ctx.fillStyle = s.color
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
      ctx.fill()
    })
    requestAnimationFrame(animate)
  }

  animate()

  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth
    h = canvas.height = window.innerHeight
  })
})
</script>

<template>
  <canvas ref="canvasRef" class="fixed inset-0 -z-10 bg-[#020617]"></canvas>
</template>
