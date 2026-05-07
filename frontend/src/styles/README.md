# Njangi-Sure Centralized Styles Guide

All styling for the Njangi-Sure mobile app is now centralized in the `src/styles/` folder to maintain consistency, improve maintainability, and reduce code duplication.

## 📂 File Structure

```
src/styles/
├── index.js           # Global utility styles
├── screens.js         # Screen-specific styles
└── styles.css         # CSS reference (for documentation)
```

## 🎨 Style Modules

### 1. **index.js** - Global Utilities

Contains reusable style utilities for:
- Global layout (`globalStyles`)
- Typography (`textStyles`)
- Spacing utilities (`spacing`)
- Button styles (`buttonStyles`)
- Input styles (`inputStyles`)
- Card styles (`cardStyles`)
- Header styles (`headerStyles`)
- Avatar styles (`avatarStyles`)
- Badge styles (`badgeStyles`)
- Divider styles (`dividerStyles`)
- Empty state styles (`emptyStateStyles`)
- Modal styles (`modalStyles`)

**Usage:**
```javascript
import { 
  textStyles, 
  buttonStyles, 
  spacing 
} from '../styles/index.js';

<Text style={textStyles.h1}>Title</Text>
<TouchableOpacity style={buttonStyles.primary}>
  <Text style={buttonStyles.h4}>Button</Text>
</TouchableOpacity>
```

### 2. **screens.js** - Screen-Specific Styles

Contains all extracted styles organized by screen:
- `onboardingScreenStyles`
- `splashScreenStyles`
- `authScreenStyles` (Login, Register, ForgotPassword)
- `homeScreenStyles`
- `paymentScreenStyles`
- `groupScreenStyles`
- `chatScreenStyles`
- `profileScreenStyles`

**Usage:**
```javascript
import { authScreenStyles } from '../styles/screens.js';

export default function LoginScreen() {
  return (
    <KeyboardAvoidingView style={authScreenStyles.container}>
      <LinearGradient style={authScreenStyles.header}>
        {/* ... */}
      </LinearGradient>
      <View style={authScreenStyles.form}>
        {/* ... */}
      </View>
    </KeyboardAvoidingView>
  );
}
```

## 🔄 Migration Guide

### Before (Old Pattern - Inline Styles):
```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../utils/theme';

export default function MyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  title: { fontFamily: FONTS.bold, fontSize: 24, color: COLORS.gray700 },
});
```

### After (New Pattern - Centralized Styles):
```javascript
import React from 'react';
import { View, Text } from 'react-native';
import { screenStyles } from '../styles/screens.js';

export default function MyScreen() {
  return (
    <View style={screenStyles.container}>
      <Text style={screenStyles.title}>Hello</Text>
    </View>
  );
}
```

## 📝 How to Add New Styles

1. **For global utilities**, add to `src/styles/index.js`:
```javascript
export const newUtility = StyleSheet.create({
  style1: { /* definitions */ },
  style2: { /* definitions */ },
});
```

2. **For screen-specific styles**, add to `src/styles/screens.js`:
```javascript
export const myScreenStyles = StyleSheet.create({
  container: { /* definitions */ },
  header: { /* definitions */ },
});
```

3. **Export the new styles** in the respective file's export statement

4. **Import and use** in your screen:
```javascript
import { myScreenStyles } from '../styles/screens.js';
```

## 🎯 Best Practices

1. **Use global utilities** for common patterns (buttons, inputs, cards)
2. **Use screen-specific styles** for unique screen layouts
3. **Keep theme values** in `src/utils/theme.js` for colors, fonts, spacing
4. **Avoid inline styles** - use the centralized modules
5. **Group related styles** together in StyleSheet.create()
6. **Name styles descriptively** - use `container`, `header`, `title`, etc.

## 🔗 Linked CSS File

A CSS reference file (`styles.css`) is provided for documentation purposes and Tailwind-like utility naming conventions. While React Native doesn't directly use CSS, the file serves as:
- Visual reference of all available utilities
- Documentation of color palette and spacing system
- Template for web version (if needed)

## 📚 Common Style Combinations

### Button with Icon:
```javascript
<TouchableOpacity style={[buttonStyles.primary, { flexDirection: 'row' }]}>
  <Ionicons name="add" size={18} color={COLORS.white} />
  <Text style={buttonStyles.primaryText}>Add Group</Text>
</TouchableOpacity>
```

### Card with Header:
```javascript
<View style={cardStyles.base}>
  <View style={cardStyles.header}>
    <Text style={cardStyles.title}>Title</Text>
    <Icon />
  </View>
  {/* Card content */}
</View>
```

### Input with Label:
```javascript
<View style={inputStyles.wrapper}>
  <Text style={inputStyles.label}>Email</Text>
  <View style={inputStyles.inputWrapper}>
    <Icon />
    <TextInput style={inputStyles.input} />
  </View>
</View>
```

## ✅ Next Steps

1. Gradually refactor all screens to use centralized styles
2. Remove inline `StyleSheet.create()` calls from screen files
3. Extract any missed styles and add to `screens.js`
4. Monitor performance improvements and consistency gains

## 📞 Support

For questions or issues related to styles, refer to:
- `src/utils/theme.js` - Color, font, and spacing definitions
- `src/styles/index.js` - Global utilities
- `src/styles/screens.js` - Screen-specific styles
