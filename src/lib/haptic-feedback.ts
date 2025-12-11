// import { useCallback } from 'react';
// import * as Haptics from 'expo-haptics';

// export function useHaptics() {
//   // Notification feedback: Success, Warning, Error
//   const notification = useCallback(
//     async (type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) => {
//       try {
//         await Haptics.notificationAsync(type);
//       } catch (err) {
//         console.warn('Haptics notification failed:', err);
//       }
//     },
//     []
//   );

//   // Impact feedback: Light, Medium, Heavy, Rigid, Soft
//   const impact = useCallback(
//     async (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
//       try {
//         await Haptics.impactAsync(style);
//       } catch (err) {
//         console.warn('Haptics impact failed:', err);
//       }
//     },
//     []
//   );

//   // Selection feedback: used for tab / filter changes
//   const selection = useCallback(async () => {
//     try {
//       await Haptics.selectionAsync();
//     } catch (err) {
//       console.warn('Haptics selection failed:', err);
//     }
//   }, []);

//   return { notification, impact, selection };
// }
