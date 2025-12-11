
Usage
Create a new instance

To create a new instance of the MMKV storage, use the MMKV constructor. It is recommended that you re-use this instance throughout your entire app instead of creating a new instance each time, so export the storage object.
Default

import { createMMKV } from 'react-native-mmkv'

export const storage = createMMKV()

This creates a new storage instance using the default MMKV storage ID (mmkv.default).
App Groups or Extensions

If you want to share MMKV data between your app and other apps or app extensions in the same group, open Info.plist and create an AppGroupIdentifier key with your app group's value. MMKV will then automatically store data inside the app group which can be read and written to from other apps or app extensions in the same group by making use of MMKV's multi processing mode. See Configuring App Groups.
Customize

import { createMMKV } from 'react-native-mmkv'

export const storage = createMMKV({
  id: `user-${userId}-storage`,
  path: `${USER_DIRECTORY}/storage`,
  encryptionKey: 'hunter2',
  mode: 'multi-process',
  readOnly: false
})

This creates a new storage instance using a custom MMKV storage ID. By using a custom storage ID, your storage is separated from the default MMKV storage of your app.

The following values can be configured:

    id: The MMKV instance's ID. If you want to use multiple instances, use different IDs. For example, you can separate the global app's storage and a logged-in user's storage. (required if path or encryptionKey fields are specified, otherwise defaults to: 'mmkv.default')
    path: The MMKV instance's root path. By default, MMKV stores file inside $(Documents)/mmkv/. You can customize MMKV's root directory on MMKV initialization (documentation: iOS / Android)
    encryptionKey: The MMKV instance's encryption/decryption key. By default, MMKV stores all key-values in plain text on file, relying on iOS's/Android's sandbox to make sure the file is encrypted. Should you worry about information leaking, you can choose to encrypt MMKV. (documentation: iOS / Android)
    mode: The MMKV's process behaviour - when set to multi-process, the MMKV instance will assume data can be changed from the outside (e.g. App Clips, Extensions or App Groups).
    readOnly: Whether this MMKV instance should be in read-only mode. This is typically more efficient and avoids unwanted writes to the data if not needed. Any call to set(..) will throw.

Set

storage.set('user.name', 'Marc')
storage.set('user.age', 21)
storage.set('is-mmkv-fast-asf', true)

Get

const username = storage.getString('user.name') // 'Marc'
const age = storage.getNumber('user.age') // 21
const isMmkvFastAsf = storage.getBoolean('is-mmkv-fast-asf') // true

Hooks

const [username, setUsername] = useMMKVString('user.name')
const [age, setAge] = useMMKVNumber('user.age')
const [isMmkvFastAsf, setIsMmkvFastAf] = useMMKVBoolean('is-mmkv-fast-asf')

Keys

// checking if a specific key exists
const hasUsername = storage.contains('user.name')

// getting all keys
const keys = storage.getAllKeys() // ['user.name', 'user.age', 'is-mmkv-fast-asf']

// delete a specific key + value
const wasRemoved = storage.remove('user.name')

// delete all keys
storage.clearAll()

Objects

const user = {
  username: 'Marc',
  age: 21
}

// Serialize the object into a JSON string
storage.set('user', JSON.stringify(user))

// Deserialize the JSON string into an object
const jsonUser = storage.getString('user') // { 'username': 'Marc', 'age': 21 }
const userObject = JSON.parse(jsonUser)

Encryption

// encrypt all data with a private key
storage.recrypt('hunter2')

// remove encryption
storage.recrypt(undefined)

Buffers

const buffer = new ArrayBuffer(3)
const dataWriter = new Uint8Array(buffer)
dataWriter[0] = 1
dataWriter[1] = 100
dataWriter[2] = 255
storage.set('someToken', buffer)

const buffer = storage.getBuffer('someToken')
console.log(buffer) // [1, 100, 255]

Size

// get size of MMKV storage in bytes
const size = storage.size
if (size >= 4096) {
  // clean unused keys and clear memory cache
  storage.trim()
}

Importing all data from another MMKV instance

To import all keys and values from another MMKV instance, use importAllFrom(...):

const storage = createMMKV(...)
const otherStorage = createMMKV(...)

const importedCount = storage.importAllFrom(otherStorage)

Check if an MMKV instance exists

To check if an MMKV instance exists, use existsMMKV(...):

import { existsMMKV } from 'react-native-mmkv'

const exists = existsMMKV('my-instance')

Delete an MMKV instance

To delete an MMKV instance, use deleteMMKV(...):

import { deleteMMKV } from 'react-native-mmkv'

const wasDeleted = deleteMMKV('my-instance')