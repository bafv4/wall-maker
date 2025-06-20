/// <reference types="vite/client" />

// Vue SFC用型定義
declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
