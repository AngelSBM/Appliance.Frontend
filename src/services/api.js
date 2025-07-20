import axios from 'axios'

const api = axios.create({
  baseURL: 'https://localhost:44333/api',
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Para desarrollo local con certificados autofirmados
if (process.env.NODE_ENV === 'development') {
  // Ignorar errores de certificados SSL en desarrollo
  //process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

// Interceptor para manejar errores
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error)
    
    // Manejar errores específicos
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('Response data:', error.response.data)
      console.error('Response status:', error.response.status)
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error('No response received:', error.request)
    } else {
      // Algo pasó al configurar la petición
      console.error('Request setup error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default api 