// Service Worker

// Listen for notifications

self.addEventListener("push",(e) =>{
  self.registration.showNotification("Service Worker Demo",{body:e.data.text()})
})
