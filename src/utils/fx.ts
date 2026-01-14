import { Howl } from 'howler'
import confetti from 'canvas-confetti'

// Sound assets (using clear, modern SFX URLs)
const sounds = {
    click: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'], volume: 0.5 }),
    pokedexOpen: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'], volume: 0.6 }),
    battleHit: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2577/2577-preview.mp3'], volume: 0.4 }),
    victory: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'], volume: 0.7 }),
    evolution: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'], volume: 0.6 })
}

export const playSound = (name: keyof typeof sounds) => {
    sounds[name].play()
}

export const triggerConfetti = () => {
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 200 }

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

    const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
            return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
    }, 250)
}

export const triggerFlash = () => {
    const overlay = document.createElement('div')
    overlay.className = 'fixed inset-0 bg-white z-[200] pointer-events-none opacity-0 transition-opacity duration-100'
    document.body.appendChild(overlay)

    setTimeout(() => { overlay.style.opacity = '0.8' }, 10)
    setTimeout(() => { overlay.style.opacity = '0' }, 100)
    setTimeout(() => { document.body.removeChild(overlay) }, 200)
}
