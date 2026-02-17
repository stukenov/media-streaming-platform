import axios from 'axios'

const axiosInstance = axios.create()

// Добавляем перехватчик для повторных попыток
axiosInstance.interceptors.response.use(undefined, async (error) => {
  const config = error.config

  if (!config || !config.retry) {
    return Promise.reject(error)
  }

  config.retry -= 1

  const delayRetry = new Promise(resolve => {
    setTimeout(resolve, 1000)
  })

  await delayRetry

  return axiosInstance(config)
})

// Конфигурация для загрузки файлов
export const uploadFile = async (url: string, file: File, onProgress?: (progress: number) => void) => {
  try {
    const response = await axiosInstance.put(url, file, {
      headers: {
        'Content-Type': file.type
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!)
        onProgress?.(percentCompleted)
      },
      retry: 3,
      timeout: 30000
    })
    return response
  } catch (error) {
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      throw new Error('Превышено время ожидания загрузки')
    }
    throw error
  }
}

export default axiosInstance 