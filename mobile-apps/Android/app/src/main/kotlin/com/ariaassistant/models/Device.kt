package com.ariaassistant.models

import android.os.Build
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import java.time.LocalDateTime
import java.util.UUID

/// Device model for ARIA cross-device sync
@Serializable
data class Device(
    @SerialName("device_id")
    val deviceId: String,

    @SerialName("device_name")
    val deviceName: String,

    @SerialName("device_type")
    val deviceType: String = "mobile",

    @SerialName("os_version")
    val osVersion: String,

    val online: Boolean = false,

    @SerialName("last_seen")
    val lastSeen: String? = null
)

/// Local device info
object LocalDevice {
    val deviceId: String = getOrCreateDeviceId()
    val deviceName: String = Build.DEVICE
    val deviceType: String = "mobile"
    val osVersion: String = Build.VERSION.RELEASE

    private fun getOrCreateDeviceId(): String {
        val sharedPref = android.content.Context.getSharedPreferences("aria", 0)
        var deviceId = sharedPref.getString("aria_device_id", null)

        if (deviceId == null) {
            deviceId = UUID.randomUUID().toString()
            sharedPref.edit().putString("aria_device_id", deviceId).apply()
        }

        return deviceId
    }
}

/// Message model for chat sync
@Serializable
data class Message(
    val id: String,

    @SerialName("user_id")
    val userId: String,

    @SerialName("device_id")
    val deviceId: String,

    val content: String,
    val timestamp: String,
    val sender: String // "user" or "assistant"
)

/// System command model
@Serializable
data class SystemCommand(
    val id: String,

    @SerialName("user_id")
    val userId: String,

    @SerialName("target_device")
    val targetDevice: String,

    @SerialName("command_type")
    val commandType: String,

    @SerialName("command_data")
    val commandData: Map<String, Any> = emptyMap(),

    val timestamp: String
)

/// File model
@Serializable
data class FileInfo(
    val name: String,
    @SerialName("is_dir")
    val isDir: Boolean,
    val size: Long,
    val modified: String
)
