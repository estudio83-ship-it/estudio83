#!/bin/bash
set -eo pipefail
cd "$(dirname "$0")"
SDK=${ANDROID_HOME:-$HOME/android-sdk}; BT=$SDK/build-tools/34.0.0; AJ=$SDK/platforms/android-34/android.jar; O=build/manual
python3 -c "import re,sys;s=open(\"../radio-cilindro-standalone.html\",encoding=\"utf-8\").read();s=re.sub(r\"<link rel=\\\"(manifest|icon|apple-touch-icon)\\\"[^>]*>\\n\",\"\",s);s=re.sub(r\"<script>if\\(.serviceWorker[^\\n]*</script>\\n\",\"\",s);open(\"app/src/main/assets/index.html\",\"w\",encoding=\"utf-8\").write(s)"
rm -rf $O; mkdir -p $O/res $O/classes $O/dex $O/gen
sed 's#<manifest #<manifest package="ar.estudio83.radio" #' app/src/main/AndroidManifest.xml > $O/AndroidManifest.xml
$BT/aapt2 compile --dir app/src/main/res -o $O/res/res.zip
$BT/aapt2 link -I $AJ --manifest $O/AndroidManifest.xml -A app/src/main/assets -o $O/base.apk --java $O/gen \
  --min-sdk-version 24 --target-sdk-version 34 --version-code 1 --version-name 1.0 $O/res/res.zip
javac -nowarn -Xlint:-options --release 8 -classpath $AJ -d $O/classes $(find app/src/main/java $O/gen -name '*.java')
$BT/d8 --release --min-api 24 --lib $AJ --output $O/dex $(find $O/classes -name '*.class')
cp $O/base.apk $O/unsigned.apk; (cd $O/dex && zip -q ../unsigned.apk classes.dex)
$BT/zipalign -f -p 4 $O/unsigned.apk $O/aligned.apk
[ -f radio.keystore ] || keytool -genkeypair -keystore radio.keystore -alias radio -keyalg RSA -keysize 2048 -validity 10000 -storepass radio83 -keypass radio83 -dname "CN=Estudio83, C=AR"
$BT/apksigner sign --ks radio.keystore --ks-pass pass:radio83 --key-pass pass:radio83 --out RadioCilindro.apk $O/aligned.apk
$BT/apksigner verify RadioCilindro.apk && echo "OK: $(pwd)/RadioCilindro.apk"
