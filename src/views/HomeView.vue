<template>
  <div>
    <loading v-model:active="isLoading" :is-full-page="true" />
    <form enctype="multipart/form-data" novalidate>
      <div class="dropbox">
        <input required type="file" :name="uploadFieldName" :disabled="isUploading"
          @change="filesChange($event.target.name, $event.target.files); fileCount = $event.target.files.length"
          @click="$event.target.files = null; $event.target.name = null; fileName = ''; currentStatus = 0; postResponse = []; deleteFormData()"
          accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .xls, .xlsx"
          class="input-file">
        <p v-if="isInitial">
          Drag your excel file here <br> or click to browse
        </p>
        <p v-if="!isInitial">
          {{ fileName }}
        </p>
      </div>
    </form>
    <br>
    <br>
    <primevue-drop-down v-model="selectedConfig" :options="configs" optionLabel="config_detail" :editable="true"
      placeholder="Select config" :required="true" style="width:33rem"/>
    <br>
    <br>
    <primevue-drop-down v-model="selectedBatch" :options="batch_id" optionLabel="name" :editable="true"
      placeholder="Select batch" :required="true" style="width:33rem"/>
    <br>
    <br>
    <div class="field-checkbox">
      <primevue-checkbox inputId="binary" v-model="isZeroCost" :binary="true" />
      <label for="binary">Allow Zero Cost</label>
    </div>
    <br>
    <br>
    <primevue-button label="Submit" @click="handleUpload" style="width:33rem"/>
    <br>
    <br>
    <download-excel :data="postResponse.DetailAll">
      <primevue-button label="Excel Report" name="{{postResponse.Status}}'.xls'" :disabled="!isSuccess" style="width:33rem"/>
    </download-excel>
    <br>
    <h3>Status: {{ postResponse.Status }}</h3>
    <primevue-data-table :value="postResponse.Detail" responsiveLayout="scroll">
      <primevue-table-column field="Item" header="Item"></primevue-table-column>
      <primevue-table-column field="Message" header="Message"></primevue-table-column>
    </primevue-data-table>
  </div>
</template>

<script>
import axios from 'axios'
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/css/index.css';
import Swal from 'sweetalert2'


const STATUS_INITIAL = 0, STATUS_INPUTED = 1, STATUS_UPLOADING = 2, STATUS_SUCCESS = 3, STATUS_FAILED = 4, BASE_URL = "http://localhost:8000/api/inventory-data-migration/", formData = new FormData();

export default {
  name: "App",
  data() {
    return {
      batch_id: [],
      configs: [],
      selectedBatch: "",
      selectedConfig: "",
      finalSelectedBatch: "",
      config_id: [],
      finalSelectedConfig: "",

      uploadedFiles: [],
      uploadError: null,
      currentStatus: null,
      uploadFieldName: 'photos',
      postResponse: [],

      fileName: "",
      isLoading: false,
      isZeroCost: false
    };
  },
  computed: {
    isInitial() {
      return this.currentStatus === STATUS_INITIAL;
    },
    isInputed() {
      return this.currentStatus === STATUS_INPUTED;
    },
    isUploading() {
      return this.currentStatus === STATUS_UPLOADING;
    },
    isSuccess() {
      return this.currentStatus === STATUS_SUCCESS;
    },
    isFailed() {
      return this.currentStatus === STATUS_FAILED;
    }
  },
  components: {
    Loading,
    // Swal
  },
  methods: {
    deleteFormData() {
      formData.delete('files');
    },
    handleUpload() {

      // console.log(this.selectedBatch.length);
      if (this.selectedBatch.length == 0) {
        this.finalSelectedBatch = this.selectedBatch.name
      } else {
        this.finalSelectedBatch = this.selectedBatch
      }

      if ((this.finalSelectedBatch == "" || this.finalSelectedBatch == null) && !formData.has('files')) {
        Swal.fire({
          icon: 'error',
          title: 'Field Required',
          text: 'Please fill the batch and the excel file',
        })
      } else if ((this.finalSelectedBatch == "" || this.finalSelectedBatch == null) && formData.has('files')) {
        Swal.fire({
          icon: 'error',
          title: 'Field Required',
          text: 'Please fill the batch',
        })
      } else if (!(this.finalSelectedBatch == "" || this.finalSelectedBatch == null) && !formData.has('files')) {
        Swal.fire({
          icon: 'error',
          title: 'Field Required',
          text: 'Please fill the excel file',
        })
      } else {
        this.isLoading = true;
        formData.append('batch_id', this.finalSelectedBatch);
        formData.append('is_zero_cost', this.isZeroCost == false ? 0 : 1);
        formData.append('config_id', this.selectedConfig.row_id);
        this.save(formData);
      }
    },
    reset() {
      // reset form to initial state
      this.currentStatus = STATUS_INITIAL;
      this.uploadedFiles = [];
      this.uploadError = null;
    },
    upload(formData) {
      this.currentStatus = STATUS_UPLOADING;
      const url = `${BASE_URL}`;
      return axios.post(url, formData)
        .then(response => (this.postResponse = response.data));
    },
    save(formData) {
      // upload data to the server
      this.upload(formData)
        .then(x => {
          this.uploadedFiles = [].concat(x);
          this.currentStatus = STATUS_SUCCESS;
          this.isLoading = false;
        })
        .catch(err => {
          this.uploadError = err.response;
          this.currentStatus = STATUS_FAILED;
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Upload error',
            text: 'Upload error',
          })
        });
    },
    filesChange(fieldName, fileList) {
      if (!fileList.length) return;
      Array
        .from(Array(fileList.length).keys())
        .map(x => {
          formData.append('files', fileList[x]);
        });

      this.currentStatus = STATUS_INPUTED;
      this.fileName = fileList[0].name;
    }
  },
  mounted() {
    this.reset();
    axios.get('http://127.0.0.1:8000/api/get-batch-id/')
      .then(response => (this.batch_id = response.data));
    axios.get('http://127.0.0.1:8000/api/read-config/')
    .then(response => (this.configs = response.data));
  }
};
</script>


<style lang="scss">
.dropbox {
  outline: 2px dashed grey;
  /* the dash box */
  outline-offset: -10px;
  background: #d1edff;
  color: dimgray;
  padding: 10px 10px;
  min-height: 200px;
  /* minimum height */
  position: relative;
  cursor: pointer;
}

.input-file {
  opacity: 0;
  /* invisible but it's there! */
  width: 100%;
  height: 200px;
  position: absolute;
  cursor: pointer;
}

.dropbox:hover {
  background: lightblue;
  /* when mouse over to the drop zone, change color */
}

.dropbox p {
  font-size: 1.2em;
  text-align: center;
  padding: 50px 0;
}
</style>