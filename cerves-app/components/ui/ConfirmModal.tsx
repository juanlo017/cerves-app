import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '@/constants/Theme';
import { Typography } from './Typography';
import { Card } from './Card';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'CONFIRMAR',
  cancelText = 'CANCELAR',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Card style={styles.card}>
            <Typography variant="h3" align="center" style={styles.title}>
              {title}
            </Typography>

            <Typography variant="body" align="center" color={Theme.colors.textSecondary} style={styles.message}>
              {message}
            </Typography>

            <View style={styles.buttons}>
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Typography variant="caption" style={styles.cancelText}>
                  {cancelText}
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmButton, destructive && styles.confirmDestructive]}
                onPress={onConfirm}
              >
                <Typography variant="caption" style={styles.confirmText}>
                  {confirmText}
                </Typography>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: 360,
  },
  card: {
    marginHorizontal: 0,
    marginVertical: 0,
  },
  title: {
    marginBottom: Theme.spacing.md,
  },
  message: {
    marginBottom: Theme.spacing.lg,
    lineHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.border,
  },
  cancelText: {
    color: Theme.colors.textSecondary,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
  },
  confirmDestructive: {
    backgroundColor: Theme.colors.error,
  },
  confirmText: {
    color: Theme.colors.text,
    fontWeight: 'bold',
  },
});
