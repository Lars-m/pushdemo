// Service Worker Registration
let swReg;

// Push Server url
const serverUrl = "";

// Update UI for subscribed status
const setSubscribedStatus = isSubscribed => {
  console.log("SETTING STATUS --> ", status);
  if (isSubscribed) {
    document.getElementById("subscribe").className = "hidden";
    document.getElementById("unsubscribe").className = "";
  } else {
    document.getElementById("subscribe").className = "";
    document.getElementById("unsubscribe").className = "hidden";
  }
};

// Register Service Worker
navigator.serviceWorker
  .register("sw.js")
  .then(registration => {
    console.log(registration);
    swReg = registration; // Reference registration globally
    swReg.pushManager.getSubscription().then(setSubscribedStatus);
  })
  .catch(console.error);

/* function taken from here:
https://www.npmjs.com/package/web-push#using-vapid-key-for-applicationserverkey
*/
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
// Get public key
const getApplicationServerKey = async () => {
  const keyFromServer = await fetch(`${serverUrl}/key`).then(res => res.text());
  return urlBase64ToUint8Array(keyFromServer);
};

const unsubscribe = async () => {
  try {
    const subscription = await swReg.pushManager.getSubscription();
    await subscription.unsubscribe();
    setSubscribedStatus(false);
  } catch (ex) {
    console.log(`Failed to unsubscribe: ${ex.message}`);
  }
};

const subscribe = async () => {
  // Check registration is available
  if (!swReg) return console.error("Service Worker Registration Not Found");

  const applicationServerKey = await getApplicationServerKey();

  try {
    const subscription = await swReg.pushManager
      .subscribe({ userVisibleOnly: true, applicationServerKey })
      .then(res => res.toJSON());
    console.log("Sub-->", subscription);
    const response = await fetch(`${serverUrl}/subscribe`, {
      method: "POST",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify(subscription)
    });
    if (response.ok) {
      setSubscribedStatus(true);
    }
  } catch (err) {
    console.error(err.message);
  }
};
