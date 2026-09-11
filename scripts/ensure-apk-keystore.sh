#!/bin/sh
set -eu
cd "$(dirname "$0")/.."

DIR="android/signing"
PROPS="$DIR/keystore.properties"
P12="$DIR/yadavar-daru.p12"
PEM="$DIR/yadavar-daru.pem"

mkdir -p "$DIR"

if [ -f "$P12" ] && [ -f "$PROPS" ]; then
  echo "[apk] Reusing existing signing key at $P12"
  exit 0
fi

PASS="$(openssl rand -base64 36 | tr -d '/+=' | head -c 32)"

keytool -genkeypair \
  -keystore "$P12" \
  -storetype PKCS12 \
  -alias medireminder \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass "$PASS" \
  -keypass "$PASS" \
  -dname "CN=Yadavar Daru, OU=MediReminder, O=MediReminder, L=Tehran, C=IR"

printf '%s\n' \
  "storeFile=yadavar-daru.p12" \
  "storePassword=$PASS" \
  "keyAlias=medireminder" \
  "keyPassword=$PASS" \
  > "$PROPS"

keytool -exportcert -rfc \
  -keystore "$P12" \
  -alias medireminder \
  -storepass "$PASS" \
  -file "$PEM" >/dev/null

echo "[apk] Created signing key $P12 (valid ~27 years)"
