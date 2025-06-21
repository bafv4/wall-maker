<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <v-row>
          <!-- 左カラム -->
          <v-col cols="12" md="5" lg="4">
            <v-card class="pa-5" elevation="2" style="max-height:calc(100vh - 48px); overflow-y:auto;">
              <h2 class="mt-2 mb-2">Wall Maker</h2>
              <h4 class="mb-2">リソースパック情報</h4>
              <v-text-field v-model="packName" label="リソースパックの名前" class="mb-2" />
              <v-textarea v-model="packDescription" label="説明" rows="2" auto-grow class="mb-2" />
              <ImageUploader label="アイコン画像をアップロード" :aspect-ratio="1" @update:image="onIconUpdate" />
              <!-- 画面サイズセレクト -->
              <v-row class="mb-2">
                <v-col cols="12">
                  <v-select v-model="selectedResolution" :items="resolutionOptions" label="画面サイズ" item-title="label"
                    item-value="value" dense />
                </v-col>
              </v-row>
              <v-divider class="my-4 mt-2" />
              <!-- 背景設定 -->
              <BackgroundSettings 
                :screen-width="selectedResolution.width" 
                :screen-height="selectedResolution.height"
                @update:background="onBackgroundUpdate" 
              />
              <!-- ロック画像アップロード -->
              <h4 class="mb-2">ロック画像</h4>
              <ImageUploader label="ロック画像をアップロード" @update:image="onLockUpdate" />
              <v-divider class="my-4" />
              <!-- レイアウトエディタ -->
              <h4 class="mb-2">レイアウト</h4>
              <LayoutEditor :screen-width="selectedResolution.width" :screen-height="selectedResolution.height"
                @update-layout="onUpdateLayout" />
            </v-card>
          </v-col>
          <!-- 右カラム -->
          <v-col cols="12" md="7" lg="8">
            <v-card class="pa-5" elevation="2">
              <h4 class="mb-2">プレビュー</h4>
              <WallPreview ref="wallPreviewRef" :layout="currentLayout" :background="backgroundImageToUse"
                :lock-image="lockImageToUse" :screen-width="selectedResolution.width"
                :screen-height="selectedResolution.height" />
              <v-btn color="primary" class="mt-4" @click="downloadResourcePack">
                リソースパックをダウンロード
              </v-btn>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import ImageUploader from './components/ImageUploader.vue'
import LayoutEditor from './components/LayoutEditor.vue'
import WallPreview from './components/WallPreview.vue'
import BackgroundSettings from './components/BackgroundSettings.vue'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

const resolutionOptions = [
  { label: 'FHD（1920×1080）', value: { width: 1920, height: 1080 } },
  { label: 'WQHD（2560×1440）', value: { width: 2560, height: 1440 } },
]
const selectedResolution = ref(resolutionOptions[0].value)

const backgroundImage = ref(null)
const lockImage = ref(null)
const currentLayout = ref({
  main: { x: 420, y: 180, width: 1080, height: 720, rows: 3, columns: 3 },
  locked: { x: 1590, y: 180, width: 192, height: 720, rows: 6, columns: 1 },
  preparing: { x: 138, y: 180, width: 192, height: 720, rows: 6, columns: 1 },
  showLocked: true,
  showPreparing: true
})

const wallPreviewRef = ref(null)
async function onPreviewClick() {
  await nextTick()
  wallPreviewRef.value?.drawPreview()
}

function onBackgroundUpdate(image) {
  backgroundImage.value = image
  console.log('onBackgroundUpdate:', image?.slice(0, 100))
}
function onLockUpdate(image) {
  lockImage.value = image
}
function onUpdateLayout(layout) {
  // 参照を変えずに中身だけ更新
  Object.keys(currentLayout.value).forEach(key => {
    if (layout[key] !== undefined) {
      currentLayout.value[key] = layout[key]
    } else {
      delete currentLayout.value[key]
    }
  })
  Object.keys(layout).forEach(key => {
    if (!(key in currentLayout.value)) {
      currentLayout.value[key] = layout[key]
    }
  })
}

// デフォルト画像生成
function createBlackPng(width = 32, height = 32) {
  console.log('createBlackPng')
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, width, height)
  return canvas.toDataURL('image/png')
}
function createTransparentPng(width = 32, height = 32) {
  console.log('createTransparentPng')
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  // 透明なので何も描画しない
  return canvas.toDataURL('image/png')
}

const backgroundImageToUse = computed(() => backgroundImage.value || createBlackPng(selectedResolution.value.width, selectedResolution.value.height))
const lockImageToUse = computed(() => lockImage.value || createTransparentPng())

const packName = ref('')
const packDescription = ref('')
const packIcon = ref(null)

function onIconUpdate(image) {
  packIcon.value = image
}

async function downloadResourcePack() {
  const zip = new JSZip()

  // pack.mcmeta
  const mcmeta = {
    pack: {
      pack_format: 5,
      description: packDescription.value || ''
    }
  }
  zip.file('pack.mcmeta', JSON.stringify(mcmeta, null, 2))

  // pack.png（アイコン画像）
  if (packIcon.value) {
    const iconData = packIcon.value.split(',')[1]
    zip.file('pack.png', iconData ? Uint8Array.from(atob(iconData), c => c.charCodeAt(0)) : '', { binary: true })
  }

  // custom_layout.json（Wiki準拠）
  const layout = {}
  // main
  if (currentLayout.value.main) {
    layout.main = {
      x: currentLayout.value.main.x,
      y: currentLayout.value.main.y,
      width: currentLayout.value.main.width,
      height: currentLayout.value.main.height,
      rows: currentLayout.value.main.rows,
      columns: currentLayout.value.main.columns
    }
  }
  // locked
  if (currentLayout.value.locked && currentLayout.value.showLocked !== false) {
    layout.locked = {
      x: currentLayout.value.locked.x,
      y: currentLayout.value.locked.y,
      width: currentLayout.value.locked.width,
      height: currentLayout.value.locked.height,
      rows: currentLayout.value.locked.rows,
      columns: currentLayout.value.locked.columns
    }
  }
  // preparing
  if (currentLayout.value.preparing && currentLayout.value.showPreparing !== false) {
    // preparingは配列で出力
    layout.preparing = [
      {
        x: currentLayout.value.preparing.x,
        y: currentLayout.value.preparing.y,
        width: currentLayout.value.preparing.width,
        height: currentLayout.value.preparing.height,
        rows: currentLayout.value.preparing.rows,
        columns: currentLayout.value.preparing.columns
      }
    ]
  }
  layout.replaceLockedInstances = false
  zip.file('assets/seedqueue/wall/custom_layout.json', JSON.stringify(layout, null, 2))

  // sounds.json を追加
  const soundsJson = {
    lock_instance: {
      replace: true,
      sounds: []
    },
    reset_instance: {
      replace: true,
      sounds: []
    }
  }
  zip.file('assets/seedqueue/sounds.json', JSON.stringify(soundsJson, null, 2))

  // 背景画像
  if (backgroundImageToUse.value) {
    const bgData = backgroundImageToUse.value.split(',')[1]
    zip.file('assets/seedqueue/textures/gui/wall/background.png', bgData ? Uint8Array.from(atob(bgData), c => c.charCodeAt(0)) : '', { binary: true })
  }
  // ロック画像
  if (lockImageToUse.value) {
    const lockData = lockImageToUse.value.split(',')[1]
    zip.file('assets/seedqueue/textures/gui/wall/lock.png', lockData ? Uint8Array.from(atob(lockData), c => c.charCodeAt(0)) : '', { binary: true })
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  let filename = packName.value && packName.value.trim() ? packName.value.trim() + '.zip' : window.prompt('保存するファイル名を入力してください（.zip拡張子付き）', 'seedqueue-resourcepack.zip')
  if (!filename || !filename.trim()) filename = 'seedqueue-resourcepack.zip'
  if (!filename.endsWith('.zip')) filename += '.zip'
  saveAs(blob, filename)
}
</script>