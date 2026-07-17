package com.example.app.utils

import android.annotation.TargetApi
import android.content.Context
import android.content.ContextWrapper
import android.content.res.Configuration
import android.content.res.Resources
import android.os.Build
import android.os.LocaleList
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.os.LocaleListCompat
import java.util.Locale

/**
 * Helper class to manage dynamic application locale changes.
 * Supports legacy and modern Android APIs.
 */
object LocaleHelper {

    private const val SELECTED_LANGUAGE = "Locale.Helper.Selected.Language"

    /**
     * Set language dynamically.
     * Recommends using Android 13+ standard per-app language API where applicable,
     * with configuration context wrapper fallback for standard components.
     */
    fun setLocale(context: Context, languageCode: String): Context {
        persist(context, languageCode)

        // For modern Android apps using AppCompat (supports Android 13+ per-app language natively)
        val localeList = LocaleListCompat.forLanguageTags(languageCode)
        AppCompatDelegate.setApplicationLocales(localeList)

        return updateResources(context, languageCode)
    }

    /**
     * Wraps the context to force selected locale.
     * Must be called in Activity.attachBaseContext(newBase) to apply changes.
     */
    fun wrapContext(context: Context): ContextWrapper {
        val savedLang = getPersistedLanguage(context, Locale.getDefault().language)
        return ContextWrapper(updateResources(context, savedLang))
    }

    private fun updateResources(context: Context, language: String): Context {
        val locale = Locale(language)
        Locale.setDefault(locale)

        val res: Resources = context.resources
        val config: Configuration = res.configuration

        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            setLocaleForApi24(context, config, locale)
        } else {
            setLocaleLegacy(context, config, locale)
        }
    }

    @TargetApi(Build.VERSION_CODES.N)
    private fun setLocaleForApi24(context: Context, config: Configuration, locale: Locale): Context {
        val localeList = LocaleList(locale)
        LocaleList.setDefault(localeList)
        config.setLocales(localeList)
        return context.createConfigurationContext(config)
    }

    @Suppress("DEPRECATION")
    private fun setLocaleLegacy(context: Context, config: Configuration, locale: Locale): Context {
        config.locale = locale
        context.resources.updateConfiguration(config, context.resources.displayMetrics)
        return context
    }

    private fun persist(context: Context, language: String) {
        val preferences = context.getSharedPreferences(LocaleHelper::class.java.name, Context.MODE_PRIVATE)
        preferences.edit().putString(SELECTED_LANGUAGE, language).apply()
    }

    fun getPersistedLanguage(context: Context, defaultLanguage: String): String {
        val preferences = context.getSharedPreferences(LocaleHelper::class.java.name, Context.MODE_PRIVATE)
        return preferences.getString(SELECTED_LANGUAGE, defaultLanguage) ?: defaultLanguage
    }
}
