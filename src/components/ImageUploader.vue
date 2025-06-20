<template>
    <div>
      <v-file-input
        :label="label"
        accept="image/*"
        v-model="file"
        show-size
        prepend-icon="mdi-image"
      />
      <v-dialog v-model="showCropper" max-width="600px">
        <v-card>
          <v-card-title>画像のトリミング</v-card-title>
          <v-card-text>
            <vue-cropper
              ref="cropper"
              :src="imageUrl"
              :aspect-ratio="aspectRatio"
              :view-mode="1"
              style="width: 100%; max-width: 500px; height: 350px;"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" @click="cropImage">この範囲で決定</v-btn>
            <v-btn text @click="showCropper = false">キャンセル</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  import VueCropper from 'vue-cropperjs'
  import 'cropperjs/dist/cropper.css'
  
  const props = defineProps({
    label: { type: String, default: '画像をアップロード' },
    aspectRatio: { type: Number, default: NaN }
  })
  const emit = defineEmits(['update:image'])
  
  const file = ref(null)
  const imageUrl = ref(null)
  const cropper = ref(null)
  const showCropper = ref(false)
  
  watch(file, (newFile) => {
    if (!newFile || (Array.isArray(newFile) && newFile.length === 0)) {
      imageUrl.value = null
      emit('update:image', null)
      return
    }
    const targetFile = Array.isArray(newFile) ? newFile[0] : newFile
    if (!targetFile) return
    const reader = new FileReader()
    reader.onload = (e) => {
      imageUrl.value = e.target.result
      showCropper.value = true // 画像選択時にモーダルを開く
    }
    reader.readAsDataURL(targetFile)
  })
  
  function cropImage() {
    if (!cropper.value) return
    const canvas = cropper.value.getCroppedCanvas()
    if (canvas) {
      const pngDataUrl = canvas.toDataURL('image/png')
      emit('update:image', pngDataUrl)
      showCropper.value = false // モーダルを閉じる
    }
  }
  </script>