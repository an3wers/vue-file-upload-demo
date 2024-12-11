export const useFileUpload = () => {
  const isUploading = ref(false);
  const uploadProgress = ref(0);
  const abortController = ref<AbortController | null>(null);
  const uploadError = ref(false);
  const uploadMessage = ref("");

  const clearUploadMessage = () => {
    uploadMessage.value = "";
  };

  const clearUploadError = () => {
    uploadError.value = false;
  };

  const _uploadFile = (
    file: File,
    url: string,
    onProgress: (value: number) => void
  ) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      abortController.value = new AbortController();
      const formData = new FormData();

      formData.append("file", file);

      xhr.open("POST", url, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(xhr.response);
        } else {
          reject(new Error("Ошибка при загрузке файла"));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Произошла ошибка при загрузке файла"));
      };

      xhr.onabort = () => {
        reject(new Error("Загрузка файла была отменена"));
      };

      abortController.value.signal.addEventListener("abort", () => xhr.abort());

      xhr.send(formData);
    });
  };

  const startUpload = async (url: string, file: File | null) => {
    if (!file) {
      uploadMessage.value = "Пожалуйста, выберите файл для загрузки.";
      uploadError.value = true;
      return;
    }

    isUploading.value = true;
    uploadProgress.value = 0;

    try {
      await _uploadFile(file, url, (progress) => {
        uploadProgress.value = progress;
      });
      uploadMessage.value = "Файл успешно загружен!";
      uploadError.value = false;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        uploadMessage.value = "Загрузка файла была отменена.";
      } else if (error instanceof Error) {
        uploadMessage.value = error.message;
      }
      uploadError.value = true;
    } finally {
      isUploading.value = false;
      abortController.value = null;
    }
  };

  const abortUpload = () => {
    if (abortController.value) {
      abortController.value.abort();
      abortController.value = null;
    }
  };

  return {
    startUpload,
    abortUpload,
    clearUploadMessage,
    clearUploadError,
    isUploading,
    uploadProgress,
    uploadError,
    uploadMessage,
  };
};
