<template>
  <div>
    <div class="card">
      <CustomToast />
      <loading v-model:active="isLoading" :is-full-page="true" />
      <primevue-toolbar class="mb-4">
        <template #start>
          <primevue-button label="New" icon="pi pi-plus" class="p-primevue-button-success mr-2" @click="openNew" />
          <primevue-button label="Delete" icon="pi pi-trash" class="p-primevue-button-danger"
            @click="confirmDeleteSelected" :disabled="!selectedConfigs || !selectedConfigs.length" />
        </template>

        <template #end>
          <primevue-file-upload mode="basic" accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .xls, .xlsx" :maxFileSize="1000000" label="Import" chooseLabel="Import"
            class="mr-2 inline-block" :customUpload="true" @uploader="uploadExcel"/>
          <download-excel :data="configs">
            <primevue-button label="Export" icon="pi pi-upload" class="p-primevue-button-help"/>
          </download-excel>
        </template>
      </primevue-toolbar>

      <primevue-data-table ref="dt" :value="configs" v-model:selection="selectedConfigs" dataKey="row_id"
        :paginator="true" :rows="10" :filters="filters"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageprimevue-drop-down"
        :rowsPerPageOptions="[5, 10, 25]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} configs" responsiveLayout="scroll">
        <template #header>
          <div class="table-header flex flex-primevue-table-column md:flex-row md:justiify-content-between">
            <h5 class="mb-2 md:m-0 p-as-md-center">Manage Config</h5>
            <span class="p-input-icon-left">
              <i class="pi pi-search"> </i>
              <primevue-inputtext v-model="filters['global'].value" placeholder="Search..." />
            </span>
          </div>
        </template>
        
        <primevue-table-column selectionMode="multiple" style="width: 3rem" :exportable="false"></primevue-table-column>
        <primevue-table-column field="site" header="Site" :sortable="true"
          style="min-width:8rem"></primevue-table-column>
        <primevue-table-column field="config_name" header="Config Name" :sortable="true"
          style="min-width:12rem"></primevue-table-column>
        <primevue-table-column field="username" header="Username" :sortable="true" style="min-width:8rem">
        </primevue-table-column>
        <primevue-table-column field="password" header="Password" :sortable="true"
          style="min-width:8rem"></primevue-table-column>
        <primevue-table-column field="url" header="URL" :sortable="true" style="min-width:6rem"></primevue-table-column>

        <primevue-table-column :exportable="false" style="min-width:8rem">
          <template #body="slotProps">
            <primevue-button icon="pi pi-pencil" class="p-primevue-button-rounded p-primevue-button-success mr-2"
              @click="editConfig(slotProps.data)" />
            <primevue-button icon="pi pi-trash" class="p-primevue-button-rounded p-primevue-button-warning"
              @click="confirmDeleteConfig(slotProps.data)" />
          </template>
        </primevue-table-column>
      </primevue-data-table>
    </div>

    <primevue-dialog v-model:visible="configDialog" :style="{ width: '450px' }" header="Config Details" :modal="true"
      class="p-fluid">
      <img src="https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png" :alt="config.image"
        class="config-image" v-if="config.image" />
      <div class="field">
        <label for="name">Site</label>
        <primevue-inputtext id="name" v-model.trim="config.site" required="true" autofocus
          :class="{ 'p-invalid': submitted && !config.site }" />
        <small class="p-error" v-if="(submitted && !config.site)">Site is required.</small>
      </div>

      <div class="field">
        <label for="name">Config Name</label>
        <primevue-inputtext id="name" v-model.trim="config.config_name" required="true" autofocus
          :class="{ 'p-invalid': submitted && !config.config_name }" />
        <small class="p-error" v-if="(submitted && !config.config_name)">Config Name is required.</small>
      </div>

      <div class="field">
        <label for="name">Username</label>
        <primevue-inputtext id="name" v-model.trim="config.username" required="true" autofocus
          :class="{ 'p-invalid': submitted && !config.username }" />
        <small class="p-error" v-if="(submitted && !config.username)">Username is required.</small>
      </div>

      <div class="field">
        <label for="name">Password</label>
        <primevue-inputtext id="name" v-model.trim="config.password" required="true" autofocus
          :class="{ 'p-invalid': submitted && !config.password }" />
      </div>

      <div class="field">
        <label for="name">URL</label>
        <primevue-inputtext id="name" v-model.trim="config.url" required="true" autofocus
          :class="{ 'p-invalid': submitted && !config.url }" />
        <small class="p-error" v-if="(submitted && !config.url)">URL is required.</small>
      </div>

      <template #footer>
        <primevue-button label="Cancel" icon="pi pi-times" class="p-primevue-button-text" @click="hideDialog" />
        <primevue-button label="Save" icon="pi pi-check" class="p-primevue-button-text" @click="saveConfig" />
      </template>
    </primevue-dialog>

    <primevue-dialog v-model:visible="deleteConfigDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="config">Are you sure you want to delete <b>{{ config.name }}</b>?</span>
      </div>
      <template #footer>
        <primevue-button label="No" icon="pi pi-times" class="p-primevue-button-text"
          @click="deleteConfigDialog = false" />
        <primevue-button label="Yes" icon="pi pi-check" class="p-primevue-button-text" @click="deleteConfig" />
      </template>
    </primevue-dialog>

    <primevue-dialog v-model:visible="deleteConfigsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="config">Are you sure you want to delete the selected configs?</span>
      </div>
      <template #footer>
        <primevue-button label="No" icon="pi pi-times" class="p-primevue-button-text"
          @click="deleteConfigsDialog = false" />
        <primevue-button label="Yes" icon="pi pi-check" class="p-primevue-button-text" @click="deleteSelectedConfigs" />
      </template>
    </primevue-dialog>
  </div>
</template>

<script>
import { FilterMatchMode } from 'primevue/api';
// import ConfigService from './service/ConfigService';
import axios from 'axios'
import CustomToast from "../components/CustomToast.vue";
import Loading from 'vue-loading-overlay';
// import 'vue-loading-overlay/dist/css/index.css';
// import Swal from 'sweetalert2'
const formData = new FormData();

export default {
  components: {
    CustomToast,
    Loading
  },
  data() {
    return {
      configs: null,
      configDialog: false,
      deleteConfigDialog: false,
      deleteConfigsDialog: false,
      config: {},
      selectedConfigs: null,
      filters: {},
      submitted: false,
      statuses: [
        { label: 'INSTOCK', value: 'instock' },
        { label: 'LOWSTOCK', value: 'lowstock' },
        { label: 'OUTOFSTOCK', value: 'outofstock' }
      ],

      insertResponse: {},
      isLoading: false
    }
  },
  configService: null,
  created() {
    // this.configService = new ConfigService();
    this.initFilters();
  },
  mounted() {
    // this.configService.getConfigs().then(data => this.configs = data);
    this.getConfigData();
  },
  methods: {
    getConfigData() {
      return axios.get('http://localhost:8000/api/read-config')
        .then(response => (this.configs = response.data));
    },
    formatCurrency(value) {
      if (value)
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      return;
    },
    openNew() {
      this.config = {};
      this.submitted = false;
      this.configDialog = true;
    },
    hideDialog() {
      this.configDialog = false;
      this.submitted = false;
    },
    insertConfig() {
      const getData = async () => {
        this.isLoading = true;
        const response = await axios.post('http://localhost:8000/api/create-config', this.config)
        if (response.data.Success) {
          await this.getConfigData()
            .then(this.isLoading = false)
            .then(this.$toast.add({ severity: 'success', summary: 'Successful', detail: response.data.Status, life: 5000 }));
        }
      };
      getData();
    },
    updateConfig() {
      const getData = async () => {
        this.isLoading = true;
        const response = await axios.post('http://localhost:8000/api/update-config', this.config)
        if (response.data.Success) {
          await this.getConfigData()
            .then(this.isLoading = false)
            .then(this.$toast.add({ severity: 'success', summary: 'Successful', detail: response.data.Status, life: 5000 }));
        }
      };
      getData();
    },
    saveConfig() {
      this.submitted = true;
      console.log(this.config.row_id)
      if (this.config.site.trim()) {
        if (this.config.row_id) {
          this.updateConfig();
        }
        else {
          this.insertConfig();
        }

        this.configDialog = false;
        this.config = {};
      }
    },
    importConfig(formData){
      const getData = async () => {
        this.isLoading = true;
        const response = await axios.post('http://localhost:8000/api/import-config', formData)
        if (response.data.Success) {
          await this.getConfigData()
            .then(this.isLoading = false)
            .then(this.$toast.add({ severity: 'success', summary: 'Successful', detail: response.data.Status, life: 5000 }));
        }
      };
      getData();
    },
    uploadExcel(event) {
      var fileList = event.files;
      if (!fileList.length) return;
      Array
      .from(Array(fileList.length).keys())
      .map(x => {
        formData.append('files', fileList[x]);
      }); 
      
      this.importConfig(formData);
    },
    deleteConfig() {
      this.deleteConfigDialog = false;
      const getData = async () => {
        this.isLoading = true;
        const response = await axios.post('http://localhost:8000/api/delete-config', { row_id: this.config.row_id })
        if (response.data.Success) {
          await this.getConfigData()
            .then(this.isLoading = false)
            .then(this.$toast.add({ severity: 'success', summary: 'Successful', detail: response.data.Status, life: 5000 }));
        }
      };
      getData();
    },
    editConfig(config) {
      this.config = { ...config };
      this.configDialog = true;
    },
    confirmDeleteConfig(config) {
      this.config = config;
      this.deleteConfigDialog = true;
    },
    findIndexById(row_id) {
      let index = -1;
      for (let i = 0; i < this.configs.length; i++) {
        if (this.configs[i].row_id === row_id) {
          index = i;
          break;
        }
      }

      return index;
    },
    createId() {
      let row_id = '';
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (var i = 0; i < 5; i++) {
        row_id += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return row_id;
    },
    exportCSV() {
      this.$refs.dt.exportCSV();
    },
    confirmDeleteSelected() {
      this.deleteConfigsDialog = true;
    },
    deleteSelectedConfigs() {
      var row_ids = [];
      console.log(this.selectedConfigs[0].row_id)
      for (let i = 0; i < this.selectedConfigs.length; i++) {
        row_ids.push(this.selectedConfigs[i].row_id);
      }

      this.deleteConfigsDialog = false;
      const getData = async () => {
        this.isLoading = true;
        const response = await axios.post('http://localhost:8000/api/batch-delete-config', { batch_row_id: row_ids })
        if (response.data.Success) {
          await this.getConfigData()
            .then(this.isLoading = false)
            .then(this.$toast.add({ severity: 'success', summary: 'Successful', detail: response.data.Status, life: 5000 }));
        }
      };
      getData();
    },
    initFilters() {
      this.filters = {
        'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media screen and (max-width: 960px) {
    align-items: start;
  }
}

.config-image {
  width: 50px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

.p-dialog .config-image {
  width: 50px;
  margin: 0 auto 2rem auto;
  display: block;
}

.confirmation-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media screen and (max-width: 960px) {
  ::v-deep(.p-toolbar) {
    flex-wrap: wrap;

    .p-button {
      margin-bottom: 0.25rem;
    }
  }
}
</style>