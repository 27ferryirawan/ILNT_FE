<template>
  <div>
    <loading 
      v-model:active="isLoading"
      :is-full-page="fullPage"/>
    <form enctype="multipart/form-data" novalidate>
      <div class="dropbox">
        <input type="file" :name="uploadFieldName" :disabled="isUploading" @change="filesChange($event.target.name, $event.target.files); fileCount = $event.target.files.length" @click="$event.target.files = null; $event.target.name = null; fileName = ''; currentStatus = 0;postResponse = []"
          accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .xls, .xlsx" class="input-file">
          <p v-if="isInitial">
            Drag your file(s) here to begin<br> or click to browse
          </p>
          <p v-if="!isInitial">
            {{ fileName }}
          </p>
      </div>
    </form>
    <br>
    <br>
    <primevue-drop-down
      v-model="selectedBatch"
      :options="batch_id"
      optionLabel="name"
      :editable="true"
      placeholder="Select batch"
    />
    <br>
    <br>
    <primevue-drop-down
      v-model="selectedConfig"
      :options="config_id"
      optionLabel="name"
      :editable="true"
      placeholder="Select batch"
      :disabled="true"
    />
    <br>
    <br>
    <primevue-button label="Submit" @click="handleUpload"/>
    <br>
    <br>
    <h3>Status: {{postResponse.Status}}</h3>
    <br>
    <primevue-data-table :value="postResponse.Detail" responsiveLayout="scroll">
      <primevue-table-column field="Item" header="Item"></primevue-table-column>
      <primevue-table-column field="Success" header="Status"></primevue-table-column>
      <primevue-table-column field="Message" header="Message"></primevue-table-column>
    </primevue-data-table>
  </div>
</template>

<script>
import axios from 'axios'
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/css/index.css';

const STATUS_INITIAL = 0, STATUS_INPUTED = 1, STATUS_UPLOADING = 2, STATUS_SUCCESS = 3, STATUS_FAILED = 4, BASE_URL = "http://localhost:8000/api/inventory-data-migration/", formData = new FormData();

export default {
  name: "App",
  data() {
    return {
      batch_id: [],
      selectedBatch: "",
      finalSelectedBatch: "",
      config_id: [],
      selectedConfig: "Demo_DALS",
      finalSelectedConfig: "",

      uploadedFiles: [],
      uploadError: null,
      currentStatus: null,
      uploadFieldName: 'photos',
      postResponse: [],

      fileName: "",
      isLoading: false
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
      Loading
  },
  methods: {
    handleUpload(){
      this.isLoading = true;
      if(this.selectedBatch.length > 0){
        this.finalSelectedBatch = this.selectedBatch
      } else {
        this.finalSelectedBatch = this.selectedBatch.name
      }
      formData.append('batch_id', this.finalSelectedBatch);
      this.save(formData);
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
      return axios.post(url,formData)
      .then(response => (this.postResponse = response.data));
          // get data
          // .then(x => x.data)
          // // add url field
          // .then(x => x.map(img => Object.assign({},
          //     img, { url: `${BASE_URL}/images/${img.id}` })));
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
        });
    },
    filesChange(fieldName, fileList) {
      // const formData = new FormData();
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
  mounted(){
    this.reset();
    axios.get('http://127.0.0.1:8000/api/get-batch-id/')
      .then(response => (this.batch_id = response.data));
  }
};
</script>


<style lang="scss">
  .dropbox {
    outline: 2px dashed grey; /* the dash box */
    outline-offset: -10px;
    background: rgb(223, 223, 223);
    color: dimgray;
    padding: 10px 10px;
    min-height: 200px; /* minimum height */
    position: relative;
    cursor: pointer;
  }
  
  .input-file {
    opacity: 0; /* invisible but it's there! */
    width: 100%;
    height: 200px;
    position: absolute;
    cursor: pointer;
  }
  
  .dropbox:hover {
    background: lightblue; /* when mouse over to the drop zone, change color */
  }
  
  .dropbox p {
    font-size: 1.2em;
    text-align: center;
    padding: 50px 0;
  }
</style>