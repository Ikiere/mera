/**
 * MERA Custom Error Pop-up Modal
 * Reusable obsidian modal for authentication and input validation errors.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { Button } from './Button';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface ErrorModalProps {
  visible: boolean;
  title?: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  title = 'Notice',
  message,
  buttonText = 'Try Again',
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.cardContainer}>
          {/* Top Warning Icon Badge */}
          <View style={styles.iconBadge}>
            <Ionicons name="alert-circle" size={32} color={THEME.colors.error} />
          </View>

          {/* Error Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Error Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Dismiss Action Button */}
          <Button
            title={buttonText}
            variant="primary"
            size="md"
            onPress={onClose}
            style={styles.actionBtn}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  backdropTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardContainer: {
    width: Math.min(SCREEN_WIDTH - 48, 360),
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.32)',
    paddingVertical: 26,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: THEME.typography.weights.heavy,
    color: THEME.colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  actionBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
  },
});
