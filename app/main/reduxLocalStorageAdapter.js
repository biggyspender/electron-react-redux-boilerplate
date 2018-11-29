import pify from 'pify';
import jsonStorage from 'electron-json-storage';
const storage = pify(jsonStorage);

class ReduxLocalStorageAdapter {
  put(key, value, callback) {
    storage.set(key, value).catch(e => callback(e)).then(v => callback(null, v));
  }
  get(key,callback){
    storage.get(key).catch(e => callback(e)).then(v => callback(null, v));
  }
  del(key,callback){
    storage.remove(key).catch(e => callback(e)).then(v => callback(null, v));
  }
}

export default new ReduxLocalStorageAdapter();