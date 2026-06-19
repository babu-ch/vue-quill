> [!WARNING]
> **`vue-quill-next` is winding down.** The original [@vueup/vue-quill](https://github.com/vueup/vue-quill) is actively maintained again — please use it instead:
> **[npm](https://www.npmjs.com/package/@vueup/vue-quill)** · **[repo](https://github.com/vueup/vue-quill)**.
> Both target **Quill v2**, so migrating is mostly a package/import rename.


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

