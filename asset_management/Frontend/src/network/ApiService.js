// import { toast } from 'react-toastify'
// import { removeItem } from '../utils/localStorageHandler'
import http from './HttpService'

export const getPublic = async(url, config = {}) => {
    try {
        const response = await http.get(url, {...config, withAuth: false}) ;
        return response.data ;
    } catch (error) {
        handleError(error)
    }
}

export const getProtected = async(url, config = {}) => {
    try {
        const response = await http.get(url, {...config, withAuth: true}) ; 
        // console.log('response = ' , response)  ;
        return response.data
    } catch (error) {
        if(error.status === 401) 
        {
            localStorage.clear() ; 
            // window.dispatchEvent(new Event("localStorageChanged"));
        }
        handleError(error)
    }
}

export const postPublic = async(url, data, config = {}) => {
    try {
        const response = await http.post(url, data, {...config, withAuth: false})
        return response.data
    } catch (error) {
        handleError(error)
    }
}

export const postProtected = async(url, data, config = {}) => {
    try {
        const response = await http.post(url, data, {...config, withAuth: true})
        return response.data
    } catch (error) {
        handleError(error)
    }
}

export const patchProtected = async(url, data, config = {}) => {
    try {
        const response = await http.patch(url, data, {...config, withAuth: true})
        return response.data
    } catch (error) {
        handleError(error)
    }
}

export const deleteProtected = async(url, config = {}) => {
    try {
        const response = await http.delete(url, {...config, withAuth: true})
        return response.data
    } catch (error) {
        handleError(error)
    }
}

const handleError = (error) => {
    // console.log('handle error function: ', error)

    // if (error.response) {
    //     if(error.response.data.code === "token_not_valid"){
    //         const {message} = error?.response?.data?.message?.[0]
    //         message && toast.error(message)
    //         removeItem('accessToken')
    //         window.dispatchEvent(new Event("localStorageChanged"));
    //     }
    //     console.error('API Error: ', error.response.status, error.response.data)
    // } else {
    //     console.error('Network Error: ', error.message)
    // }
    throw error
}