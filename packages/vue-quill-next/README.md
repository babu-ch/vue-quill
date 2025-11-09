> 🧩 **Maintained fork** of [vueup/vue-quill](https://github.com/vueup/vue-quill)
>
> ✨ Updated for **Quill v2** compatibility.
>
> If you have @types/quill installed, uninstall it, as it is no longer needed


# usage

main.ts
```ts
import { createApp } from 'vue'
import App from './App.vue'
import {QuillEditor} from 'vue-quill-next'
import 'vue-quill-next/dist/vue-quill.snow.css';

const app = createApp(App)

app.component('QuillEditor', QuillEditor);

app.mount('#app')
```

App.vue
```html
<div id="app">
  <quill-editor theme="snow" />
</div>
```

