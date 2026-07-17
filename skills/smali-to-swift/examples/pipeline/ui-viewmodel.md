# Step 4: UI & ViewModel Reconstruction (Per Screen) 🎨

**Input:** Storyboard analysis + class-dump headers for ViewControllers.

## Tasks

### 1. Resource Extraction (On-Demand)

- Extract only images, colors, strings for current screen
- Use Asset Catalog for organized resources
- Map ObjC string tables to `Localizable.xcstrings`

### 2. UIKit → SwiftUI Migration

```
UIViewController          → SwiftUI View struct
UINavigationController    → NavigationStack
UITabBarController        → TabView
UITableView               → List / LazyVStack
UICollectionView          → LazyVGrid / LazyHGrid
UIScrollView              → ScrollView
UIImageView               → AsyncImage / Image
UILabel                   → Text
UITextField               → TextField
UIButton                  → Button
UIActivityIndicatorView   → ProgressView
UIAlertController         → .alert / .confirmationDialog modifier
UIPageViewController      → TabView(.page)
UIStackView               → VStack / HStack
MKMapView                 → Map (MapKit SwiftUI)
WKWebView                 → WebView (custom wrapper)
UIRefreshControl          → .refreshable modifier
UISearchController        → .searchable modifier
```

### 3. ViewModel Creation

```swift
@Observable
final class LoginViewModel {
    var email = ""
    var password = ""
    var isLoading = false
    var error: String?
    
    private let loginUseCase: LoginUseCase
    
    init(loginUseCase: LoginUseCase) {
        self.loginUseCase = loginUseCase
    }
    
    func login() async {
        isLoading = true
        defer { isLoading = false }
        do {
            try await loginUseCase.execute(email: email, password: password)
        } catch {
            self.error = error.localizedDescription
        }
    }
}
```

### 4. Screen Composable

```swift
struct LoginScreen: View {
    @State private var viewModel: LoginViewModel
    
    init(loginUseCase: LoginUseCase) {
        _viewModel = State(initialValue: LoginViewModel(loginUseCase: loginUseCase))
    }
    
    var body: some View {
        Form {
            TextField("Email", text: $viewModel.email)
                .textContentType(.emailAddress)
                .keyboardType(.emailAddress)
            
            SecureField("Password", text: $viewModel.password)
                .textContentType(.password)
            
            Button("Login") {
                Task { await viewModel.login() }
            }
            .disabled(viewModel.isLoading)
        }
        .overlay { if viewModel.isLoading { ProgressView() } }
        .alert("Error", isPresented: .constant(viewModel.error != nil)) {
            Button("OK") { viewModel.error = nil }
        } message: {
            Text(viewModel.error ?? "")
        }
    }
}
```
