import Foundation

public extension String {
    /// Returns the localized value for this key from the app's Localizable.strings.
    /// Usage:
    ///   let title = "welcome_message".localized
    ///
    /// - Parameters:
    ///   - bundle: Bundle containing localization resources (default: .main)
    ///   - comment: Developer comment, useful for context to translators
    /// - Returns: Localized string.
    var localized: String {
        NSLocalizedString(self, comment: "")
    }

    /// Returns localized string with a custom developer comment.
    /// - Parameters:
    ///   - comment: Context description for translators.
    func localized(comment: String) -> String {
        NSLocalizedString(self, comment: comment)
    }

    /// Returns localized string from a specific table.
    /// - Parameters:
    ///   - table: Table name, commonly "Localizable"
    ///   - bundle: Bundle containing resources (default: .main)
    func localized(table: String, bundle: Bundle = .main) -> String {
        NSLocalizedString(self, tableName: table, bundle: bundle, value: "", comment: "")
    }
}
