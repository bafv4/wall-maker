<template>
  <v-card flat>
    <AreaEditor
      v-for="key in ['main', 'locked', 'preparing']"
      :key="key"
      :area-key="key"
      :area="areas[key]"
      :color="areaColors[key]"
      :label="areaLabels[key]"
      v-model:show="areaShows[key]"
      :show-toggle="key !== 'main'"
      :screen-width="screenWidth"
      :screen-height="screenHeight"
      @update="updateArea(key, $event)"
    />
  </v-card>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import AreaEditor from './AreaEditor.vue'
import NumberInput from './NumberInput.vue'

const areaColors = {
  main: '#2196f3',
  locked: '#ff9800',
  preparing: '#4caf50'
}
const areaLabels = {
  main: 'mainエリア',
  locked: 'lockedエリア',
  preparing: 'preparingエリア'
}

const props = defineProps({
  screenWidth: { type: Number, default: 2560 },
  screenHeight: { type: Number, default: 1440 }
})
const emit = defineEmits(['update-layout'])

const areaShows = reactive({
  main: true,
  locked: true,
  preparing: true
})

const areas = reactive({
  main: { x: 420, y: 180, width: 1080, height: 720, rows: 3, columns: 3 },
  locked: { x: 1590, y: 180, width: 192, height: 720, rows: 6, columns: 1 },
  preparing: { x: 138, y: 180, width: 192, height: 720, rows: 6, columns: 1 },
})

function updateArea(key, val) {
  Object.assign(areas[key], val)
}

watch([areas, areaShows], () => {
  emit('update-layout', {
    main: areas.main,
    locked: areaShows.locked ? areas.locked : undefined,
    preparing: areaShows.preparing ? areas.preparing : undefined,
    showLocked: areaShows.locked,
    showPreparing: areaShows.preparing
  })
}, { deep: true, immediate: true })
</script>