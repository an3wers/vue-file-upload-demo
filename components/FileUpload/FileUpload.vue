<script setup lang="ts">
import { useFileUpload } from "./useFileUpload";

const { action } = defineProps<{
  action: string;
}>();

const selectedFile = ref<File | null>(null);
const fileInput = ref(null);

const {
  abortUpload,
  clearUploadError,
  clearUploadMessage,
  isUploading,
  startUpload,
  uploadError,
  uploadMessage,
  uploadProgress,
} = useFileUpload();

// TODO: Можно добавить эммитов для отслеживания состояния на верхнем уровне

const handleFileChange = (event: Event) => {
  const files = (event.target as HTMLInputElement).files;

  if (files) {
    selectedFile.value = files[0];
  } else {
    selectedFile.value = null;
  }

  clearUploadMessage();
  clearUploadError();
};

onUnmounted(() => {
  if (isUploading.value) {
    abortUpload();
  }
});
</script>

<template>
  <div class="file-uploader">
    <input
      type="file"
      @change="handleFileChange"
      ref="fileInput"
      class="file-input"
    />
    <div class="button-group">
      <button
        class="upload-button"
        :disabled="!selectedFile || isUploading"
        @click="() => startUpload(action, selectedFile)"
      >
        {{ isUploading ? "Загрузка..." : "Загрузить файл" }}
      </button>
      <button v-if="isUploading" @click="abortUpload" class="abort-button">
        Отменить
      </button>
    </div>
    <div v-if="isUploading" class="progress-bar-container">
      <div class="progress-bar" :style="{ width: `${uploadProgress}%` }"></div>
    </div>
    <p
      v-if="uploadMessage"
      class="upload-message"
      :class="{ error: uploadError }"
    >
      {{ uploadMessage }}
    </p>
  </div>
</template>

<style scoped>
.file-uploader {
  max-width: 300px;
  margin: 0 auto;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.file-input {
  margin-bottom: 10px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.upload-button,
.abort-button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.upload-button {
  background-color: green;
  color: white;
}

.upload-button:disabled {
  background-color: grey;
  cursor: not-allowed;
}

.abort-button {
  background-color: red;
  color: white;
}

.progress-bar-container {
  width: 100%;
  background-color: lightgray;
  border-radius: 4px;
  margin-top: 10px;
}

.progress-bar {
  height: 6px;
  background-color: green;
  border-radius: 4px;
  transition: width 0.3s ease-in-out;
}

.upload-message {
  margin-top: 10px;
  font-weight: bold;
}

.upload-message.error {
  color: red;
}
</style>
