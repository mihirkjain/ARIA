import Foundation

/// Device model for ARIA cross-device sync
struct Device: Identifiable, Codable {
    let id: String
    let deviceName: String
    let deviceType: DeviceType
    let osVersion: String
    var online: Bool = false
    var lastSeen: Date?

    enum DeviceType: String, Codable {
        case desktop
        case mobile
        case tablet
        case web
    }

    enum CodingKeys: String, CodingKey {
        case id = "device_id"
        case deviceName = "device_name"
        case deviceType = "device_type"
        case osVersion = "os_version"
        case online
        case lastSeen = "last_seen"
    }
}

/// Local device identification
class LocalDevice {
    static let shared = LocalDevice()

    let deviceId: String
    let deviceName: String = UIDevice.current.name
    let deviceType: Device.DeviceType = .mobile
    let osVersion: String = UIDevice.current.systemVersion

    private init() {
        if let saved = UserDefaults.standard.string(forKey: "aria_device_id") {
            self.deviceId = saved
        } else {
            let newId = UUID().uuidString
            UserDefaults.standard.set(newId, forKey: "aria_device_id")
            self.deviceId = newId
        }
    }
}

/// Message model for chat sync
struct Message: Identifiable, Codable {
    let id: String
    let userId: String
    let deviceId: String
    let content: String
    let timestamp: Date
    let sender: String // "user" or "assistant"

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case deviceId = "device_id"
        case content
        case timestamp
        case sender
    }
}

/// System command model
struct SystemCommand: Identifiable, Codable {
    let id: String
    let userId: String
    let targetDevice: String
    let commandType: String
    let commandData: [String: AnyCodable]
    let timestamp: Date

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case targetDevice = "target_device"
        case commandType = "command_type"
        case commandData = "command_data"
        case timestamp
    }
}

/// Helper for encoding/decoding dynamic JSON
struct AnyCodable: Codable {
    let value: Any

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()

        if container.decodeNil() {
            self.value = NSNull()
        } else if let bool = try? container.decode(Bool.self) {
            self.value = bool
        } else if let int = try? container.decode(Int.self) {
            self.value = int
        } else if let double = try? container.decode(Double.self) {
            self.value = double
        } else if let string = try? container.decode(String.self) {
            self.value = string
        } else if let array = try? container.decode([AnyCodable].self) {
            self.value = array.map { $0.value }
        } else if let dict = try? container.decode([String: AnyCodable].self) {
            self.value = dict.mapValues { $0.value }
        } else {
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "AnyCodable value cannot be decoded")
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()

        switch value {
        case is NSNull:
            try container.encodeNil()
        case let bool as Bool:
            try container.encode(bool)
        case let int as Int:
            try container.encode(int)
        case let double as Double:
            try container.encode(double)
        case let string as String:
            try container.encode(string)
        case let array as [Any]:
            try container.encode(array.map { AnyCodable(value: $0) })
        case let dict as [String: Any]:
            try container.encode(dict.mapValues { AnyCodable(value: $0) })
        default:
            throw EncodingError.invalidValue(value, EncodingError.Context(codingPath: [], debugDescription: "AnyCodable value is invalid"))
        }
    }
}
