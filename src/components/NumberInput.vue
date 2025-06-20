<template>
  <div class="number-input-root">
    <v-btn icon size="x-small" class="circle-btn"
      @mousedown="start(-step)" @mouseup="stop" @mouseleave="stop"
      @touchstart="start(-step)" @touchend="stop"
    >
      <v-icon>mdi-minus</v-icon>
    </v-btn>
    <v-text-field
      :model-value="modelValue"
      @update:model-value="update"
      :label="label"
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      :min="min"
      :max="max"
      hide-details
      dense
      class="no-spin"
      style="width:60px;text-align:center;margin:0 4px;"
    />
    <v-btn icon size="x-small" class="circle-btn"
      @mousedown="start(step)" @mouseup="stop" @mouseleave="stop"
      @touchstart="start(step)" @touchend="stop"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: -Infinity },
  max: { type: Number, default: Infinity },
  step: { type: Number, default: 1 },
  label: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

const update = (v) => {
  let val = Number(v)
  if (isNaN(val)) val = props.min
  val = Math.max(props.min, Math.min(props.max, val))
  emit('update:modelValue', val)
}

let interval = null, timeout = null
const start = (delta) => {
  update(props.modelValue + delta)
  timeout = setTimeout(() => {
    interval = setInterval(() => update(props.modelValue + delta), 50)
  }, 400)
}
const stop = () => {
  clearTimeout(timeout)
  clearInterval(interval)
}
</script>

<style scoped>
.number-input-root {
  display: flex;
  align-items: center;
}
.circle-btn {
  border-radius: 50% !important;
  min-width: 28px !important;
  width: 28px !important;
  height: 28px !important;
  padding: 0 !important;
}
.no-spin input[type='number'],
.no-spin input[type='text']::-webkit-inner-spin-button,
.no-spin input[type='text']::-webkit-outer-spin-button {
  -webkit-appearance: none !important;
  appearance: none !important;
  margin: 0 !important;
}
.no-spin input[type='number'],
.no-spin input[type='text'] {
  -moz-appearance: textfield !important;
  appearance: textfield !important;
}
</style> 