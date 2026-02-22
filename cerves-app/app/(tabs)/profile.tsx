import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Theme } from '@/constants/Theme';
import { Typography } from '@/components/ui/Typography';
import { Card, InvitationItem, GroupManageModal } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { playersApi, groupsApi, invitationsApi } from '@/lib/api';
import type { Group } from '@/lib/api/groups';
import type { InvitationWithDetails } from '@/lib/api/invitations';

const AVATAR_MAP: Record<string, string> = {
  'avatar_beer': '🍺',
  'avatar_beers': '🍻',
  'avatar_wine': '🍷',
  'avatar_cocktail': '🍸',
  'avatar_tropical': '🍹',
  'avatar_champagne': '🥂',
  'avatar_bottle': '🍾',
  'avatar_juice': '🧃',
};

export default function ProfileScreen() {
  const { player, signOut } = useAuth();

  // Groups state
  const [groups, setGroups] = useState<Array<{ id: string; name: string; role: string; memberCount: number }>>([]);
  const [invitations, setInvitations] = useState<InvitationWithDetails[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedGroupRole, setSelectedGroupRole] = useState<string | null>(null);

  // Refresh data when screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (player) {
        loadGroups();
        loadInvitations();
      }
    }, [player])
  );

  const loadGroups = async () => {
    if (!player) return;
    try {
      const data = await playersApi.getGroups(player.id);
      const groupsWithMembers = await Promise.all(
        data.map(async (gm: any) => {
          const members = await groupsApi.getMembers(gm.groups.id);
          return {
            id: gm.groups.id,
            name: gm.groups.name,
            role: gm.role,
            memberCount: members.length,
          };
        })
      );
      setGroups(groupsWithMembers);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const loadInvitations = async () => {
    if (!player) return;
    try {
      const data = await invitationsApi.getPendingForUser(player.user_id);
      setInvitations(data);
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    if (!player) return;
    try {
      await invitationsApi.accept(invitationId, player.user_id);
      loadInvitations();
      loadGroups();
    } catch (error) {
      console.error('Error accepting invitation:', error);
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      await invitationsApi.decline(invitationId);
      loadInvitations();
    } catch (error) {
      console.error('Error declining invitation:', error);
    }
  };

  const handleOpenGroup = async (groupId: string) => {
    if (!player) return;
    const group = await groupsApi.getById(groupId);
    const role = await groupsApi.getMemberRole(groupId, player.user_id);
    setSelectedGroup(group);
    setSelectedGroupRole(role);
    setModalVisible(true);
  };

  const handleOpenCreateGroup = () => {
    setSelectedGroup(null);
    setSelectedGroupRole(null);
    setModalVisible(true);
  };

  const handleGroupCreated = () => {
    loadGroups();
  };

  const handleGroupJoined = () => {
    loadGroups();
  };

  const handleGroupDeleted = () => {
    loadGroups();
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Avatar & Name */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Typography variant="h1" style={styles.avatar}>
              {player?.avatar_key ? AVATAR_MAP[player.avatar_key] || '👤' : '👤'}
            </Typography>
          </View>

          <Typography variant="h2" style={styles.name}>
            {player?.display_name || 'Guest'}
          </Typography>
        </View>

        {/* Groups Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Typography variant="body" style={styles.sectionTitle}>
              MIS GRUPOS
            </Typography>
            <TouchableOpacity style={styles.newGroupButton} onPress={handleOpenCreateGroup}>
              <Typography variant="body" style={styles.newGroupButtonText}>
                + NUEVO
              </Typography>
            </TouchableOpacity>
          </View>

          {groups.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Typography variant="body" align="center" color={Theme.colors.textSecondary}>
                No perteneces a ningun grupo
              </Typography>
              <TouchableOpacity style={styles.createGroupButton} onPress={handleOpenCreateGroup}>
                <Typography variant="caption" style={styles.createGroupButtonText}>
                  CREAR O UNIRSE
                </Typography>
              </TouchableOpacity>
            </Card>
          ) : (
            groups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={styles.groupCard}
                onPress={() => handleOpenGroup(group.id)}
              >
                <View style={styles.groupInfo}>
                  <Typography variant="body" style={styles.groupName}>
                    {group.name}
                  </Typography>
                  <Typography variant="caption" color={Theme.colors.textSecondary}>
                    {group.memberCount} miembros
                  </Typography>
                </View>
                {group.role === 'leader' && (
                  <View style={styles.roleBadge}>
                    <Typography variant="caption" style={styles.roleBadgeText}>
                      LIDER
                    </Typography>
                  </View>
                )}
                <Typography variant="caption" color={Theme.colors.textMuted}>▶</Typography>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Invitations Section */}
        <View style={styles.section}>
          <Typography variant="body" style={styles.sectionTitle}>
            INVITACIONES {invitations.length > 0 ? `(${invitations.length})` : ''}
          </Typography>

          {invitations.length === 0 ? (
            <Typography variant="caption" color={Theme.colors.textMuted} align="center" style={{ marginVertical: Theme.spacing.sm }}>
              No tienes invitaciones pendientes
            </Typography>
          ) : (
            invitations.map((invitation) => (
              <InvitationItem
                key={invitation.id}
                invitation={invitation}
                onAccept={handleAcceptInvitation}
                onDecline={handleDeclineInvitation}
              />
            ))
          )}
        </View>

        {/* Sign Out */}
        <Pressable
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Typography variant="body" style={styles.signOutText}>
            CERRAR SESIÓN
          </Typography>
        </Pressable>
      </View>

      {/* Group Manage Modal */}
      {player && (
        <GroupManageModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          group={selectedGroup}
          currentUserId={player.user_id}
          isLeader={selectedGroupRole === 'leader'}
          onGroupCreated={handleGroupCreated}
          onGroupDeleted={handleGroupDeleted}
          onGroupJoined={handleGroupJoined}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    padding: Theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
    paddingVertical: Theme.spacing.xl,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Theme.colors.backgroundCard,
    borderWidth: 4,
    borderColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  avatar: {
    fontSize: 64,
  },
  name: {
    textAlign: 'center',
  },
  section: {
    marginBottom: Theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    color: Theme.colors.primary,
  },
  newGroupButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.md,
  },
  newGroupButtonText: {
    color: Theme.colors.background,
    fontSize: 8,
  },
  emptyCard: {
    marginHorizontal: 0,
    alignItems: 'center',
  },
  createGroupButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    marginTop: Theme.spacing.md,
  },
  createGroupButtonText: {
    color: Theme.colors.background,
    fontWeight: 'bold' as const,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.backgroundCard,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    marginBottom: Theme.spacing.xs,
  },
  roleBadge: {
    backgroundColor: Theme.colors.secondary,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
    marginRight: Theme.spacing.sm,
  },
  roleBadgeText: {
    color: Theme.colors.background,
    fontSize: 7,
    fontWeight: 'bold' as const,
  },
  infoCard: {
    backgroundColor: Theme.colors.backgroundCard,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  infoLabel: {
    color: Theme.colors.textMuted,
    marginBottom: Theme.spacing.xs,
  },
  infoValue: {
    color: Theme.colors.text,
  },
  signOutButton: {
    backgroundColor: Theme.colors.error,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    padding: Theme.spacing.md,
    alignItems: 'center',
    marginTop: Theme.spacing.xl,
  },
  signOutText: {
    color: Theme.colors.text,
  },
});
