import java.util.Properties

plugins {
    id("com.android.application")
}

val keystorePropsFile = rootProject.file("signing/keystore.properties")
val keystoreProps = Properties()
if (keystorePropsFile.exists()) {
    keystorePropsFile.inputStream().use { keystoreProps.load(it) }
}

android {
    namespace = "app.medireminder"
    compileSdk = 35

    defaultConfig {
        applicationId = "app.medireminder"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "4.0.0"
    }

    signingConfigs {
        create("release") {
            val storeName = keystoreProps.getProperty("storeFile")
            require(!storeName.isNullOrBlank() && keystorePropsFile.exists()) {
                "Missing android/signing/keystore.properties — run scripts/ensure-apk-keystore.sh"
            }
            storeFile = rootProject.file("signing/$storeName")
            storePassword = keystoreProps.getProperty("storePassword")
            keyAlias = keystoreProps.getProperty("keyAlias")
            keyPassword = keystoreProps.getProperty("keyPassword")
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("release")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        buildConfig = false
    }
}

dependencies {
    implementation("androidx.webkit:webkit:1.12.1")
}
