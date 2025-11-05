// src/Styles/TweetDetailScreen.styles.js
import { StyleSheet } from 'react-native';
import { colors, typography } from './theme';

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textLight,
    fontSize: typography.subtitle,
  },
});