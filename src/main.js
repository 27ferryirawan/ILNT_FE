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
import Toolbar from 'primevue/toolbar';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import TextArea from 'primevue/textarea';
import RadioButton from 'primevue/radiobutton';
import InputNumber from 'primevue/inputnumber';
import ToastService from 'primevue/toastservice';

import JsonExcel from "vue-json-excel3";
import router from './router'


const app = createApp(App).use(router)
app.use(PrimeVue)
app.component('primevue-drop-down', Dropdown)
app.component('primevue-file-upload', FileUpload)
app.component('primevue-data-table', DataTable)
app.component('primevue-table-column', Column)
app.component('primevue-column-group', ColumnGroup)
app.component('primevue-table-row', Row)
app.component('primevue-button', Button)
app.component('primevue-checkbox', Checkbox)
app.component('primevue-toolbar', Toolbar)
app.component('primevue-dialog', Dialog)
app.component('primevue-inputtext', InputText)
app.component('primevue-textarea', TextArea)
app.component('primevue-radiobutton', RadioButton)
app.component('primevue-inputnumber', InputNumber)
app.use(ToastService);

app.component("downloadExcel", JsonExcel);

app.mount('#app')