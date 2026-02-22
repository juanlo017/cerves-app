import { View, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Theme } from '@/constants/Theme';
import { Typography } from './Typography';
import { Card } from './Card';
import type { InvitationWithDetails } from '@/lib/api/invitations';

interface InvitationItemProps {
  invitation: InvitationWithDetails;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

export function InvitationItem({ invitation, onAccept, onDecline }: InvitationItemProps) {
  const inviterName = invitation.inviter_player?.display_name || 'Desconocido';
  const groupName = invitation.groups?.name || 'Grupo';

  return (
    <Card style={styles.card}>
      <View style={styles.info}>
        <Typography variant="body" style={styles.groupName}>
          {groupName}
        </Typography>
        <Typography variant="caption" style={styles.inviterText}>
          Invitado por {inviterName}
        </Typography>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => onAccept(invitation.id)}
        >
          <Typography variant="caption" style={styles.buttonText}>
            ACEPTAR
          </Typography>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.declineButton}
          onPress={() => onDecline(invitation.id)}
        >
          <Typography variant="caption" style={styles.buttonText}>
            RECHAZAR
          </Typography>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create<{
  card: ViewStyle;
  info: ViewStyle;
  groupName: TextStyle;
  inviterText: TextStyle;
  actions: ViewStyle;
  acceptButton: ViewStyle;
  declineButton: ViewStyle;
  buttonText: TextStyle;
}>({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 0,
    marginVertical: Theme.spacing.xs,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
  },
  info: {
    flex: 1,
    marginRight: Theme.spacing.sm,
  },
  groupName: {
    fontWeight: 'bold',
    marginBottom: Theme.spacing.xs,
  },
  inviterText: {
    color: Theme.colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: Theme.colors.success,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    marginRight: Theme.spacing.xs,
  },
  declineButton: {
    backgroundColor: Theme.colors.error,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  buttonText: {
    color: Theme.colors.text,
    fontSize: 8,
  },
});
