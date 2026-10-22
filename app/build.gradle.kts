plugins { id("com.android.application"); id("org.jetbrains.kotlin.android") }
android {
 namespace = "at.schachnova.app"
 compileSdk = 35
 defaultConfig { applicationId = "at.schachnova.app"; minSdk = 26; targetSdk = 35; versionCode = 1; versionName = "1.0.0-dev" }
 buildTypes { getByName("release") { isMinifyEnabled = false } }
 compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
 kotlinOptions { jvmTarget = "17" }
}

dependencies { implementation("androidx.webkit:webkit:1.12.1") }
