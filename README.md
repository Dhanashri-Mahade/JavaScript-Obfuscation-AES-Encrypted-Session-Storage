# 🚀 React Production Security Setup

### **JavaScript Obfuscation + AES Encrypted Session Storage**

This document explains how to secure your React production build by:

* 🔒 Obfuscating all JavaScript files
* ❌ Removing .map files
* 🔐 Encrypting user data (token, id, email, etc.) in sessionStorage
* ⚡ No breaking changes in components (all userData usage same as before)

---

## 📂 **1. Install Required Packages**

### JavaScript Obfuscator (for build)

```sh
npm install javascript-obfuscator --save-dev
```

### CryptoJS (for encrypting stored user data)

```sh
npm install crypto-js
```

---

## 🛑 **2. Disable Source Maps**

Create a file in root:

```
.env
```

Add:

```
GENERATE_SOURCEMAP=false
```

This prevents React from generating readable `.map` files.

---

## 🔧 **3. Add Obfuscation Script**

Create file:

```
scripts/obfuscate.js
```

Paste this:

```js
const JavaScriptObfuscator = require("javascript-obfuscator");
const fs = require("fs");
const path = require("path");

const buildDir = path.join(__dirname, "../prod-build/static/js");

fs.readdirSync(buildDir).forEach((file) => {
  const filePath = path.join(buildDir, file);

  // DELETE .map FILES
  if (file.endsWith(".map")) {
    fs.unlinkSync(filePath);
    console.log("Deleted MAP:", file);
    return;
  }

  // OBFUSCATE ALL JS FILES
  if (file.endsWith(".js")) {
    const code = fs.readFileSync(filePath, "utf8");

    const obfuscated = JavaScriptObfuscator.obfuscate(code, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 1,
      stringArray: true,
      stringArrayEncoding: ["base64"],
      stringArrayThreshold: 1,
      disableConsoleOutput: true,
    });

    fs.writeFileSync(filePath, obfuscated.getObfuscatedCode());
    console.log(`Obfuscated: ${file}`);
  }
});
```

---

## 🏗 **4. Update Build Script**

In the project's `package.json`:

```json
"build:prod": "react-scripts build && move build prod-build && node scripts/obfuscate.js"
```

This will:

1. Create production React build
2. Move it to `prod-build`
3. Obfuscate all `.js` files
4. Delete all `.map` files

---

## 🔐 **5. Secure User Data With AES Encryption**

Open:

```
src/context/AuthContext.jsx
```

Replace code with:

```js
import React, { createContext, useContext, useState, useEffect } from "react";
import CryptoJS from "crypto-js";

const SECRET_KEY = "MJskfsdfa345923@df"; 

const AuthContext = createContext();

const encrypt = (data) =>
  CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();

const decrypt = (cipher) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (err) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(() => {
    const stored = sessionStorage.getItem("userData");
    return stored ? decrypt(stored) : null;
  });

  useEffect(() => {
    if (userData) {
      sessionStorage.setItem("userData", encrypt(userData));
    } else {
      sessionStorage.removeItem("userData");
    }
  }, [userData]);

  return (
    <AuthContext.Provider value={{ userData, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### ✔ **UserData remains readable inside code**

Example:

```js
const { userData } = useAuth();
console.log(userData.token);     // Works (actual token)
console.log(userData.id);        // prints actual decrypted id
console.log(userData.email);     // prints decrypted email
```

### ✔ **BUT in sessionStorage it is encrypted**

Example:

```
U2FsdGVkX1+9fasdfsdfsdf...==
```

Hacker cannot read token or personal data.

---

## 🧪 **6. Run Production Build + Test**

### Build:

```sh
npm run build:prod
```

### Serve locally:

```sh
serve -s prod-build
```

### Check:

* Open DevTools → Sources → JS files → unreadable (obfuscated)
* No `.map` files
* sessionStorage userData → encrypted

---

## 📌 Author Notes

This solution is written by me after studying multiple resources, testing everything step-by-step, and ensuring a fully working production setup.

Official CRA Documentation (Deployment Guide):
🔗 [https://cra.link/deployment](https://cra.link/deployment)

YouTube reference I used during research:
🔗 [https://youtu.be/ZRcV2xY7Xcg?si=Kg7YPZVLJvx4hFyF](https://youtu.be/ZRcV2xY7Xcg?si=Kg7YPZVLJvx4hFyF)


---

