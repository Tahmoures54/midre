plugins {
    id("com.android.application")
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

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("debug")
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
