const webpush = require('web-push')
const Storage = require("node-storage")

const store = new Storage(`${__dirname}/db.json`);
const vapid = require('./vapid.json')

// Configure web-push
webpush.setVapidDetails(
  'mailto:lam@cphbusiness.dk',
  vapid.publicKey,
  vapid.privateKey
)

/* INFO 
Generate the vapid keys in a file vapid.json (only once) like this:
npx web-push generate-vapid-keys --json >vapid.jso
*/

let subscriptions = store.get("subscriptions") || [];

module.exports.addSubscription = (sub) => {
  subscriptions.push(sub);
  store.put("subscriptions",subscriptions)
}

module.exports.send = (msg)=>{
  //console.log("PUSH sent: ",msg);
  const notifications = [];
  subscriptions.forEach((sub,i) =>{
    const p = webpush.sendNotification(sub,msg)
    .catch(status=>{
      console.log("Code - ",status.statusCode)
      if(status.statusCode === 410){  //410 == gone
        subscriptions[i]['delete']=true
      }
      return null //to prevent promise.all from stop on this error
    })
    notifications.push(p);
  })
  Promise.all(notifications)
  .then(()=>{
    subscriptions = subscriptions.filter( subscription => !subscription.delete )
    console.log("Count",subscriptions.length)
    // Persist 'cleaned' subscriptions
    store.put('subscriptions', subscriptions)
  })
}


const vapidPublicKey = require('./vapid.json').publicKey;
module.exports.getKey = () => vapidPublicKey;


