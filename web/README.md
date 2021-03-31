# Installation

## key generation
Generate keys for https
### Linux
```sh
mkdir keys
cd keys
openssl req -x509 -newkey rsa:2048 -keyout keytmp.pem -out cert.pem -days 365
openssl rsa -in keytmp.pem -out key.pem
```

### Windows
```cmd
mkdir keys
cd keys
"C:\Program Files\Git\usr\bin\openssl.exe" req -x509 -newkey rsa:2048 -keyout keytmp.pem -out cert.pem -days 365
"C:\Program Files\Git\usr\bin\openssl.exe" rsa -in keytmp.pem -out key.pem
```

## Dev
```sh
yarn install
```

## Production
```sh
yarn install --production
```

# Building
```sh
yarn build
```

# Running
When running don't forget to provide the COM port where the arduino is connected.
```
node . COMPORT
```
