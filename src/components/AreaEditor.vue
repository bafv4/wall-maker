<template>
    <v-card class="mb-4 pa-2 background-color-surface" elevation="0">
        <v-card-title class="text-subtitle-1 vertical-align-middle">
            <span :style="{
                display: 'inline-block',
                width: '16px',
                height: '16px',
                'border-radius': '50%',
                'background-color': color,
                'margin-right': '8px',
                'vertical-align': 'middle'
            }"></span>
            {{ label }}
            <v-btn icon size="x-small" class="ml-2" title="左右中央" @click.stop="centerHorizontal">
                <v-icon>mdi-arrow-left-right</v-icon>
            </v-btn>
            <v-btn icon size="x-small" class="ml-1" title="上下中央" @click.stop="centerVertical">
                <v-icon>mdi-arrow-up-down</v-icon>
            </v-btn>
            <template v-if="showToggle">
                <v-spacer />
                <v-switch v-model="showVal" label="表示" hide-details @update:modelValue="toggleShow" />
            </template>
        </v-card-title>
        <v-card-text v-if="!showToggle || showVal">
            <v-row>
                <v-col cols="6">
                    <NumberInput label="X座標 (px)" v-model="local.x" :min="0" @update:modelValue="update" />
                </v-col>
                <v-col cols="6">
                    <NumberInput label="Y座標 (px)" v-model="local.y" :min="0" @update:modelValue="update" />
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="6">
                    <NumberInput label="幅 (px)" v-model="local.width" :min="1" :max="screenWidth"
                        @update:modelValue="update" />
                </v-col>
                <v-col cols="6">
                    <NumberInput label="高さ (px)" v-model="local.height" :min="1" :max="screenHeight"
                        @update:modelValue="update" />
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="6">
                    <NumberInput label="タテ" v-model="local.rows" :min="1" @update:modelValue="update" />
                </v-col>
                <v-col cols="6">
                    <NumberInput label="ヨコ" v-model="local.columns" :min="1" @update:modelValue="update" />
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import NumberInput from './NumberInput.vue'

const props = defineProps({
    areaKey: { type: String, required: true },
    area: { type: Object, required: true },
    color: { type: String, required: true },
    label: { type: String, required: true },
    show: { type: Boolean, default: true },
    showToggle: { type: Boolean, default: false },
    screenWidth: { type: Number, default: 2560 },
    screenHeight: { type: Number, default: 1440 }
})
const emit = defineEmits(['update', 'update:show'])

const local = ref({ ...props.area })
watchEffect(() => { Object.assign(local.value, props.area) })
const update = () => emit('update', { ...local.value })

const showVal = ref(props.show)
watchEffect(() => { showVal.value = props.show })
const toggleShow = (v) => emit('update:show', v)

const centerHorizontal = () => {
    local.value.x = Math.round((props.screenWidth - local.value.width) / 2)
    update()
}
const centerVertical = () => {
    local.value.y = Math.round((props.screenHeight - local.value.height) / 2)
    update()
}
</script>
