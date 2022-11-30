import { createApp } from 'vue'

import App from './App.vue'

import PrimeVue from 'primevue/config'

import 'primevue/resources/primevue.min.css'
import 'primevue/resources/themes/rhea/theme.css'
import 'primeicons/primeicons.css' 
import '/node_modules/primeflex/primeflex.css'

import Dropdown from 'primevue/dropdown'
import FileUpload from 'primevue/fileupload';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';     //optional for column grouping
import Row from 'primevue/row';    
import Button from 'primevue/button';    
import Checkbox from 'primevue/checkbox';

import JsonExcel from "vue-json-excel3";


const app = createApp(App)
app.use(PrimeVue)
app.component('primevue-drop-down', Dropdown)
app.component('primevue-file-upload', FileUpload)
app.component('primevue-data-table', DataTable)
app.component('primevue-table-column', Column)
app.component('primevue-column-group', ColumnGroup)
app.component('primevue-table-row', Row)
app.component('primevue-button', Button)
app.component('primevue-checkbox', Checkbox)

app.component("downloadExcel", JsonExcel);

app.mount('#app')