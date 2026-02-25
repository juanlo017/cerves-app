import { useState, useEffect } from 'react';
import {
  Modal, View, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Platform, ViewStyle, TextStyle,
} from 'react-native';
import { Theme } from '@/constants/Theme';
import { Typography } from './Typography';
import { Card } from './Card';
import { groupsApi, type Group, type GroupMemberWithPlayer } from '@/lib/api/groups';
import { invitationsApi } from '@/lib/api/invitations';

type ModalMode = 'create' | 'join' | 'view';

interface GroupManageModalProps {
  visible: boolean;
  onClose: () => void;
  group: Group | null;
  currentUserId: string;
  isLeader: boolean;
  onGroupCreated?: (group: Group) => void;
  onGroupDeleted?: (groupId: string) => void;
  onGroupJoined?: (group: Group) => void;
}

export function GroupManageModal({
  visible, onClose, group, currentUserId, isLeader,
  onGroupCreated, onGroupDeleted, onGroupJoined,
}: GroupManageModalProps) {
  const [mode, setMode] = useState<ModalMode>(group ? 'view' : 'create');
  const [groupName, setGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [editName, setEditName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [members, setMembers] = useState<GroupMemberWithPlayer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; user_id: string; display_name: string; avatar_key: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (group) {
        setMode('view');
        setEditName(group.name);
        loadMembers();
      } else {
        setMode('create');
      }
      setGroupName('');
      setJoinCode('');
      setSearchQuery('');
      setSearchResults([]);
      setIsEditing(false);
    }
  }, [visible, group]);

  const loadMembers = async () => {
    if (!group) return;
    const data = await groupsApi.getMembers(group.id);
    setMembers(data);
  };

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    setIsLoading(true);
    try {
      const newGroup = await groupsApi.create(groupName.trim(), currentUserId);
      onGroupCreated?.(newGroup);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el grupo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) return;
    setIsLoading(true);
    try {
      const joinedGroup = await groupsApi.joinByCode(joinCode.trim(), currentUserId);
      onGroupJoined?.(joinedGroup);
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo unir al grupo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditName = async () => {
    if (!group || !editName.trim()) return;
    setIsLoading(true);
    try {
      await groupsApi.update(group.id, { name: editName.trim() });
      setIsEditing(false);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el grupo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!group) return;

    const doDelete = async () => {
      try {
        await groupsApi.delete(group.id);
        onGroupDeleted?.(group.id);
        onClose();
      } catch (error) {
        Alert.alert('Error', 'No se pudo eliminar el grupo');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Seguro que quieres eliminar "${group.name}"? Esta accion no se puede deshacer.`)) {
        await doDelete();
      }
    } else {
      Alert.alert(
        'Eliminar grupo',
        `Seguro que quieres eliminar "${group.name}"? Esta accion no se puede deshacer.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: doDelete },
        ]
      );
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const memberUserIds = members.map(m => m.user_id);
    const results = await invitationsApi.searchPlayers(query, memberUserIds);
    setSearchResults(results);
  };

  const handleInvite = async (targetUserId: string) => {
    if (!group) return;
    try {
      await invitationsApi.create(group.id, currentUserId, targetUserId);
      setSearchResults(prev => prev.filter(p => p.user_id !== targetUserId));
      Alert.alert('Invitacion enviada');
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la invitacion');
    }
  };

  const renderCreateMode = () => (
    <>
      <Typography variant="h3" align="center" style={styles.title}>
        CREAR GRUPO
      </Typography>

      <TextInput
        style={styles.input}
        placeholder="Nombre del grupo"
        placeholderTextColor={Theme.colors.textMuted}
        value={groupName}
        onChangeText={setGroupName}
        autoFocus
      />

      <TouchableOpacity
        style={[styles.primaryButton, !groupName.trim() && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={!groupName.trim() || isLoading}
      >
        <Typography variant="caption" style={styles.primaryButtonText}>
          {isLoading ? 'CREANDO...' : 'CREAR'}
        </Typography>
      </TouchableOpacity>

      <View style={styles.divider} />

      <Typography variant="h3" align="center" style={styles.title}>
        UNIRSE POR CODIGO
      </Typography>

      <TextInput
        style={styles.input}
        placeholder="Codigo del grupo"
        placeholderTextColor={Theme.colors.textMuted}
        value={joinCode}
        onChangeText={setJoinCode}
        autoCapitalize="characters"
      />

      <TouchableOpacity
        style={[styles.secondaryButton, !joinCode.trim() && styles.buttonDisabled]}
        onPress={handleJoinByCode}
        disabled={!joinCode.trim() || isLoading}
      >
        <Typography variant="caption" style={styles.secondaryButtonText}>
          {isLoading ? 'UNIENDOSE...' : 'UNIRSE'}
        </Typography>
      </TouchableOpacity>
    </>
  );

  const renderViewMode = () => {
    if (!group) return null;

    return (
      <>
        {/* Header with name and code */}
        <View style={styles.viewHeader}>
          {isEditing ? (
            <View style={styles.editRow}>
              <TextInput
                style={[styles.input, styles.editInput]}
                value={editName}
                onChangeText={setEditName}
                autoFocus
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleEditName}>
                <Typography variant="caption" style={styles.primaryButtonText}>OK</Typography>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.nameRow}>
              <Typography variant="body" style={styles.groupTitle}>
                {group.name}
              </Typography>
              {isLeader && (
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Typography variant="body">✏️</Typography>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.codeRow}>
            <Typography variant="caption" color={Theme.colors.textSecondary}>
              CÓDIGO:
            </Typography>
            <Typography variant="body" color={Theme.colors.secondary} style={styles.codeText}>
              {group.code}
            </Typography>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Members list */}
        <Typography variant="body" style={styles.sectionTitle}>
          MIEMBROS ({members.length})
        </Typography>

        <ScrollView style={styles.membersList}>
          {members.map((member) => (
            <View key={member.id} style={styles.memberItem}>
              <Typography variant="body" style={styles.memberAvatar}>
                {member.players.avatar_key === 'avatar_beer' ? '🍺' :
                 member.players.avatar_key === 'avatar_wine' ? '🍷' :
                 member.players.avatar_key === 'avatar_cocktail' ? '🍸' : '🍺'}
              </Typography>
              <Typography variant="caption" style={styles.memberName}>
                {member.players.display_name}
              </Typography>
              {member.role === 'leader' && (
                <View style={styles.roleBadge}>
                  <Typography variant="caption" style={styles.roleBadgeText}>LIDER</Typography>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Leader actions: Invite */}
        {isLeader && (
          <>
            <View style={styles.divider} />

            <Typography variant="h3" style={styles.sectionTitle}>
              INVITAR
            </Typography>

            <TextInput
              style={styles.input}
              placeholder="Buscar jugador..."
              placeholderTextColor={Theme.colors.textMuted}
              value={searchQuery}
              onChangeText={handleSearch}
            />

            {searchResults.length === 0 && searchQuery.length > 0 && (
              <Typography variant="caption" color={Theme.colors.textMuted} align="center" style={{ marginVertical: Theme.spacing.sm }}>
                No se han encontrado usuarios
              </Typography>
            )}
            {searchResults.map((player) => (
              <View key={player.id} style={styles.searchResultItem}>
                <Typography variant="caption" style={styles.memberName}>
                  {player.display_name}
                </Typography>
                <TouchableOpacity
                  style={styles.inviteButton}
                  onPress={() => handleInvite(player.user_id)}
                >
                  <Typography variant="caption" style={styles.primaryButtonText}>
                    INVITAR
                  </Typography>
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.divider} />

            {/* Delete group */}
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Typography variant="caption" style={styles.deleteButtonText}>
                ELIMINAR GRUPO
              </Typography>
            </TouchableOpacity>
          </>
        )}
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity activeOpacity={1}>
            <Card style={styles.modalCard}>
              {/* Close button */}
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Typography variant="h2" style={styles.closeText}>x</Typography>
              </TouchableOpacity>

              <ScrollView showsVerticalScrollIndicator={false}>
                {mode === 'view' ? renderViewMode() : renderCreateMode()}
              </ScrollView>
            </Card>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create<{
  overlay: ViewStyle;
  modalContainer: ViewStyle;
  modalCard: ViewStyle;
  closeButton: ViewStyle;
  closeText: TextStyle;
  title: TextStyle;
  input: TextStyle;
  primaryButton: ViewStyle;
  primaryButtonText: TextStyle;
  secondaryButton: ViewStyle;
  secondaryButtonText: TextStyle;
  buttonDisabled: ViewStyle;
  divider: ViewStyle;
  viewHeader: ViewStyle;
  nameRow: ViewStyle;
  groupTitle: TextStyle;
  editRow: ViewStyle;
  editInput: TextStyle;
  saveButton: ViewStyle;
  codeRow: ViewStyle;
  codeText: TextStyle;
  sectionTitle: TextStyle;
  membersList: ViewStyle;
  memberItem: ViewStyle;
  memberAvatar: TextStyle;
  memberName: TextStyle;
  roleBadge: ViewStyle;
  roleBadgeText: TextStyle;
  searchResultItem: ViewStyle;
  inviteButton: ViewStyle;
  deleteButton: ViewStyle;
  deleteButtonText: TextStyle;
}>({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.md,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modalCard: {
    maxHeight: 600,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: Theme.spacing.xs,
    zIndex: 1,
  },
  closeText: {
    color: '#FF4444',
    fontSize: 24,
    lineHeight: 24,
  },
  title: {
    marginBottom: Theme.spacing.md,
  },
  input: {
    backgroundColor: Theme.colors.background,
    color: Theme.colors.text,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    fontFamily: Theme.fonts.pixel,
    fontSize: Theme.fontSize.xs,
    marginBottom: Theme.spacing.sm,
  },
  primaryButton: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  primaryButtonText: {
    color: Theme.colors.background,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: Theme.colors.secondary,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  secondaryButtonText: {
    color: Theme.colors.background,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: Theme.spacing.md,
  },
  viewHeader: {
    marginTop: Theme.spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  groupTitle: {
    flex: 1,
  },
  editRow: {
    flexDirection: 'column',
    marginBottom: Theme.spacing.sm,
  },
  editInput: {
    marginBottom: Theme.spacing.sm,
  },
  saveButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeText: {
    marginLeft: Theme.spacing.sm,
    letterSpacing: 2,
  },
  sectionTitle: {
    marginBottom: Theme.spacing.sm,
  },
  membersList: {
    maxHeight: 200,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.sm,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.xs,
  },
  memberAvatar: {
    fontSize: 16,
    marginRight: Theme.spacing.sm,
  },
  memberName: {
    flex: 1,
  },
  roleBadge: {
    backgroundColor: Theme.colors.secondary,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
  },
  roleBadgeText: {
    color: Theme.colors.background,
    fontSize: 7,
    fontWeight: 'bold',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.sm,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.xs,
  },
  inviteButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  deleteButton: {
    backgroundColor: Theme.colors.error,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: Theme.colors.text,
    fontWeight: 'bold',
  },
});
