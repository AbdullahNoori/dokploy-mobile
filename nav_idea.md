create a nav_theme_props

export default function Layout() {
const { theme } = useUnistyles()

    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: theme.colors.background
                }
            }}
        >
            <Stack.Screen name="home" />
        </Stack>
    )

}

```

- **define all the props and values, like**
 headerStyle: {
    backgroundColor: theme.colors.background
}

and spread that in all _layout, for a consistent, and runtime update of themes
```
