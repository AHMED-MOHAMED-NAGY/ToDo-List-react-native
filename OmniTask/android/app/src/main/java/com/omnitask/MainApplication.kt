package com.omnitask

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.omnitask.floatingwidget.FloatingWidgetPackage
import com.omnitask.speech.SpeechToTextPackage
import com.omnitask.calendar.CalendarSyncPackage

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // OmniTask custom native modules
          add(FloatingWidgetPackage())
          add(SpeechToTextPackage())
          add(CalendarSyncPackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}
