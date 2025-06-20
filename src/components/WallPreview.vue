<template>
    <div class="wall-preview">
        <canvas ref="canvas" :width="screenWidth" :height="screenHeight" />
    </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'

const props = defineProps({
    layout: { type: Object, required: true },
    background: { type: String, required: true },
    lockImage: { type: String, required: true },
    screenWidth: { type: Number, required: true },
    screenHeight: { type: Number, required: true }
})

const canvas = ref(null)
const bgImage = ref(null)

function drawPreview() {
    if (!canvas.value) return
    const ctx = canvas.value.getContext('2d')
    ctx.clearRect(0, 0, props.screenWidth, props.screenHeight)

    // 背景画像
    if (bgImage.value && bgImage.value.complete && bgImage.value.naturalWidth > 0) {
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, props.screenWidth, props.screenHeight)
        // アスペクト比維持して中央に描画
        const imgRatio = bgImage.value.width / bgImage.value.height
        const canvasRatio = props.screenWidth / props.screenHeight
        let drawWidth, drawHeight, offsetX, offsetY
        if (imgRatio > canvasRatio) {
            drawWidth = props.screenWidth
            drawHeight = props.screenWidth / imgRatio
            offsetX = 0
            offsetY = (props.screenHeight - drawHeight) / 2
        } else {
            drawHeight = props.screenHeight
            drawWidth = props.screenHeight * imgRatio
            offsetX = (props.screenWidth - drawWidth) / 2
            offsetY = 0
        }
        ctx.drawImage(bgImage.value, offsetX, offsetY, drawWidth, drawHeight)
        drawAreas(ctx)
    } else {
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, props.screenWidth, props.screenHeight)
        drawAreas(ctx)
    }
}

function drawAreas(ctx) {
    const areaColors = {
        main: '#2196f3',
        locked: '#ff9800',
        preparing: '#4caf50'
    }
    const areaFills = {
        main: 'rgba(33,150,243,0.15)',
        locked: 'rgba(255,152,0,0.15)',
        preparing: 'rgba(76,175,80,0.15)'
    }
    for (const key of ['main', 'locked', 'preparing']) {
        const area = props.layout[key]
        if (!area) continue
        if ((key === 'locked' && props.layout.showLocked === false) ||
            (key === 'preparing' && props.layout.showPreparing === false)) continue

        // 半透明の塗りつぶし
        ctx.save()
        ctx.fillStyle = areaFills[key]
        ctx.fillRect(area.x, area.y, area.width, area.height)
        ctx.restore()

        // 白の太線でアウトライン
        ctx.save()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 5
        ctx.strokeRect(area.x, area.y, area.width, area.height)
        ctx.restore()

        // カラーの細線で重ねる
        ctx.save()
        ctx.strokeStyle = areaColors[key]
        ctx.lineWidth = 2
        ctx.strokeRect(area.x, area.y, area.width, area.height)
        ctx.restore()

        // グリッド線（白→カラーの順で重ねる）
        const rows = Number(area.rows)
        const cols = Number(area.columns)
        if (rows > 1) {
            for (let r = 1; r < rows; r++) {
                const y = area.y + (area.height / rows) * r
                // 白線
                ctx.beginPath()
                ctx.moveTo(area.x, y)
                ctx.lineTo(area.x + area.width, y)
                ctx.strokeStyle = '#fff'
                ctx.lineWidth = 3
                ctx.stroke()
                // カラー線
                ctx.beginPath()
                ctx.moveTo(area.x, y)
                ctx.lineTo(area.x + area.width, y)
                ctx.strokeStyle = areaColors[key]
                ctx.lineWidth = 1
                ctx.stroke()
            }
        }
        if (cols > 1) {
            for (let c = 1; c < cols; c++) {
                const x = area.x + (area.width / cols) * c
                // 白線
                ctx.beginPath()
                ctx.moveTo(x, area.y)
                ctx.lineTo(x, area.y + area.height)
                ctx.strokeStyle = '#fff'
                ctx.lineWidth = 3
                ctx.stroke()
                // カラー線
                ctx.beginPath()
                ctx.moveTo(x, area.y)
                ctx.lineTo(x, area.y + area.height)
                ctx.strokeStyle = areaColors[key]
                ctx.lineWidth = 1
                ctx.stroke()
            }
        }
    }
}

// 背景画像の変更時のみImageを新規生成
watch(() => props.background, (newBg) => {
    if (newBg && newBg.startsWith('data:image')) {
        const img = new window.Image()
        img.onload = () => {
            bgImage.value = img
            drawPreview()
        }
        img.src = newBg
    } else {
        bgImage.value = null
        drawPreview()
    }
})

// 他のprops変更時はキャッシュ済みImageで再描画
watch(
    () => [props.layout, props.lockImage, props.screenWidth, props.screenHeight],
    () => nextTick(drawPreview),
    { deep: true }
)
nextTick(drawPreview)
</script>

<style scoped>
.wall-preview {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    background: #fafafa;
    overflow: auto;
    user-select: none;
}
canvas {
    border: 1px solid #ccc;
    background: #000;
    max-width: 100%;
    height: auto;
    cursor: pointer;
}
</style>
