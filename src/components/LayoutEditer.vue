<template>

    <!-- mainエリア -->
    <v-card class="mb-4" elevation="1">
        <v-card-title>mainエリア</v-card-title>
        <v-card-text>
            <v-row>
                <v-col cols="6">
                    <v-text-field v-model.number="areas.main.x" label="X座標 (px)" type="number" min="0" />
                </v-col>
                <v-col cols="6">
                    <v-text-field v-model.number="areas.main.y" label="Y座標 (px)" type="number" min="0" />
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="6">
                    <v-text-field v-model.number="areas.main.width" label="幅 (px)" type="number" min="1" />
                </v-col>
                <v-col cols="6">
                    <v-text-field v-model.number="areas.main.height" label="高さ (px)" type="number" min="1" />
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="6">
                    <v-text-field v-model.number="areas.main.rows" label="行数" type="number" min="1" />
                </v-col>
                <v-col cols="6">
                    <v-text-field v-model.number="areas.main.columns" label="列数" type="number" min="1" />
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>

    <!-- lockedエリア -->
    <v-card class="mb-4" elevation="1">
        <v-card-title>
            lockedエリア
            <v-spacer />
            <v-switch v-model="showLocked" label="表示" hide-details />
        </v-card-title>
        <v-card-text v-if="showLocked">
            <v-row>
                <v-col cols="6">
                    <v-text-field v-model.number="areas.locked.x" label="X座標 (px)" type="number" min="0" />
                </v-col>
                <v-col cols="6">
                    <v-text-field v-model.number="areas.locked.y" label="Y座標 (px)" type="number" min="0" />
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="6">
                    <v-text-field v-model.number="areas.locked.width" label="幅 (px)" type="number" min="1" />
                </v-col>
                <v-col cols="6">
                    <v-text-field v-model.number="areas.locked.height" label="高さ (px)" type="number" min="1" />
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="6">
                    <v-text-field v-model.number="areas.locked.rows" label="行数" type="number" min="1" />
                </v-col>
                <v-col cols="6">
                    <v-text-field v-model.number="areas.locked.columns" label="列数" type="number" min="1" />
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>

    <!-- preparingエリア -->
    <v-card class="mb-4" elevation="1">
        <v-card-title>
            preparingエリア
            <v-spacer />
            <v-switch v-model="showPreparing" label="表示" hide-details />
        </v-card-title>
        <v-card-text v-if="showPreparing">
            <v-row>
                <v-col cols="6">
                    <v-text-field v-model.number="areas.preparing.x" label="X座標 (px)" type="number" min="0" />
                </v-col>
                <v-col cols="6">
                    <v-text-field v-model.number="areas.preparing.y" label="Y座標 (px)" type="number" min="0" />
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="6">
                    <v-text-field v-model.number="areas.preparing.width" label="幅 (px)" type="number" min="1" />
                </v-col>
                <v-col cols="6">
                    <v-text-field v-model.number="areas.preparing.height" label="高さ (px)" type="number" min="1" />
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="6">
                    <v-text-field v-model.number="areas.preparing.rows" label="行数" type="number" min="1" />
                </v-col>
                <v-col cols="6">
                    <v-text-field v-model.number="areas.preparing.columns" label="列数" type="number" min="1" />
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  screenWidth: { type: Number, required: false, default: 2560 },
  screenHeight: { type: Number, required: false, default: 1440 }
})
const emit = defineEmits(['update-layout'])

const showLocked = ref(true)
const showPreparing = ref(true)

const areas = ref({
    main: { x: 0, y: 0, width: 480, height: 480, rows: 2, columns: 2 },
    locked: { x: 0, y: 500, width: 480, height: 240, rows: 1, columns: 2 },
    preparing: { x: 500, y: 0, width: 240, height: 480, rows: 1, columns: 2 }
})

// 必要に応じて親へemit
watch([areas, showLocked, showPreparing], () => {
    // emit('update-layout', ...);
}, { deep: true })
</script>