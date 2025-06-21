<template>
  <div class="background-settings">
    <h4 class="mb-2">背景設定</h4>
    
    <!-- 背景タイプ選択 -->
    <v-select
      v-model="backgroundType"
      :items="backgroundTypeOptions"
      label="背景タイプ"
      class="mb-3"
      @update:model-value="onBackgroundTypeChange"
    />
    
    <!-- 画像アップロード -->
    <div v-if="backgroundType === 'image'" class="mb-3">
      <ImageUploader 
        label="背景画像をアップロード" 
        :aspect-ratio="16 / 9" 
        @update:image="onImageUpdate" 
      />
      
      <!-- 画像調整オプション -->
      <v-expansion-panels class="mt-3">
        <v-expansion-panel>
          <v-expansion-panel-title>
            画像調整オプション
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <!-- 明度調整 -->
            <v-slider
              v-model="imageBrightness"
              label="明度"
              min="-100"
              max="100"
              step="1"
              thumb-label
              @update:model-value="onImageAdjustmentChange"
              @start="onSliderStart"
              @end="onSliderEnd"
            />
            
            <!-- ぼかし調整 -->
            <v-slider
              v-model="imageBlur"
              label="ぼかし"
              min="0"
              max="20"
              step="0.5"
              thumb-label
              @update:model-value="onImageAdjustmentChange"
              @start="onSliderStart"
              @end="onSliderEnd"
            />
            
            <!-- リセットボタン -->
            <v-btn
              color="secondary"
              variant="outlined"
              size="small"
              class="mt-3"
              @click="resetImageAdjustments"
            >
              調整をリセット
            </v-btn>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
    
    <!-- 単色背景 -->
    <div v-if="backgroundType === 'solid'" class="mb-3">
      <v-text-field
        v-model="solidColor"
        label="背景色（HEXコード）"
        class="mb-2"
        @update:model-value="onSolidColorChange"
        prepend-inner-icon="mdi-palette"
        readonly
        @click="openColorPicker('solid')"
      />
    </div>
    
    <!-- グラデーション背景 -->
    <div v-if="backgroundType === 'gradient'" class="mb-3">
      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model="gradientStartColor"
            label="開始色（HEXコード）"
            class="mb-2"
            @update:model-value="onGradientChange"
            prepend-inner-icon="mdi-palette"
            readonly
            @click="openColorPicker('start')"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="gradientEndColor"
            label="終了色（HEXコード）"
            class="mb-2"
            @update:model-value="onGradientChange"
            prepend-inner-icon="mdi-palette"
            readonly
            @click="openColorPicker('end')"
          />
        </v-col>
      </v-row>
      <v-select
        v-model="gradientDirection"
        :items="gradientDirectionOptions"
        label="グラデーション方向"
        class="mb-2"
        @update:model-value="onGradientChange"
      />
    </div>

    <!-- カラーピッカーモーダル -->
    <v-dialog v-model="colorPickerDialog" max-width="400">
      <v-card>
        <v-card-title>
          色を選択
        </v-card-title>
        <v-card-text>
          <v-color-picker
            v-model="currentColorPicker"
            @update:model-value="onColorPickerChange"
            hide-inputs
            :show-swatches="false"
            :alpha="false"
            flat
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="closeColorPicker">
            決定
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import ImageUploader from './ImageUploader.vue'

const props = defineProps({
  screenWidth: { type: Number, required: true },
  screenHeight: { type: Number, required: true }
})

const emit = defineEmits(['update:background'])

const backgroundTypeOptions = [
  { title: '画像', value: 'image' },
  { title: '単色', value: 'solid' },
  { title: 'グラデーション', value: 'gradient' }
]

const gradientDirectionOptions = [
  { title: '上から下', value: 'vertical' },
  { title: '左から右', value: 'horizontal' },
  { title: '左上から右下', value: 'diagonal' },
  { title: '右上から左下', value: 'diagonal-reverse' }
]

const backgroundType = ref('image')
const uploadedImage = ref(null)
const solidColor = ref('#000000')
const gradientStartColor = ref('#000000')
const gradientEndColor = ref('#ffffff')
const gradientDirection = ref('vertical')
const colorPickerDialog = ref(false)
const currentColorPicker = ref('#000000')
const currentColorType = ref('')
const imageBrightness = ref(0)
const imageBlur = ref(0)
const isSliderDragging = ref(false)

// 背景画像を生成する関数
function generateBackgroundImage() {
  const canvas = document.createElement('canvas')
  canvas.width = props.screenWidth
  canvas.height = props.screenHeight
  const ctx = canvas.getContext('2d')

  if (backgroundType.value === 'image' && uploadedImage.value) {
    // 画像の場合は調整を適用
    processImageWithAdjustments()
    return
  }

  if (backgroundType.value === 'solid') {
    // 単色背景
    ctx.fillStyle = solidColor.value
    ctx.fillRect(0, 0, props.screenWidth, props.screenHeight)
  } else if (backgroundType.value === 'gradient') {
    // グラデーション背景
    let gradient
    if (gradientDirection.value === 'vertical') {
      gradient = ctx.createLinearGradient(0, 0, 0, props.screenHeight)
    } else if (gradientDirection.value === 'horizontal') {
      gradient = ctx.createLinearGradient(0, 0, props.screenWidth, 0)
    } else if (gradientDirection.value === 'diagonal') {
      gradient = ctx.createLinearGradient(0, 0, props.screenWidth, props.screenHeight)
    } else if (gradientDirection.value === 'diagonal-reverse') {
      gradient = ctx.createLinearGradient(props.screenWidth, 0, 0, props.screenHeight)
    }
    
    gradient.addColorStop(0, gradientStartColor.value)
    gradient.addColorStop(1, gradientEndColor.value)
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, props.screenWidth, props.screenHeight)
  }

  const dataUrl = canvas.toDataURL('image/png')
  emit('update:background', dataUrl)
}

// 画像調整を適用する関数
function processImageWithAdjustments() {
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = props.screenWidth
    canvas.height = props.screenHeight
    const ctx = canvas.getContext('2d')

    // アスペクト比維持して中央に描画
    const imgRatio = img.width / img.height
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

    // ぼかし効果を適用
    if (imageBlur.value > 0) {
      ctx.filter = `blur(${imageBlur.value}px)`
    }

    // 画像を描画
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)

    // 明度調整を適用
    if (imageBrightness.value !== 0) {
      const imageData = ctx.getImageData(0, 0, props.screenWidth, props.screenHeight)
      const data = imageData.data
      const factor = 1 + imageBrightness.value / 100

      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.max(0, data[i] * factor))     // Red
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * factor)) // Green
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * factor)) // Blue
        // Alphaは変更しない
      }

      ctx.putImageData(imageData, 0, 0)
    }

    const dataUrl = canvas.toDataURL('image/png')
    emit('update:background', dataUrl)
  }
  img.src = uploadedImage.value
}

// イベントハンドラー
function onBackgroundTypeChange() {
  generateBackgroundImage()
}

function onImageUpdate(image) {
  uploadedImage.value = image
  if (backgroundType.value === 'image') {
    generateBackgroundImage()
  }
}

function onSolidColorChange() {
  if (backgroundType.value === 'solid') {
    generateBackgroundImage()
  }
}

function onGradientChange() {
  if (backgroundType.value === 'gradient') {
    generateBackgroundImage()
  }
}

function openColorPicker(type) {
  currentColorPicker.value = type === 'solid' ? solidColor.value : type === 'start' ? gradientStartColor.value : gradientEndColor.value
  currentColorType.value = type
  colorPickerDialog.value = true
}

function onColorPickerChange() {
  if (currentColorType.value === 'solid') {
    solidColor.value = currentColorPicker.value
    onSolidColorChange()
  } else if (currentColorType.value === 'start') {
    gradientStartColor.value = currentColorPicker.value
    onGradientChange()
  } else if (currentColorType.value === 'end') {
    gradientEndColor.value = currentColorPicker.value
    onGradientChange()
  }
}

function closeColorPicker() {
  colorPickerDialog.value = false
}

function onImageAdjustmentChange() {
  if (backgroundType.value === 'image' && !isSliderDragging.value) {
    generateBackgroundImage()
  }
}

function onSliderStart() {
  isSliderDragging.value = true
}

function onSliderEnd() {
  isSliderDragging.value = false
  if (backgroundType.value === 'image') {
    generateBackgroundImage()
  }
}

function resetImageAdjustments() {
  imageBrightness.value = 0
  imageBlur.value = 0
  onImageAdjustmentChange()
}

// 画面サイズが変更された時に背景を再生成
watch(() => [props.screenWidth, props.screenHeight], () => {
  generateBackgroundImage()
})

// 初期化時に背景を生成
generateBackgroundImage()
</script>

<style scoped>
.background-settings {
  margin-bottom: 16px;
}
</style> 