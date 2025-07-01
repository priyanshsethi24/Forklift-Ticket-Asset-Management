export const setData = (key, value) => {
  localStorage.setItem(key, value)
}

export const getData = (key) => {
   return localStorage.getItem(key)
}

export const removeItem = (key) => {
  localStorage.removeItem(key)
}

export const clearData = () => {
  localStorage.clear()
}